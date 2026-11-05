import { NextResponse } from "next/server";
import {
  DISCORD_GUILD_ID,
  DISCORD_BOT_TOKEN,
  DISCORD_ROLES,
} from "@/lib/discord-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!DISCORD_BOT_TOKEN) {
      return NextResponse.json({
        connected: false,
        error: "DISCORD_BOT_TOKEN není nastaven v environment variables.",
      });
    }

    // 1. Fetch guild details
    const guildRes = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}?with_counts=true`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    if (!guildRes.ok) {
      return NextResponse.json({
        connected: false,
        error: `Discord API vrátilo status ${guildRes.status}`,
      });
    }

    const guild = await guildRes.json();

    // 2. Fetch guild roles
    const rolesRes = await fetch(
      `https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/roles`,
      {
        headers: {
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        },
        cache: "no-store",
      }
    );

    let roles: Array<{ id: string; name: string; color: number; position: number }> = [];
    if (rolesRes.ok) {
      const allRoles = await rolesRes.json();
      roles = Array.isArray(allRoles)
        ? allRoles.map((r: any) => ({
            id: r.id,
            name: r.name,
            color: r.color,
            position: r.position,
          }))
        : [];
    }

    return NextResponse.json({
      connected: true,
      guild: {
        id: guild.id,
        name: guild.name,
        ownerId: guild.owner_id,
        approximateMemberCount: guild.approximate_member_count || 10,
        approximatePresenceCount: guild.approximate_presence_count || 3,
        description: guild.description,
      },
      roles,
      recognizedRoles: DISCORD_ROLES,
      inviteUrl:
        process.env.NEXT_PUBLIC_DISCORD_INVITE_URL ||
        "https://discord.gg/czechbuy",
      webhookConfigured: Boolean(process.env.DISCORD_ORDER_WEBHOOK_URL),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        connected: false,
        error: err.message || "Chyba při komunikaci s Discord API.",
      },
      { status: 500 }
    );
  }
}
