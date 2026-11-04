import { NextResponse } from "next/server";
import { DISCORD_USER_COOKIE } from "@/lib/discord-auth";

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(DISCORD_USER_COOKIE);
  return response;
}
