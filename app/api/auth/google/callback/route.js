import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { authCookieOptions, signAuthToken, TOKEN_COOKIE } from "@/lib/auth";
import {
  exchangeCodeForGoogleIdToken,
  getGoogleOAuthConfig,
  verifyGoogleIdToken
} from "@/lib/google-oauth";
import { createOAuthUser, findUserByEmail, normalizeEmail, updateUser } from "@/lib/users";

const GOOGLE_STATE_COOKIE = "google_oauth_state";
const GOOGLE_NEXT_COOKIE = "google_oauth_next";

function clearCookie(response, name) {
  response.cookies.set(name, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0)
  });
}

function getSafeNext(nextPath) {
  if (!nextPath || !nextPath.startsWith("/")) return "/dashboard";
  return nextPath;
}

function errorRedirect(request, code) {
  const url = new URL(`/login?error=${code}`, request.url);
  const response = NextResponse.redirect(url);
  clearCookie(response, GOOGLE_STATE_COOKIE);
  clearCookie(response, GOOGLE_NEXT_COOKIE);
  return response;
}

export async function GET(request) {
  try {
    const config = getGoogleOAuthConfig(request);
    if (!config) {
      return errorRedirect(request, "google_not_configured");
    }

    const url = new URL(request.url);
    const error = url.searchParams.get("error");
    if (error) {
      return errorRedirect(request, "google_access_denied");
    }

    const state = url.searchParams.get("state");
    const code = url.searchParams.get("code");
    const stateCookie = request.cookies.get(GOOGLE_STATE_COOKIE)?.value;
    const nextCookie = request.cookies.get(GOOGLE_NEXT_COOKIE)?.value;

    if (!state || !stateCookie || state !== stateCookie || !code) {
      return errorRedirect(request, "google_invalid_state");
    }

    const idToken = await exchangeCodeForGoogleIdToken({
      code,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri
    });

    const profile = await verifyGoogleIdToken(idToken, config.clientId);
    const email = normalizeEmail(profile.email);
    const verifiedAt = new Date().toISOString();

    let user = await findUserByEmail(email);
    if (user) {
      user = await updateUser(user.id, {
        googleId: profile.googleId,
        name: profile.name || user.name,
        avatarUrl: profile.avatarUrl || user.avatarUrl,
        emailVerifiedAt: user.emailVerifiedAt || verifiedAt
      });
    } else {
      const randomPassword = `${crypto.randomUUID()}${crypto.randomUUID()}`;
      const passwordHash = await bcrypt.hash(randomPassword, 12);
      user = await createOAuthUser({
        email,
        passwordHash,
        googleId: profile.googleId,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
        emailVerifiedAt: verifiedAt
      });
    }

    const authToken = await signAuthToken(user);
    const redirectUrl = new URL(getSafeNext(nextCookie), request.url);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set(TOKEN_COOKIE, authToken, authCookieOptions());
    clearCookie(response, GOOGLE_STATE_COOKIE);
    clearCookie(response, GOOGLE_NEXT_COOKIE);
    return response;
  } catch {
    return errorRedirect(request, "google_login_failed");
  }
}
