import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "czechbuy_admin_token";
const DEFAULT_ADMIN_KEY = "czechbuy-admin-secure-2026!";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secretKey } = body;

    const expectedKey = process.env.ADMIN_SECRET_KEY || DEFAULT_ADMIN_KEY;

    if (!secretKey || secretKey.trim() !== expectedKey.trim()) {
      return NextResponse.json(
        { error: "Zadaný administrátorský klíč je neplatný." },
        { status: 401 }
      );
    }

    // Set secure cookie valid for 7 days
    const cookieStore = cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, "authenticated_session_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Došlo k chybě při ověřování administrátora." },
      { status: 500 }
    );
  }
}
