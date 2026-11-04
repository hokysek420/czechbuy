import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthorizedAdmin } from "@/lib/admin-auth";
import { sendDiscordTestNotification } from "@/lib/discord-webhook";

export async function POST(request: NextRequest) {
  if (!isRequestAuthorizedAdmin(request)) {
    return NextResponse.json(
      { error: "Přístup odepřen. Vyžadována administrátorská autorizace." },
      { status: 401 }
    );
  }

  const result = await sendDiscordTestNotification();

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        configured: result.configured,
        error: result.error || "Odeslání testovací zprávy na Discord selhalo.",
      },
      { status: result.configured ? 502 : 400 }
    );
  }

  return NextResponse.json({
    success: true,
    configured: true,
    message: "Testovací zpráva byla úspěšně odeslána do kanálu #live-objednávky na Discordu!",
  });
}
