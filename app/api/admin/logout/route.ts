import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "czechbuy_admin_token";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);

  return NextResponse.json({ success: true });
}
