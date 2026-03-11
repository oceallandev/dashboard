import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "dashboard_auth";
const AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";
const AUTH_KEY = new TextEncoder().encode(AUTH_SECRET);

async function isAuthenticated(token) {
  if (!token) return false;
  try {
    await jwtVerify(token, AUTH_KEY);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const ok = await isAuthenticated(token);
  if (!ok) {
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
