import { NextResponse } from "next/server";
import { addProcessedStripeEvent, hasProcessedStripeEvent } from "@/lib/db";
import { getStripeClient } from "@/lib/stripe";
import { createVmForUser, deleteVmForUser } from "@/lib/vm";
import {
  findUserById,
  findUserByStripeCustomerId,
  findUserByStripeSubscriptionId,
  updateUser
} from "@/lib/users";

async function parseStripeEvent(request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (webhookSecret) {
    if (!signature) {
      throw new Error("Missing Stripe signature header.");
    }

    const stripe = getStripeClient();
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }

  return JSON.parse(rawBody);
}

async function handleCheckoutCompleted(session) {
  const userId = session.client_reference_id || session.metadata?.userId;
  const customerId = typeof session.customer === "string" ? session.customer : null;
  const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;

  let user = null;
  if (userId) {
    user = await findUserById(userId);
  }
  if (!user && customerId) {
    user = await findUserByStripeCustomerId(customerId);
  }
  if (!user) return;

  const updated = await updateUser(user.id, {
    stripeCustomerId: customerId || user.stripeCustomerId,
    stripeSubscriptionId: subscriptionId || user.stripeSubscriptionId,
    subscriptionStatus: "active"
  });

  if (!updated.vmId) {
    await createVmForUser(updated, {
      customerId,
      subscriptionId
    });
  }
}

async function handleSubscriptionUpdated(subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
  const subscriptionId = typeof subscription.id === "string" ? subscription.id : null;
  if (!customerId && !subscriptionId) return;

  let user = null;
  if (customerId) {
    user = await findUserByStripeCustomerId(customerId);
  }
  if (!user && subscriptionId) {
    user = await findUserByStripeSubscriptionId(subscriptionId);
  }
  if (!user) return;

  await updateUser(user.id, {
    stripeCustomerId: customerId || user.stripeCustomerId,
    stripeSubscriptionId: subscriptionId || user.stripeSubscriptionId,
    subscriptionStatus: subscription.status || user.subscriptionStatus
  });
}

async function handleSubscriptionDeleted(subscription) {
  const customerId = typeof subscription.customer === "string" ? subscription.customer : null;
  const subscriptionId = typeof subscription.id === "string" ? subscription.id : null;
  if (!customerId && !subscriptionId) return;

  let user = null;
  if (customerId) {
    user = await findUserByStripeCustomerId(customerId);
  }
  if (!user && subscriptionId) {
    user = await findUserByStripeSubscriptionId(subscriptionId);
  }
  if (!user) return;

  const updated = await updateUser(user.id, {
    stripeSubscriptionId: null,
    subscriptionStatus: "canceled"
  });

  await deleteVmForUser(updated, {
    customerId
  });
}

async function handleInvoicePaymentFailed(invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
  if (!customerId) return;

  const user = await findUserByStripeCustomerId(customerId);
  if (!user) return;

  await updateUser(user.id, {
    subscriptionStatus: "past_due"
  });
}

async function handleInvoicePaid(invoice) {
  const customerId = typeof invoice.customer === "string" ? invoice.customer : null;
  if (!customerId) return;

  const user = await findUserByStripeCustomerId(customerId);
  if (!user) return;

  await updateUser(user.id, {
    subscriptionStatus: "active"
  });
}

export async function POST(request) {
  try {
    const event = await parseStripeEvent(request);
    if (event.id && (await hasProcessedStripeEvent(event.id))) {
      return NextResponse.json({ received: true, duplicate: true }, { status: 200 });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object);
        break;
      default:
        break;
    }

    if (event.id) {
      await addProcessedStripeEvent(event.id);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
