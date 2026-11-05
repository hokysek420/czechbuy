import { NextRequest, NextResponse } from "next/server";
import { deleteChannel, sendChannelMessage } from "@/lib/discord-rest";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { channelId, closedBy } = await request.json();

    if (!channelId) {
      return NextResponse.json({ error: "Chybí channelId" }, { status: 400 });
    }

    try {
      await sendChannelMessage(channelId, {
        embeds: [
          {
            title: "🔒 UZAVÍRÁNÍ TICKETU",
            description: `Tento ticket byl uzavřen přes web administrace uživatelem **${closedBy || "Administrátor"}**. Kanál se nyní maže. Děkujeme, že nakupujete na **[czechbuy.com](https://czechbuy.com)**!`,
            color: 0xe11d48,
          },
        ],
      });
    } catch {}

    await deleteChannel(channelId, `Ticket closed by ${closedBy || "Web Admin"}`);

    return NextResponse.json({ success: true, message: "Ticket byl úspěšně smazán." });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Chyba při uzavírání ticketu." },
      { status: 500 }
    );
  }
}
