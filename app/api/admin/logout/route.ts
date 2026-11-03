import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "czechbuy_admin_token";

export async function POST() {
  const cookieStore = cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  cookieStore.delete("czechbuy_admin_session");
  cookieStore.delete("czechbuy_admin_active");

  return NextResponse.json({ success: true });
}
