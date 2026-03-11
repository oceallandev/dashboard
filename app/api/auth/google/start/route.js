import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createGoogleAuthUrl, getGoogleOAuthConfig } from "@/lib/google-oauth";

const GOOGLE_STATE_COOKIE = "google_oauth_state";
const GOOGLE_NEXT_COOKIE = "google_oauth_next";
const COOKIE_MAX_AGE = 60 * 10;

function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE
  };
}

function getSafeNext(nextPath) {
  if (!nextPath || !nextPath.startsWith("/")) return "/dashboard";
  return nextPath;
}

export async function GET(request) {
  const config = getGoogleOAuthConfig(request);
  if (!config) {
    const url = new URL("/login?error=google_not_configured", request.url);
    return NextResponse.redirect(url);
  }

  const reqUrl = new URL(request.url);
  const nextPath = getSafeNext(reqUrl.searchParams.get("next"));
  const state = crypto.randomUUID();
  const authUrl = createGoogleAuthUrl({
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    state
  });

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(GOOGLE_STATE_COOKIE, state, getCookieOptions());
  response.cookies.set(GOOGLE_NEXT_COOKIE, nextPath, getCookieOptions());
  return response;
}
