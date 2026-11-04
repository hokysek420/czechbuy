/**
 * CzechBuy Discord REST API v10 Helper
 * Lightweight serverless-compatible Discord REST client with zero heavy dependencies.
 * Works seamlessly in Next.js Serverless and Edge runtimes on Vercel.
 */

const DISCORD_API = 'https://discord.com/api/v10';

function getBotToken(): string {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    throw new Error('Chybí DISCORD_BOT_TOKEN v proměnných prostředí!');
  }
  return token.replace(/^Bot\s+/i, '');
}

/**
 * Executes an authenticated request to the Discord REST API
 */
export async function discordFetch(endpoint: string, options: RequestInit = {}) {
  const token = getBotToken();
  const url = `${DISCORD_API}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'CzechBuy-ServerlessBot (https://czechbuy.com, v1.0.0)',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorJson: any = null;
    try {
      errorJson = JSON.parse(errorText);
    } catch {}
    throw new Error(
      `Discord API Error (${response.status} ${response.statusText}): ${
        errorJson?.message || errorText
      }`
    );
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Fetch all roles in a guild
 */
export async function getGuildRoles(guildId: string): Promise<any[]> {
  return discordFetch(`/guilds/${guildId}/roles`, { method: 'GET' });
}

/**
 * Assigns a role to a guild member
 */
export async function addRoleToMember(guildId: string, userId: string, roleId: string) {
  return discordFetch(`/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
    method: 'PUT',
    headers: {
      'X-Audit-Log-Reason': 'CzechBuy Serverless Member Verification',
    },
  });
}

/**
 * Creates a text channel in a guild
 */
export async function createChannel(guildId: string, data: {
  name: string;
  type?: number;
  parent_id?: string;
  topic?: string;
  permission_overwrites?: any[];
}) {
  return discordFetch(`/guilds/${guildId}/channels`, {
    method: 'POST',
    body: JSON.stringify({
      type: 0, // GuildText
      ...data,
    }),
  });
}

/**
 * Sends a message into a channel
 */
export async function sendChannelMessage(channelId: string, payload: any) {
  return discordFetch(`/channels/${channelId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Deletes a channel
 */
export async function deleteChannel(channelId: string, reason = 'CzechBuy Ticket Closed') {
  return discordFetch(`/channels/${channelId}`, {
    method: 'DELETE',
    headers: {
      'X-Audit-Log-Reason': reason,
    },
  });
}
