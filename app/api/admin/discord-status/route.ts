import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthorizedAdmin } from "@/lib/admin-auth";
import { isDiscordWebhookConfigured, getDiscordInviteUrl, getInstagramUrl } from "@/lib/discord-webhook";

export async function GET(request: NextRequest) {
  if (!isRequestAuthorizedAdmin(request)) {
    return NextResponse.json(
      { error: "Přístup odepřen. Vyžadována administrátorská autorizace." },
      { status: 401 }
    );
  }

  const configured = isDiscordWebhookConfigured();
  const inviteUrl = getDiscordInviteUrl();
  const instagramUrl = getInstagramUrl();

  return NextResponse.json({
    configured,
    inviteUrl,
    instagramUrl,
    channelName: "#live-objednávky",
    message: configured
      ? "Discord webhook pro #live-objednávky je aktivní a připraven."
      : "DISCORD_ORDER_WEBHOOK_URL není nastaven v proměnných prostředí.",
  });
}
