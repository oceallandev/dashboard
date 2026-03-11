import Stripe from "stripe";

export function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }
  return new Stripe(secretKey);
}

export function getAppUrl(request) {
  return process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000";
}
