import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/session";
import { getAppUrl, getStripeClient } from "@/lib/stripe";

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.stripeCustomerId) {
    return NextResponse.json({ error: "Nu există customer Stripe pentru acest cont." }, { status: 400 });
  }

  try {
    const stripe = getStripeClient();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getAppUrl(request)}/dashboard`
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
