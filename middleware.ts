import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE_NAME = "czechbuy_admin_token";
const ADMIN_BASE_PATH = "/interni-portal-8f2a9x";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect internal portal paths
  if (pathname.startsWith(ADMIN_BASE_PATH)) {
    const isLoginPage = pathname === `${ADMIN_BASE_PATH}/login`;
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

    // If user is not authenticated and trying to access protected admin pages
    if (!token && !isLoginPage) {
      const loginUrl = new URL(`${ADMIN_BASE_PATH}/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    // If user is already authenticated and visits login page, redirect to management dashboard
    if (token && isLoginPage) {
      const dashboardUrl = new URL(`${ADMIN_BASE_PATH}/sprava`, request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/interni-portal-8f2a9x/:path*"],
};
