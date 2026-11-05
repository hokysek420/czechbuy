import { NextRequest, NextResponse } from "next/server";
import {
  discordFetch,
  getGuildRoles,
  getGuildChannels,
  createChannel,
  sendChannelMessage,
} from "@/lib/discord-rest";
import { DISCORD_GUILD_ID, DISCORD_ROLES } from "@/lib/discord-auth";
import { MessageComponentTypes, ButtonStyleTypes } from "discord-interactions";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const guildId = DISCORD_GUILD_ID;

    // Fetch all channels in the guild
    const channels = await getGuildChannels(guildId);

    // Filter ticket channels (channels whose name starts with 'ticket-', 'vip-', 'owner-', or whose topic contains 'ticket')
    const ticketChannels = (channels || []).filter((c: any) => {
      if (c.type !== 0) return false; // Text channels only
      const name = c.name?.toLowerCase() || "";
      const topic = c.topic?.toLowerCase() || "";
      return (
        name.startsWith("ticket-") ||
        name.startsWith("vip-") ||
        name.startsWith("owner-") ||
        topic.includes("ticket")
      );
    });

    // If userId filter provided, match either channel name or channel topic/permissions
    let filtered = ticketChannels;
    if (userId) {
      filtered = ticketChannels.filter((c: any) => {
        const topic = c.topic || "";
        const overwrites: any[] = c.permission_overwrites || [];
        const hasUserOverwrite = overwrites.some((o: any) => o.id === userId);
        return topic.includes(userId) || hasUserOverwrite;
      });
    }

    const tickets = filtered.map((c: any) => ({
      id: c.id,
      name: c.name,
      topic: c.topic || "",
      parentId: c.parent_id,
      discordUrl: `https://discord.com/channels/${guildId}/${c.id}`,
      createdAt: c.id
        ? new Date(Number(BigInt(c.id) / BigInt(4194304) + BigInt(1420070400000))).toISOString()
        : new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (err: any) {
    console.error("[Tickets GET Error]:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Nepodařilo se načíst tickety z Discordu",
      tickets: [],
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      username,
      userRole,
      category = "general",
      orderNumber,
      message,
    } = body;

    if (!userId || !username) {
      return NextResponse.json(
        { success: false, error: "Uživatel musí být přihlášen přes Discord." },
        { status: 400 }
      );
    }

    const guildId = DISCORD_GUILD_ID;

    // 1. Fetch channels & roles in parallel
    const [channels, roles] = await Promise.all([
      getGuildChannels(guildId).catch(() => []),
      getGuildRoles(guildId).catch(() => []),
    ]);

    // 2. Find or determine PODPORA Category ID
    let supportCat = channels.find(
      (c: any) => c.type === 4 && (c.name.includes("PODPORA") || c.name.toLowerCase().includes("support") || c.name.toLowerCase().includes("ticket"))
    );

    // If no support category exists, create one
    if (!supportCat) {
      try {
        supportCat = await discordFetch(`/guilds/${guildId}/channels`, {
          method: "POST",
          body: JSON.stringify({
            name: "🎫 PODPORA & TICKETY",
            type: 4, // GuildCategory
          }),
        });
      } catch (catErr) {
        console.warn("Could not create Support category:", catErr);
      }
    }

    // 3. Find staff roles (Admin / Mod)
    const adminRole = roles.find((r: any) =>
      r.id === DISCORD_ROLES.FOUNDER_ADMIN || r.name.toLowerCase().includes("admin")
    );
    const modRole = roles.find((r: any) =>
      r.id === DISCORD_ROLES.MODERATOR_SUPPORT || r.name.toLowerCase().includes("support") || r.name.toLowerCase().includes("moderát")
    );

    // 4. Clean username & build channel name
    const cleanName = username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 15) || "user";
    const isOwner = userRole === "Owner" || userId === "1492628172611518504" || username === "hokysek";
    const isVip = isOwner || userRole?.toLowerCase().includes("vip");

    const channelPrefix = isOwner ? "owner" : isVip ? "vip" : "ticket";
    const ticketChannelName = `${channelPrefix}-${cleanName}`;

    // 5. Build strict private permissions
    const permissionOverwrites: any[] = [
      {
        id: guildId, // @everyone role
        type: 0,
        deny: "1024", // Deny VIEW_CHANNEL
      },
      {
        id: userId, // The customer
        type: 1, // Member
        allow: "68608", // VIEW_CHANNEL, SEND_MESSAGES, READ_MESSAGE_HISTORY, ATTACH_FILES, EMBED_LINKS
      },
    ];

    if (adminRole?.id) {
      permissionOverwrites.push({
        id: adminRole.id,
        type: 0,
        allow: "68608",
      });
    }

    if (modRole?.id && modRole.id !== adminRole?.id) {
      permissionOverwrites.push({
        id: modRole.id,
        type: 0,
        allow: "68608",
      });
    }

    // 6. Create channel
    const newChannel = await createChannel(guildId, {
      name: ticketChannelName,
      type: 0,
      parent_id: supportCat?.id || undefined,
      topic: `Zákaznický ticket [${category.toUpperCase()}] uživatele ${username} (ID: ${userId})${orderNumber ? ` • Objednávka: ${orderNumber}` : ""}`,
      permission_overwrites: permissionOverwrites,
    });

    // 7. Category labels & colors
    const categoryLabels: Record<string, string> = {
      order: "📦 Dotaz k objednávce",
      exchange: "🔄 Reklamace / Výměna",
      vip: "👑 VIP Prioritní ticket",
      general: "💬 Všeobecný dotaz k e-shopu",
    };
    const categoryLabel = categoryLabels[category] || "Zákaznická Podpora";
    const embedColor = isOwner ? 0xf43f5e : isVip ? 0xf59e0b : 0x8b5cf6;

    // 8. Send welcome message with rich embed & close button
    await sendChannelMessage(newChannel.id, {
      content: `👋 Vítej <@${userId}>! Náš tým podpory obdržel tvůj ticket vytvořený přímo z webu **[czechbuy.com](https://czechbuy.com)**.`,
      embeds: [
        {
          title: `🎫 ZÁKAZNICKÝ TICKET | ${username.toUpperCase()}`,
          description:
            `Ahoj <@${userId}>! Vítej ve svém privátním ticketu podpory **CzechBuy**.\n` +
            `Tento kanál vidíš pouze ty a náš ověřený tým administrace a podpory.\n\n` +
            `**📋 Kategorie dotazu:** \`${categoryLabel}\`\n` +
            `**👑 Uživatelská role:** \`${userRole || (isOwner ? "Owner" : isVip ? "VIP Customer" : "Člen")}\`\n` +
            (orderNumber ? `**📦 Číslo objednávky:** \`${orderNumber}\`\n` : "") +
            `\n**💬 Zpráva zákazníka:**\n>>> ${message || "Bez doplňující zprávy."}`,
          color: embedColor,
          fields: [
            {
              name: "⚡ Stav vyřizování",
              value: isOwner
                ? "🔴 **Vlastník e-shopu (Owner)** • Nejvyšší priorita"
                : isVip
                ? "🟡 **VIP Prioritní podpora** • Přednostní vyřízení"
                : "🟢 **Aktivní ticket** • Tým se vám brzy ozve",
              inline: false,
            },
          ],
          footer: { text: "CzechBuy Support • czechbuy.com • Propojený Ticket Systém" },
          timestamp: new Date().toISOString(),
        },
      ],
      components: [
        {
          type: MessageComponentTypes.ACTION_ROW,
          components: [
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: "close_ticket",
              label: "Uzavřít & Smazat Ticket",
              style: ButtonStyleTypes.DANGER,
              emoji: { name: "🔒" },
            },
          ],
        },
      ],
    });

    const discordUrl = `https://discord.com/channels/${guildId}/${newChannel.id}`;

    return NextResponse.json({
      success: true,
      channelId: newChannel.id,
      channelName: newChannel.name,
      discordUrl,
      message: "Ticket byl úspěšně vytvořen na Discordu!",
    });
  } catch (err: any) {
    console.error("[Ticket Creation Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Nepodařilo se vytvořit ticket na Discordu." },
      { status: 500 }
    );
  }
}
