import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/auth/login", "/auth/register",
  "/api/auth/login", "/api/auth/register",
  "/plan", "/explore",
];

const STATIC_ASSETS = /\.(jpg|jpeg|png|gif|svg|css|js|ico|woff2?)$/;
const PROTECTED_ROUTES = [
  "/dashboard", "/bookings", "/chat", "/checkout", "/profile",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_ASSETS.test(pathname)) return NextResponse.next();
  if (pathname === "/" || pathname.startsWith("/_next")) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.next();
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) return NextResponse.next();

  // Only protect specific routes
  const needsAuth = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  if (!needsAuth) return NextResponse.next();

  const session = request.cookies.get("ata_session");
  if (!session?.value) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|favicon.ico).*)"],
};
