import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "czechbuy_admin_token";
const ADMIN_BASE_PATH = "/interni-portal-8f2a9x";
const COUNTDOWN_PATH = "/brzy-otevirame";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow internal Next.js assets, API routes, and static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Check admin authorization cookie
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticatedAdmin = Boolean(token && token.trim().length > 0);

  // 2. Scenario: Authenticated Administrator
  if (isAuthenticatedAdmin) {
    // If authenticated admin visits the login page, redirect to management dashboard
    if (pathname === `${ADMIN_BASE_PATH}/login`) {
      const dashboardUrl = new URL(`${ADMIN_BASE_PATH}/sprava`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Authenticated admin has unrestricted access to the entire store, catalog, cart, checkout & admin portal
    return NextResponse.next();
  }

  // 3. Scenario: Public Visitor / Unauthenticated
  // Hidden admin login page must remain accessible so the admin can log in
  if (pathname === `${ADMIN_BASE_PATH}/login`) {
    return NextResponse.next();
  }

  // If unauthenticated user attempts to access any other admin page, redirect to login
  if (pathname.startsWith(ADMIN_BASE_PATH)) {
    const loginUrl = new URL(`${ADMIN_BASE_PATH}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already on the countdown page, allow
  if (pathname === COUNTDOWN_PATH) {
    return NextResponse.next();
  }

  // All other public routes (/, /katalog, /produkt/*, /kosik, /pokladna, /faq, etc.)
  // are locked and redirected to the Countdown / Maintenance page
  const countdownUrl = new URL(COUNTDOWN_PATH, request.url);
  return NextResponse.redirect(countdownUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
