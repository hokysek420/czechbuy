import { NextResponse } from "next/server";
import { CategoryStatusConfig, DEFAULT_CATEGORY_STATUS } from "@/lib/category-settings";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

let serverCategoryStatus: CategoryStatusConfig = { ...DEFAULT_CATEGORY_STATUS };

export async function GET() {
  return NextResponse.json(serverCategoryStatus, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (data && typeof data === "object") {
      serverCategoryStatus = {
        ...serverCategoryStatus,
        ...data,
      };
      return NextResponse.json({
        success: true,
        status: serverCategoryStatus,
      });
    }
    return NextResponse.json(
      { error: "Neplatný formát dat." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Chyba při ukládání stavu kategorií." },
      { status: 500 }
    );
  }
}
