import { DiscordUser } from "@/types";

export const DISCORD_CLIENT_ID =
  process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ||
  process.env.DISCORD_CLIENT_ID ||
  "1558604485088256060";

export const DISCORD_GUILD_ID =
  process.env.DISCORD_GUILD_ID || "1567519231984271472";

export const DISCORD_USER_COOKIE = "czechbuy_discord_user";
export const DISCORD_USER_STORAGE_KEY = "czechbuy_discord_user_v1";

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
 * Builds the official Discord OAuth2 authorization URL
 */
export function getDiscordOAuthUrl(baseUrl?: string): string {
  const origin =
    baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

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
  const origin =
    baseUrl ||
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");

  const redirectUri = `${origin}/prihlaseni/callback`;

  const params = new URLSearchParams({
    client_id: DISCORD_CLIENT_ID,
    response_type: "token",
    redirect_uri: redirectUri,
    scope: "identify email guilds",
  });

  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
