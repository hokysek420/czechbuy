import { NextResponse } from "next/server";
import { getDiscordOAuthUrl, getDiscordImplicitOAuthUrl } from "@/lib/discord-auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();

  // If client secret is not configured, fallback to client-side implicit grant
  if (!clientSecret) {
    const implicitUrl = getDiscordImplicitOAuthUrl(baseUrl);
    return NextResponse.redirect(implicitUrl);
  }

  const oauthUrl = getDiscordOAuthUrl(baseUrl);
  return NextResponse.redirect(oauthUrl);
}
