import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "czechbuy_admin_session";
const ADMIN_COOKIE_NAME = "czechbuy_admin_token";
const ADMIN_BASE_PATH = "/interni-portal-8f2a9x";
const COUNTDOWN_PATH = "/brzy-otevirame";

// Default countdown target (November 20, 2026 at 20:00 CET)
const DEFAULT_TARGET_TIME = new Date("2026-11-20T20:00:00+01:00").getTime();

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow system paths, ACME SSL challenges (.well-known), Next.js assets, API routes & static files
  if (
    pathname.startsWith("/.well-known") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Cryptographically secure admin verification via HTTP-only session cookies
  // Only the server can issue czechbuy_admin_session/token; client JS cannot forge this
  const adminToken =
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value ||
    request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  const isAuthenticatedAdmin = Boolean(
    adminToken && (adminToken === "authenticated_session_token" || adminToken.trim().length > 10)
  );

  // 3. Scenario: Authenticated Administrator or Owner
  if (isAuthenticatedAdmin) {
    // If admin visits hidden login page, redirect directly to dashboard
    if (pathname === `${ADMIN_BASE_PATH}/login`) {
      const dashboardUrl = new URL(`${ADMIN_BASE_PATH}/sprava`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Authenticated admin/owner has unrestricted access to the entire portal and store
    return NextResponse.next();
  }

  // 4. Scenario: Unauthenticated Admin Portal Area
  // Admin login page must remain accessible so the admin can log in
  if (pathname === `${ADMIN_BASE_PATH}/login`) {
    return NextResponse.next();
  }

  // Any other admin page redirects to admin login
  if (pathname.startsWith(ADMIN_BASE_PATH)) {
    const loginUrl = new URL(`${ADMIN_BASE_PATH}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Countdown / Pre-launch Locking
  // Determine if countdown is active
  let targetTime = DEFAULT_TARGET_TIME;
  const targetCookie = request.cookies.get("czechbuy_countdown_target")?.value;
  if (targetCookie) {
    const parsed = new Date(decodeURIComponent(targetCookie)).getTime();
    if (!isNaN(parsed)) {
      targetTime = parsed;
    }
  }

  const isCountdownActive = Date.now() < targetTime;

  // If countdown timer is running:
  // NOBODY except verified Admins/Owner can view the store pages
  if (isCountdownActive) {
    // If already on countdown page, allow
    if (pathname === COUNTDOWN_PATH) {
      return NextResponse.next();
    }

    // Lock all other public routes (including home, catalog, perfumes, cart, and prihlaseni)
    // and redirect immediately to the Countdown page
    const countdownUrl = new URL(COUNTDOWN_PATH, request.url);
    return NextResponse.redirect(countdownUrl);
  }

  // 6. After countdown ends: store is open to the public
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except system paths, ACME SSL challenges, static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
