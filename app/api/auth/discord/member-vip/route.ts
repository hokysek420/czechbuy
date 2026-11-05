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

  const vipStatus = await fetchGuildMemberVipStatus(targetUserId);

  // If this matches the logged in user, refresh their cookie session
  if (currentUser && currentUser.id === targetUserId) {
    const updatedUser: DiscordUser = {
      ...currentUser,
      isCzechBuyFam: vipStatus.isMember,
      isVip: vipStatus.isVip,
      roleName: vipStatus.roleName,
      roles: vipStatus.roles,
    };

    const res = NextResponse.json({
      success: true,
      vipStatus,
      user: updatedUser,
    });

    res.cookies.set(DISCORD_USER_COOKIE, JSON.stringify(updatedUser), {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });

    return res;
  }

  return NextResponse.json({
    success: true,
    vipStatus,
  });
}
