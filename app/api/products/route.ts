import { NextResponse } from "next/server";
import { Product } from "@/types";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// In-memory server store for products (starts completely empty)
let serverProducts: Product[] = [];

export async function GET() {
  return NextResponse.json(serverProducts, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function POST(request: Request) {
  try {
    const products: Product[] = await request.json();
    if (Array.isArray(products)) {
      serverProducts = products;
      return NextResponse.json({
        success: true,
        count: serverProducts.length,
      });
    }
    return NextResponse.json(
      { error: "Očekáváno pole produktů." },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Chyba při ukládání produktů na serveru." },
      { status: 500 }
    );
  }
}
