import { DiscordUser } from "@/types";

export const DISCORD_CLIENT_ID =
  process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ||
  process.env.DISCORD_CLIENT_ID ||
  "1558604485088256060";

export const DISCORD_GUILD_ID =
  process.env.DISCORD_GUILD_ID || "1567519231984271472";

export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";

// Role IDs on CzechBuy Discord Server
export const DISCORD_VIP_ROLE_ID =
  process.env.DISCORD_VIP_ROLE_ID || "1567522107393581176"; // "VIP Customer"

export const DISCORD_ADMIN_ROLE_ID =
  process.env.DISCORD_ADMIN_ROLE_ID || "1567522100523040914"; // "Founder / Admin"

export const DISCORD_USER_COOKIE = "czechbuy_discord_user";
export const DISCORD_USER_STORAGE_KEY = "czechbuy_discord_user_v1";

/**
 * Robust base URL resolver supporting proxies (Vercel, Cloudflare, etc.)
 * Defaults to https://www.czechbuy.com in production.
 */
export function getBaseUrl(request?: Request): string {
  if (request) {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const host = forwardedHost || request.headers.get("host");
    if (host) {
      const proto = forwardedProto || (host.includes("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  return "https://www.czechbuy.com";
}

/**
 * Returns formatted avatar URL for a Discord user
 */
export function getDiscordAvatarUrl(user: { id?: string; avatar?: string | null; discriminator?: string }): string {
  if (user?.id && user?.avatar) {
    const ext = user.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
  }
  // Default discord avatar fallback
  const index = user?.discriminator && user.discriminator !== "0"
    ? Number(user.discriminator) % 5
    : 0;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

/**
 * Fetches real-time VIP role status of a Discord member from the CzechBuy server.
 * Only users who have the official VIP Customer (or Founder/Admin) role receive VIP on the site.
 * Non-VIP members receive no role.
 */
export async function fetchGuildMemberVipStatus(userId: string): Promise<{
  isMember: boolean;
  isVip: boolean;
  roleName: string | null;
  roles: string[];
}> {
  if (!userId) {
    return { isMember: false, isVip: false, roleName: null, roles: [] };
  }

  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${userId}`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      return { isMember: false, isVip: false, roleName: null, roles: [] };
    }

    const member = await res.json();
    const roles: string[] = Array.isArray(member.roles) ? member.roles : [];

    const isVip =
      roles.includes(DISCORD_VIP_ROLE_ID) ||
      roles.includes(DISCORD_ADMIN_ROLE_ID);

    return {
      isMember: true,
      isVip,
      roleName: isVip ? "VIP" : null,
      roles,
    };
  } catch (err) {
    console.warn("[Discord Auth] Error fetching guild member:", err);
    return { isMember: false, isVip: false, roleName: null, roles: [] };
  }
}

/**
 * Builds the official Discord OAuth2 authorization URL
 */
export function getDiscordOAuthUrl(baseUrl?: string): string {
  const origin = baseUrl || getBaseUrl();
  const redirectUri = `${origin}/api/auth/discord/callback`;

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: "identify email guilds",
    prompt: "consent",
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

/**
 * Builds client-side implicit grant URL (response_type=token)
 * Useful when client_secret is not yet configured on the server
 */
export function getDiscordImplicitOAuthUrl(baseUrl?: string): string {
  const origin = baseUrl || getBaseUrl();
  const redirectUri = `${origin}/prihlaseni/callback`;

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    response_type: "token",
    redirect_uri: redirectUri,
    scope: "identify email guilds",
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
