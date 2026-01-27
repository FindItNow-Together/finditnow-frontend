import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/sign_up", "/forbidden", "/api"];

const PROTECTED_PREFIXES = ["/admin", "/customer", "/shop", "/delivery"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //Always allow public routes
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check if route is protected
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) {
    return NextResponse.next();
  }

  //Guard protected routes
  const refreshToken = req.cookies.get("refreshToken");

  if (!refreshToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
