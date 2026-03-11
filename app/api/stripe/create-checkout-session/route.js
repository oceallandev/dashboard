import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/session";
import { getStripeClient, getAppUrl } from "@/lib/stripe";
import { updateUser } from "@/lib/users";

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_ID;

  if (!priceId) {
    return NextResponse.json(
      {
        error: "Lipsește variabila STRIPE_PRICE_ID."
      },
      { status: 500 }
    );
  }

  try {
    const stripe = getStripeClient();
    const appUrl = getAppUrl(request);

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id
        }
      });
      customerId = customer.id;
      await updateUser(user.id, { stripeCustomerId: customerId });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${appUrl}/dashboard?success=1`,
      cancel_url: `${appUrl}/dashboard?canceled=1`,
      customer: customerId,
      customer_update: {
        address: "auto",
        name: "auto"
      },
      client_reference_id: user.id,
      metadata: {
        userId: user.id
      },
      subscription_data: {
        metadata: {
          userId: user.id
        }
      }
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
