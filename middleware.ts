import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_SESSION_COOKIE = "czechbuy_admin_session";
const ADMIN_COOKIE_NAME = "czechbuy_admin_token";
const DISCORD_USER_COOKIE = "czechbuy_discord_user";
const ADMIN_BASE_PATH = "/interni-portal-8f2a9x";
const COUNTDOWN_PATH = "/brzy-otevirame";

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

  // Check admin authorization cookie (supporting czechbuy_admin_session & legacy czechbuy_admin_token)
  const adminToken =
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value ||
    request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  // Check Discord user cookie for Owner, Admin, or VIP roles
  const discordUserCookie = request.cookies.get(DISCORD_USER_COOKIE)?.value;
  let isDiscordOwnerOrAdmin = false;
  let isVipUser = false;

  if (discordUserCookie) {
    try {
      const parsedUser = JSON.parse(decodeURIComponent(discordUserCookie));
      if (parsedUser) {
        if (
          parsedUser.isOwner ||
          parsedUser.isAdmin ||
          parsedUser.id === "1492628172611518504" ||
          parsedUser.username === "hokysek" ||
          parsedUser.roles?.includes("1567522100523040914")
        ) {
          isDiscordOwnerOrAdmin = true;
          isVipUser = true;
        } else if (parsedUser.isVip) {
          isVipUser = true;
        }
      }
    } catch {}
  }

  const isAuthenticatedAdmin =
    Boolean(adminToken && adminToken.trim().length > 0) || isDiscordOwnerOrAdmin;

  // 2. Scenario: Authenticated Administrator (or Discord Owner)
  if (isAuthenticatedAdmin) {
    // If authenticated admin visits the login page, redirect to management dashboard
    if (pathname === `${ADMIN_BASE_PATH}/login`) {
      const dashboardUrl = new URL(`${ADMIN_BASE_PATH}/sprava`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Authenticated admin has unrestricted access to the entire store, catalog, cart, checkout & admin portal
    return NextResponse.next();
  }

  // 3. Scenario: Public Visitor / Unauthenticated Admin Area
  // Hidden admin login page must remain accessible so the admin can log in
  if (pathname === `${ADMIN_BASE_PATH}/login`) {
    return NextResponse.next();
  }

  // If unauthenticated user attempts to access any other admin page, redirect to login
  if (pathname.startsWith(ADMIN_BASE_PATH)) {
    const loginUrl = new URL(`${ADMIN_BASE_PATH}/login`, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Scenario: Discord Login pages (/prihlaseni, /prihlaseni/callback)
  if (pathname.startsWith("/prihlaseni")) {
    return NextResponse.next();
  }

  // 5. Scenario: Discord VIP early access check (isVipUser calculated above)
  if (isVipUser) {
    return NextResponse.next();
  }

  // If already on the countdown page, allow
  if (pathname === COUNTDOWN_PATH) {
    return NextResponse.next();
  }

  // All other public routes are locked and redirected to the Countdown / Maintenance page
  const countdownUrl = new URL(COUNTDOWN_PATH, request.url);
  return NextResponse.redirect(countdownUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except system paths, ACME SSL challenges, static files and images
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|\\.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
