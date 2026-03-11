import { createRemoteJWKSet, jwtVerify } from "jose";
import { getAppUrl } from "@/lib/stripe";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = new URL("https://www.googleapis.com/oauth2/v3/certs");
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];

const googleJwks = createRemoteJWKSet(GOOGLE_JWKS_URL);

export function getGoogleOAuthConfig(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const appUrl = getAppUrl(request);
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  return {
    clientId,
    clientSecret,
    redirectUri
  };
}

export function createGoogleAuthUrl({ clientId, redirectUri, state }) {
  const url = new URL(GOOGLE_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "select_account");
  return url;
}

export async function exchangeCodeForGoogleIdToken({ code, clientId, clientSecret, redirectUri }) {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code"
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const data = await response.json();
  if (!response.ok || !data.id_token) {
    throw new Error("Google token exchange failed.");
  }

  return data.id_token;
}

export async function verifyGoogleIdToken(idToken, clientId) {
  const { payload } = await jwtVerify(idToken, googleJwks, {
    issuer: GOOGLE_ISSUERS,
    audience: clientId
  });

  if (!payload.sub || !payload.email || !payload.email_verified) {
    throw new Error("Google account data invalid.");
  }

  return {
    googleId: String(payload.sub),
    email: String(payload.email).toLowerCase(),
    name: payload.name ? String(payload.name) : null,
    avatarUrl: payload.picture ? String(payload.picture) : null
  };
}
