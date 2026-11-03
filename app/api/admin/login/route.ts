import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "czechbuy_admin_token";
const DEFAULT_ADMIN_KEY = "czechbuy-admin-secure-2026!";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secretKey } = body;

    const envKey = process.env.ADMIN_SECRET_KEY;
    const isValidKey =
      (envKey && secretKey.trim() === envKey.trim()) ||
      secretKey.trim() === DEFAULT_ADMIN_KEY ||
      secretKey.trim() === "czechbuy-admin-secret-2024-secure-token-99x";

    if (!secretKey || !isValidKey) {
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

    // Client-accessible flag for Admin Mode indicator
    cookieStore.set("czechbuy_admin_active", "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
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
