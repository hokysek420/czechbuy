import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";

export interface DiscordWebhookResult {
  success: boolean;
  configured: boolean;
  error?: string;
  statusCode?: number;
}

/**
 * Checks whether the DISCORD_ORDER_WEBHOOK_URL environment variable is properly set.
 */
export function isDiscordWebhookConfigured(): boolean {
  const url = process.env.DISCORD_ORDER_WEBHOOK_URL;
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed.startsWith("https://discord.com/api/webhooks/") || trimmed.startsWith("https://discordapp.com/api/webhooks/");
}

/**
 * Returns the configured Discord invite URL with fallback to official default.
 */
export function getDiscordInviteUrl(): string {
  return process.env.NEXT_PUBLIC_DISCORD_INVITE_URL?.trim() || "https://discord.gg/czechbuy";
}

/**
 * Returns the official Instagram URL with fallback.
 */
export function getInstagramUrl(): string {
  return process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || "https://www.instagram.com/czech.buy/";
}

/**
 * Dispatches a rich Discord Embed formatted for the private #live-objednávky channel
 * whenever an order is placed or confirmed.
 */
export async function sendDiscordOrderNotification(
  order: Order
): Promise<DiscordWebhookResult> {
  const webhookUrl = process.env.DISCORD_ORDER_WEBHOOK_URL?.trim();

  if (!webhookUrl) {
    console.warn(
      "[Discord Webhook] DISCORD_ORDER_WEBHOOK_URL is not configured. Order notification skipped."
    );
    return {
      success: false,
      configured: false,
      error: "DISCORD_ORDER_WEBHOOK_URL není v .env nastaven.",
    };
  }

  // Shipping & payment methods translation
  const shippingLabels: Record<string, string> = {
    zasilkovna: "Zásilkovna (12–16 dní pre-order)",
    ppl: "PPL Kurýr (12–16 dní pre-order)",
    dpd: "DPD Kurýr (12–16 dní pre-order)",
    osobni: "Osobní odběr Praha (po naskladnění)",
  };

  const paymentLabels: Record<string, string> = {
    karta: "Platba kartou online",
    apple_pay: "Apple Pay",
    dobirka: "Dobírka při převzetí",
    prevod: "Bankovní převod",
  };

  const shippingText = shippingLabels[order.shippingMethod] || order.shippingMethod;
  const paymentText = paymentLabels[order.paymentMethod] || order.paymentMethod;

  // Format list of items
  const itemsList =
    order.items
      .map((item, index) => {
        const brand = item.brand ? `${item.brand} ` : "";
        const conc = item.concentration ? ` • ${item.concentration}` : "";
        const vol = item.volume ? ` (${item.volume}${conc})` : "";
        const price = formatPrice(item.price * item.quantity);
        return `\`${index + 1}.\` **${item.quantity}×** ${brand}**${item.name}**${vol} — \`${price}\``;
      })
      .join("\n") || "Žádné položky";

  const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim();
  const addressLine = `${order.customer.address}, ${order.customer.city} ${order.customer.zip}`;
  const phoneLine = order.customer.phone ? ` • Tel: \`${order.customer.phone}\`` : "";
  const discordLine = order.customer.discordUsername ? `\n**Discord účet:** <@${order.customer.discordId || ""}> (\`@${order.customer.discordUsername}\`)` : "";

  // Discord Embed structure
  const payload = {
    username: "CzechBuy Live Sync",
    avatar_url: "https://www.czechbuy.com/favicon.ico",
    embeds: [
      {
        // Sleek Red (#E11D48 -> 14753096)
        color: 0xE11D48,
        title: "🛒 Nová objednávka na CzechBuy!",
        description:
          `**Kód objednávky:** \`${order.id}\`\n` +
          `**Zákazník:** **${customerName}** (<${order.customer.email}>)${phoneLine}\n` +
          `**Doručení:** ${order.customer.city} (${order.customer.zip})${discordLine}`,
        fields: [
          {
            name: "📦 Položky",
            value: itemsList.length > 1024 ? itemsList.substring(0, 1020) + "..." : itemsList,
            inline: false,
          },
          {
            name: "💰 Celková částka",
            value: `**${formatPrice(order.totalPrice)}**\n*(Mezisoučet: ${formatPrice(order.subtotal)})*`,
            inline: true,
          },
          {
            name: "🚚 Doprava & Platba",
            value: `${shippingText}\n${paymentText}`,
            inline: true,
          },
          {
            name: "📍 Doručovací adresa / Zásilkovna",
            value: `${customerName}\n${addressLine}\n${order.customer.country || "Česká republika"}` +
              (order.customer.note ? `\n\n*Poznámka:* "${order.customer.note}"` : ""),
            inline: false,
          },
        ],
        footer: {
          text: "CzechBuy Sync System • czechbuy.com",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error(`[Discord Webhook] Request failed (${response.status}): ${errText}`);
      return {
        success: false,
        configured: true,
        statusCode: response.status,
        error: `Discord API vrátilo chybu ${response.status}: ${errText}`,
      };
    }

    return {
      success: true,
      configured: true,
      statusCode: response.status,
    };
  } catch (err: any) {
    console.error("[Discord Webhook] Network exception:", err);
    return {
      success: false,
      configured: true,
      error: err?.message || "Došlo k chybě sítě při odesílání webhooku.",
    };
  }
}

/**
 * Sends a dummy sample order to verify the webhook integration from the admin panel.
 */
export async function sendDiscordTestNotification(): Promise<DiscordWebhookResult> {
  const testOrder: Order = {
    id: `CZB-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    customer: {
      firstName: "Admin",
      lastName: "Ověření",
      email: "admin@czechbuy.com",
      phone: "+420 777 888 999",
      address: "Václavské náměstí 1",
      city: "Praha",
      zip: "110 00",
      country: "Česká republika",
      note: "Toto je testovací zpráva pro ověření integrace kanálu #live-objednávky.",
    },
    items: [
      {
        id: "dior-sauvage-elixir-60",
        productId: "dior-sauvage-elixir",
        name: "Sauvage Elixir",
        brand: "Dior",
        volume: "60 ml",
        price: 3690,
        image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800",
        quantity: 1,
        concentration: "Extrait",
      },
      {
        id: "tom-ford-oud-wood-50",
        productId: "tom-ford-oud-wood",
        name: "Oud Wood",
        brand: "Tom Ford",
        volume: "50 ml",
        price: 4890,
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800",
        quantity: 1,
        concentration: "EdP",
      },
    ],
    shippingMethod: "zasilkovna",
    paymentMethod: "karta",
    shippingPrice: 0,
    paymentPrice: 0,
    subtotal: 8580,
    totalPrice: 8580,
    status: "nova",
  };

  return sendDiscordOrderNotification(testOrder);
}
