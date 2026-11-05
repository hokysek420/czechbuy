import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  fetchGuildMemberVipStatus,
  DISCORD_USER_COOKIE,
} from "@/lib/discord-auth";
import { DiscordUser } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  // If no userId in query, try to get from active session cookie
  let targetUserId = userId;
  const cookieStore = cookies();
  const rawCookie = cookieStore.get(DISCORD_USER_COOKIE)?.value;
  let currentUser: DiscordUser | null = null;

  if (rawCookie) {
    try {
      currentUser = JSON.parse(decodeURIComponent(rawCookie));
      if (!targetUserId && currentUser?.id) {
        targetUserId = currentUser.id;
      }
    } catch {}
  }

  if (!targetUserId) {
    return NextResponse.json(
      { error: "Chybí parametr userId a uživatel není přihlášen." },
      { status: 400 }
    );
  }

  const roleStatus = await fetchGuildMemberVipStatus(targetUserId);

  // If this matches the logged in user, refresh their cookie session
  if (currentUser && currentUser.id === targetUserId) {
    const updatedUser: DiscordUser = {
      ...currentUser,
      isCzechBuyFam: roleStatus.isMember,
      isVip: roleStatus.isVip,
      isOwner: roleStatus.isOwner,
      isAdmin: roleStatus.isAdmin,
      isMod: roleStatus.isMod,
      roleName: roleStatus.roleName,
      roleColor: roleStatus.roleColor,
      roles: roleStatus.roles,
      roleBadges: roleStatus.roleBadges,
    };

    const res = NextResponse.json({
      success: true,
      roleStatus,
      user: updatedUser,
    });

    res.cookies.set(DISCORD_USER_COOKIE, JSON.stringify(updatedUser), {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    // If user is Owner or Admin on Discord, ensure Admin Panel session is set
    if (roleStatus.isOwner || roleStatus.isAdmin) {
      res.cookies.set("czechbuy_admin_session", "authenticated_session_token", {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: true,
      });
      res.cookies.set("czechbuy_admin_token", "authenticated_session_token", {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: true,
      });
      res.cookies.set("czechbuy_admin_active", "true", {
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
        httpOnly: false,
      });
    }

    return res;
  }

  return NextResponse.json({
    success: true,
    roleStatus,
  });
}
