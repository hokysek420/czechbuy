import { NextResponse } from "next/server";
import {
  DISCORD_CLIENT_ID,
  DISCORD_USER_COOKIE,
  getDiscordAvatarUrl,
  getBaseUrl,
  fetchGuildMemberVipStatus,
} from "@/lib/discord-auth";
import { DiscordUser } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const baseUrl = getBaseUrl(request);

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/prihlaseni?error=${encodeURIComponent(error || "Chybějící autorizační kód")}`);
  }

  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
  if (!clientSecret) {
    return NextResponse.redirect(`${baseUrl}/prihlaseni?error=${encodeURIComponent("Server nemá nastavený DISCORD_CLIENT_SECRET.")}`);
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/discord/callback`;

    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: DISCORD_CLIENT_ID,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.text();
      console.error("Discord token exchange failed:", errData);
      return NextResponse.redirect(`${baseUrl}/prihlaseni?error=${encodeURIComponent("Nepodařilo se vyměnit Discord kód za přístupový token.")}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch Discord user profile
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(`${baseUrl}/prihlaseni?error=${encodeURIComponent("Nepodařilo se načíst profil uživatele z Discordu.")}`);
    }

    const rawUser = await userResponse.json();

    // 3. Check real-time Discord Guild Member & All role statuses (Owner, Admin, Mod, VIP, Člen)
    const roleStatus = await fetchGuildMemberVipStatus(rawUser.id);

    const discordUser: DiscordUser = {
      id: rawUser.id,
      username: rawUser.username,
      global_name: rawUser.global_name,
      discriminator: rawUser.discriminator,
      avatar: rawUser.avatar,
      avatarUrl: getDiscordAvatarUrl({
        id: rawUser.id,
        avatar: rawUser.avatar,
        discriminator: rawUser.discriminator,
      }),
      email: rawUser.email || null,
      verified: Boolean(rawUser.verified),
      isCzechBuyFam: roleStatus.isMember,
      isVip: roleStatus.isVip,
      isOwner: roleStatus.isOwner,
      isAdmin: roleStatus.isAdmin,
      isMod: roleStatus.isMod,
      roleName: roleStatus.roleName,
      roleColor: roleStatus.roleColor,
      roles: roleStatus.roles,
      roleBadges: roleStatus.roleBadges,
      joinedAt: new Date().toISOString(),
    };

    const isOwnerOrAdmin = Boolean(
      roleStatus.isOwner ||
      roleStatus.isAdmin ||
      rawUser.id === "1492628172611518504"
    );

    const redirectPath = isOwnerOrAdmin
      ? `${baseUrl}/interni-portal-8f2a9x/sprava`
      : `${baseUrl}/brzy-otevirame?logged=1`;

    const response = NextResponse.redirect(redirectPath);

    // Set user cookie for 30 days
    response.cookies.set(DISCORD_USER_COOKIE, JSON.stringify(discordUser), {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    // If user is Owner or Admin on Discord, also grant immediate Admin Panel access
    if (isOwnerOrAdmin) {
      response.cookies.set("czechbuy_admin_session", "authenticated_session_token", {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: true,
      });
      response.cookies.set("czechbuy_admin_token", "authenticated_session_token", {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: true,
      });
      response.cookies.set("czechbuy_admin_active", "true", {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: false,
      });
    }

    return response;
  } catch (err: any) {
    console.error("Discord OAuth error:", err);
    return NextResponse.redirect(`${baseUrl}/prihlaseni?error=${encodeURIComponent("Došlo k neočekávané chybě při přihlašování.")}`);
  }
}
