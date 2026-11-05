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

    // 3. Check real-time Discord Guild Member & VIP role status
    const vipStatus = await fetchGuildMemberVipStatus(rawUser.id);

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
      isCzechBuyFam: vipStatus.isMember,
      isVip: vipStatus.isVip,
      roleName: vipStatus.roleName,
      roles: vipStatus.roles,
      joinedAt: new Date().toISOString(),
    };

    const response = NextResponse.redirect(`${baseUrl}/prihlaseni?success=1`);

    // Set cookie for 30 days
    response.cookies.set(DISCORD_USER_COOKIE, JSON.stringify(discordUser), {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Discord OAuth error:", err);
    return NextResponse.redirect(`${baseUrl}/prihlaseni?error=${encodeURIComponent("Došlo k neočekávané chybě při přihlašování.")}`);
  }
}
