import { NextRequest, NextResponse } from "next/server";
import { sendChannelMessage } from "@/lib/discord-rest";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { channelId, text, sender = "CzechBuy Podpora" } = await request.json();

    if (!channelId || !text) {
      return NextResponse.json({ error: "Chybí channelId nebo text" }, { status: 400 });
    }

    await sendChannelMessage(channelId, {
      embeds: [
        {
          author: { name: `Zpráva z administrace e-shopu • ${sender}` },
          description: text,
          color: 0x6366f1,
          timestamp: new Date().toISOString(),
          footer: { text: "czechbuy.com • Zákaznický Servis" },
        },
      ],
    });

    return NextResponse.json({ success: true, message: "Zpráva byla odeslána do Discord ticketu." });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Chyba při odesílání zprávy." },
      { status: 500 }
    );
  }
}
