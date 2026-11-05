import { DiscordUser } from "@/types";

export const DISCORD_CLIENT_ID =
  process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID ||
  process.env.DISCORD_CLIENT_ID ||
  "1558604485088256060";

export const DISCORD_GUILD_ID =
  process.env.DISCORD_GUILD_ID || "1567519231984271472";

export const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || "";

// CzechBuy Discord Server Role & Member Constants
export const DISCORD_SERVER_OWNER_ID = "1492628172611518504"; // hokysek (Guild Owner)

export const DISCORD_ROLES = {
  OWNER_USER_ID: "1492628172611518504",
  FOUNDER_ADMIN: "1567522100523040914", // "Founder / Admin"
  MODERATOR_SUPPORT: "1567522104293855253", // "Moderátor / Support"
  VIP_CUSTOMER: "1567522107393581176", // "VIP Customer"
  CZECHBUY_FAM: "1567522110648221797", // "CzechBuy Fam" (Member)
  CZECHBUY_TEAM: "1567521679490551880", // "CzechBuy"
} as const;

// Legacy aliases
export const DISCORD_VIP_ROLE_ID = DISCORD_ROLES.VIP_CUSTOMER;
export const DISCORD_ADMIN_ROLE_ID = DISCORD_ROLES.FOUNDER_ADMIN;

export const DISCORD_USER_COOKIE = "czechbuy_discord_user";
export const DISCORD_USER_STORAGE_KEY = "czechbuy_discord_user_v1";

export interface GuildMemberRolesResult {
  isMember: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  isMod: boolean;
  isVip: boolean;
  isCzechBuyFam: boolean;
  roleName: string | null;
  roleColor: string | null;
  roles: string[];
  roleBadges: { id: string; name: string; color: string }[];
}

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
 * Fetches real-time role status of a Discord member from the CzechBuy server.
 * Maps exact roles: Owner, Admin, Moderátor, VIP, and Člen.
 */
export async function fetchGuildMemberRoles(userId: string): Promise<GuildMemberRolesResult> {
  const emptyResult: GuildMemberRolesResult = {
    isMember: false,
    isOwner: false,
    isAdmin: false,
    isMod: false,
    isVip: false,
    isCzechBuyFam: false,
    roleName: null,
    roleColor: null,
    roles: [],
    roleBadges: [],
  };

  if (!userId) {
    return emptyResult;
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
      return emptyResult;
    }

    const member = await res.json();
    const roles: string[] = Array.isArray(member.roles) ? member.roles : [];

    const isOwner =
      userId === DISCORD_SERVER_OWNER_ID ||
      roles.includes(DISCORD_ROLES.FOUNDER_ADMIN);

    const isAdmin = isOwner || roles.includes(DISCORD_ROLES.FOUNDER_ADMIN);
    const isMod = isAdmin || roles.includes(DISCORD_ROLES.MODERATOR_SUPPORT);
    const isVip = isOwner || isAdmin || roles.includes(DISCORD_ROLES.VIP_CUSTOMER);
    const isCzechBuyFam = true; // Any verified guild member

    // Build list of active Discord badges
    const roleBadges: { id: string; name: string; color: string }[] = [];
    if (isOwner) {
      roleBadges.push({ id: "owner", name: "Owner", color: "#f43f5e" });
    }
    if (roles.includes(DISCORD_ROLES.FOUNDER_ADMIN)) {
      roleBadges.push({ id: DISCORD_ROLES.FOUNDER_ADMIN, name: "Founder / Admin", color: "#6366f1" });
    }
    if (roles.includes(DISCORD_ROLES.MODERATOR_SUPPORT)) {
      roleBadges.push({ id: DISCORD_ROLES.MODERATOR_SUPPORT, name: "Moderátor / Support", color: "#06b6d4" });
    }
    if (roles.includes(DISCORD_ROLES.VIP_CUSTOMER)) {
      roleBadges.push({ id: DISCORD_ROLES.VIP_CUSTOMER, name: "VIP Customer", color: "#f59e0b" });
    }
    if (roles.includes(DISCORD_ROLES.CZECHBUY_FAM)) {
      roleBadges.push({ id: DISCORD_ROLES.CZECHBUY_FAM, name: "CzechBuy Fam", color: "#a855f7" });
    }

    // Determine primary display role
    let roleName: string | null = null;
    let roleColor: string | null = null;

    if (isOwner) {
      roleName = "Owner";
      roleColor = "#f43f5e";
    } else if (isAdmin) {
      roleName = "Admin";
      roleColor = "#6366f1";
    } else if (isMod) {
      roleName = "Moderátor";
      roleColor = "#06b6d4";
    } else if (isVip) {
      roleName = "VIP";
      roleColor = "#f59e0b";
    } else if (roles.includes(DISCORD_ROLES.CZECHBUY_FAM)) {
      roleName = "Člen";
      roleColor = "#a855f7";
    } else {
      roleName = null;
      roleColor = null;
    }

    return {
      isMember: true,
      isOwner,
      isAdmin,
      isMod,
      isVip,
      isCzechBuyFam,
      roleName,
      roleColor,
      roles,
      roleBadges,
    };
  } catch (err) {
    console.warn("[Discord Auth] Error fetching guild member:", err);
    return emptyResult;
  }
}

// Backward compatibility alias
export const fetchGuildMemberVipStatus = fetchGuildMemberRoles;

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
