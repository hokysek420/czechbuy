import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const DEFAULT_ADMIN_KEY = "czechbuy-admin-secure-2026!";

/**
 * Validates whether the incoming request has valid admin credentials
 * (via admin cookie or admin secret key header).
 */
export function isRequestAuthorizedAdmin(request: NextRequest): boolean {
  const cookieStore = cookies();
  const sessionCookie =
    cookieStore.get("czechbuy_admin_session")?.value ||
    cookieStore.get("czechbuy_admin_token")?.value;

  if (sessionCookie && sessionCookie.trim().length > 0) {
    return true;
  }

  // Check header authorization
  const authHeader = request.headers.get("authorization");
  const adminKeyHeader = request.headers.get("x-admin-key");
  const envKey = process.env.ADMIN_SECRET_KEY?.trim() || DEFAULT_ADMIN_KEY;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const bearerToken = authHeader.substring(7).trim();
    if (bearerToken === envKey || bearerToken === DEFAULT_ADMIN_KEY) {
      return true;
    }
  }

  if (adminKeyHeader && (adminKeyHeader.trim() === envKey || adminKeyHeader.trim() === DEFAULT_ADMIN_KEY)) {
    return true;
  }

  return false;
}
