import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/auth/login", "/auth/register", "/api/auth/login", "/api/auth/register"];
const STATIC_ASSETS = /\.(jpg|jpeg|png|gif|svg|css|js|ico|woff2?)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets and public routes
  if (STATIC_ASSETS.test(pathname)) return NextResponse.next();
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) return NextResponse.next();
  if (pathname === "/" || pathname.startsWith("/_next")) return NextResponse.next();
  if (pathname.startsWith("/api/")) return NextResponse.next(); // Allow all API routes for now

  // Check session cookie for protected pages
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
