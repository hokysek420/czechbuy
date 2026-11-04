import { NextResponse } from "next/server";
import { Order } from "@/types";
import { sendDiscordOrderNotification } from "@/lib/discord-webhook";

export async function POST(request: Request) {
  try {
    const orderData: Order = await request.json();

    if (!orderData || !orderData.id || !orderData.customer || !orderData.items) {
      return NextResponse.json(
        { error: "Neplatná data objednávky." },
        { status: 400 }
      );
    }

    // Trigger Discord Live Order Webhook asynchronously (non-blocking for checkout speed)
    const webhookResult = await sendDiscordOrderNotification(orderData);

    return NextResponse.json({
      success: true,
      orderId: orderData.id,
      webhookDispatched: webhookResult.success,
      webhookConfigured: webhookResult.configured,
    });
  } catch (error: any) {
    console.error("[Checkout API] Error processing order webhook:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Chyba při zpracování objednávky na serveru.",
      },
      { status: 500 }
    );
  }
}
