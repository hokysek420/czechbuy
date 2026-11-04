/**
 * Vercel Serverless Discord Interactions API Route (App Router)
 * Path: app/api/discord/interactions/route.ts
 * 
 * Runs 24/7 in the cloud on Vercel without requiring a persistent WebSocket connection.
 * Handles Discord PING requests, member verification, and support tickets via Discord REST API v10.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  verifyKey,
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import {
  getGuildRoles,
  addRoleToMember,
  createChannel,
  sendChannelMessage,
  deleteChannel,
  discordFetch,
} from '@/lib/discord-rest';

let cachedFamRoleId: string | null = process.env.ROLE_CZECHBUY_FAM_ID || null;
let cachedSupportCatId: string | null = process.env.CATEGORY_SUPPORT_ID || null;
let cachedStaffRoleIds: { adminId?: string; modId?: string } | null = null;

export async function POST(request: NextRequest) {
  try {
    const publicKey = process.env.DISCORD_PUBLIC_KEY;
    if (!publicKey) {
      console.error('Missing DISCORD_PUBLIC_KEY in environment variables');
      return new NextResponse('Configuration Error: Missing DISCORD_PUBLIC_KEY', { status: 500 });
    }

    // 1. Validate cryptographic Ed25519 signature
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const rawBody = await request.text();

    if (!signature || !timestamp || !rawBody) {
      return new NextResponse('Bad request signature headers', { status: 401 });
    }

    const isValid = verifyKey(rawBody, signature, timestamp, publicKey);
    if (!isValid) {
      return new NextResponse('Invalid request signature', { status: 401 });
    }

    const interaction = JSON.parse(rawBody);

    // 2. Handle PING verification (Sent by Discord when configuring Interactions Endpoint URL)
    if (interaction.type === InteractionType.PING) {
      return NextResponse.json({ type: InteractionResponseType.PONG });
    }

    // 3. Handle Message Component Interactions (Buttons)
    if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
      const customId = interaction.data?.custom_id;
      const guildId = interaction.guild_id || process.env.GUILD_ID || '1567519231984271472';
      const userId = interaction.member?.user?.id;
      const username = interaction.member?.user?.username || 'user';

      // ------------------------------------------------------------------------
      // A. VERIFICATION BUTTON (verify_user or verify_czechbuy_fam)
      // ------------------------------------------------------------------------
      if (customId === 'verify_user' || customId === 'verify_czechbuy_fam') {
        try {
          if (!cachedFamRoleId) {
            const roles = await getGuildRoles(guildId);
            const famRole = roles.find(
              (r: any) => r.name.trim().toLowerCase() === 'czechbuy fam'
            );
            if (famRole) cachedFamRoleId = famRole.id;
          }

          if (!cachedFamRoleId) {
            return NextResponse.json({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionResponseFlags.EPHEMERAL,
                content: '❌ Chyba: Role **CzechBuy Fam** nebyla na serveru nalezena! Kontaktujte administrátora.',
              },
            });
          }

          // Check if user already has role
          const userRoles: string[] = interaction.member?.roles || [];
          if (userRoles.includes(cachedFamRoleId)) {
            return NextResponse.json({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionResponseFlags.EPHEMERAL,
                content: 'ℹ️ Již jste ověřeným členem **CzechBuy Fam**! Máte plný přístup ke všem kanálům.',
              },
            });
          }

          // Assign role via Discord REST API v10
          await addRoleToMember(guildId, userId, cachedFamRoleId);

          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL,
              embeds: [
                {
                  title: '🎉 VÍTEJ V CZECHBUY FAM!',
                  description:
                    `Vítej, <@${userId}>! Tvoje ověření proběhlo úspěšně.\n\n` +
                    `Byla ti udělena role **CzechBuy Fam**. Nyní máš odemčený plný přístup k dropům parfémů, sneakers a komunitním diskuzím.\n\n` +
                    `Oficiální e-shop: **[czechbuy.com](https://czechbuy.com)**`,
                  color: 0x10b981,
                  footer: { text: 'CzechBuy • Vercel Serverless Verifikace' },
                },
              ],
            },
          });
        } catch (err: any) {
          console.error('[Interactions] Chyba při verifikaci uživatele:', err);
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL,
              content: `❌ Došlo k chybě při přidělování role: ${err.message}`,
            },
          });
        }
      }

      // ------------------------------------------------------------------------
      // B. TICKET BUTTON (create_ticket, ticket_order, ticket_general)
      // ------------------------------------------------------------------------
      if (
        customId === 'create_ticket' ||
        customId === 'ticket_order' ||
        customId === 'ticket_general'
      ) {
        try {
          if (!cachedSupportCatId || !cachedStaffRoleIds) {
            const [roles, channels] = await Promise.all([
              getGuildRoles(guildId),
              discordFetch(`/guilds/${guildId}/channels`, { method: 'GET' }),
            ]);

            const adminRole = roles.find((r: any) => r.name.toLowerCase().includes('admin'));
            const modRole = roles.find((r: any) => r.name.toLowerCase().includes('support') || r.name.toLowerCase().includes('moderát'));
            cachedStaffRoleIds = {
              adminId: adminRole?.id,
              modId: modRole?.id,
            };

            const supportCat = channels.find(
              (c: any) => c.type === 4 && c.name.includes('PODPORA')
            );
            if (supportCat) cachedSupportCatId = supportCat.id;
          }

          const cleanName = username.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'user';
          const ticketChannelName = `ticket-${cleanName}`;

          const permissionOverwrites: any[] = [
            {
              id: guildId,
              type: 0,
              deny: '1024',
            },
            {
              id: userId,
              type: 1,
              allow: '68608',
            },
          ];

          if (cachedStaffRoleIds?.adminId) {
            permissionOverwrites.push({
              id: cachedStaffRoleIds.adminId,
              type: 0,
              allow: '68608',
            });
          }

          if (cachedStaffRoleIds?.modId) {
            permissionOverwrites.push({
              id: cachedStaffRoleIds.modId,
              type: 0,
              allow: '68608',
            });
          }

          const newChannel = await createChannel(guildId, {
            name: ticketChannelName,
            type: 0,
            parent_id: cachedSupportCatId || undefined,
            topic: `Zákaznický ticket uživatele ${username} (ID: ${userId})`,
            permission_overwrites: permissionOverwrites,
          });

          const ticketTypeLabel = customId === 'ticket_order'
            ? 'Dotaz k Objednávce / Zásilkovně'
            : customId === 'ticket_general'
            ? 'Všeobecný Dotaz'
            : 'Zákaznická Podpora';

          await sendChannelMessage(newChannel.id, {
            content: `👋 Vítej <@${userId}>! Náš tým podpory byl notifikován.`,
            embeds: [
              {
                title: `🎫 ZÁKAZNICKÝ TICKET | ${username.toUpperCase()}`,
                description:
                  `Ahoj <@${userId}>! Vítej ve svém privátním ticketu podpory **CzechBuy**.\n\n` +
                  `**Typ požadavku:** \`${ticketTypeLabel}\`\n\n` +
                  `**Pro co nejrychlejší vyřízení prosím uveď:**\n` +
                  `• **Číslo objednávky** (např. \`CZB-2024-XXXX\`)\n` +
                  `• **E-mail**, zadaný v objednávce\n` +
                  `• **Podrobný popis** tvého požadavku či dotazu`,
                color: 0x8b5cf6,
                footer: { text: 'CzechBuy Support • czechbuy.com' },
                timestamp: new Date().toISOString(),
              },
            ],
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.BUTTON,
                    custom_id: 'close_ticket',
                    label: 'Uzavřít & Smazat Ticket',
                    style: ButtonStyleTypes.DANGER,
                    emoji: { name: '🔒' },
                  },
                ],
              },
            ],
          });

          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL,
              content: `✅ Váš zákaznický ticket byl úspěšně vytvořen! Přejděte do kanálu: <#${newChannel.id}>`,
            },
          });
        } catch (err: any) {
          console.error('[Interactions] Chyba při vytváření ticketu:', err);
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL,
              content: `❌ Došlo k chybě při vytváření ticketu: ${err.message}`,
            },
          });
        }
      }

      // ------------------------------------------------------------------------
      // C. CLOSE TICKET BUTTON
      // ------------------------------------------------------------------------
      if (customId === 'close_ticket') {
        const channelId = interaction.channel_id;
        try {
          await sendChannelMessage(channelId, {
            embeds: [
              {
                title: '🔒 UZAVÍRÁNÍ TICKETU',
                description: 'Tento ticket byl označen k uzavření a bude smazán. Děkujeme, že nakupujete na **[czechbuy.com](https://czechbuy.com)**!',
                color: 0xe11d48,
              },
            ],
          });

          setTimeout(async () => {
            try {
              await deleteChannel(channelId, `Ticket closed by user ${username}`);
            } catch (e) {
              console.warn('Failed to delete channel:', e);
            }
          }, 3000);

          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: '🔒 Ticket se nyní uzavírá...',
            },
          });
        } catch (err: any) {
          return NextResponse.json({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL,
              content: `Chyba při uzavírání ticketu: ${err.message}`,
            },
          });
        }
      }
    }

    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        flags: InteractionResponseFlags.EPHEMERAL,
        content: 'Akce byla zaznamenána.',
      },
    });
  } catch (err: any) {
    console.error('[Interactions Handler Error]:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
