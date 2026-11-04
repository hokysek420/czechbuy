import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DISCORD_USER_COOKIE } from "@/lib/discord-auth";
import { DiscordUser } from "@/types";

export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = cookies();
  const rawCookie = cookieStore.get(DISCORD_USER_COOKIE)?.value;

  if (!rawCookie) {
    return NextResponse.json({ user: null, isLoggedIn: false });
  }

  try {
    const user: DiscordUser = JSON.parse(decodeURIComponent(rawCookie));
    return NextResponse.json({ user, isLoggedIn: true });
  } catch {
    return NextResponse.json({ user: null, isLoggedIn: false });
  }
}
