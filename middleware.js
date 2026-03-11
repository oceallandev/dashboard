import { NextResponse } from "next/server";

const COOKIE_NAME = "dashboard_auth";

export function middleware(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/stripe/create-checkout-session", "/api/stripe/create-portal-session"]
};
