import crypto from "node:crypto";
import { appendVmEvent } from "@/lib/db";
import { updateUser } from "@/lib/users";

async function callVmEndpoint(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`VM endpoint failed with ${response.status}`);
  }
}

export async function createVmForUser(user, context = {}) {
  const eventId = crypto.randomUUID();
  const vmId = context.vmId || `vm_${eventId.slice(0, 8)}`;
  const payload = {
    action: "create",
    eventId,
    userId: user?.id || null,
    customerId: context.customerId || user?.stripeCustomerId || null,
    subscriptionId: context.subscriptionId || user?.stripeSubscriptionId || null,
    vmId,
    at: new Date().toISOString()
  };

  if (process.env.VM_CREATE_WEBHOOK_URL) {
    await callVmEndpoint(process.env.VM_CREATE_WEBHOOK_URL, payload);
  } else {
    await appendVmEvent({
      ...payload,
      mode: "local-log"
    });
  }

  if (user?.id) {
    await updateUser(user.id, { vmId });
  }

  return payload;
}

export async function deleteVmForUser(user, context = {}) {
  const eventId = crypto.randomUUID();
  const payload = {
    action: "delete",
    eventId,
    userId: user?.id || null,
    customerId: context.customerId || user?.stripeCustomerId || null,
    subscriptionId: context.subscriptionId || user?.stripeSubscriptionId || null,
    vmId: context.vmId || user?.vmId || null,
    at: new Date().toISOString()
  };

  if (process.env.VM_DELETE_WEBHOOK_URL) {
    await callVmEndpoint(process.env.VM_DELETE_WEBHOOK_URL, payload);
  } else {
    await appendVmEvent({
      ...payload,
      mode: "local-log"
    });
  }

  if (user?.id) {
    await updateUser(user.id, { vmId: null });
  }

  return payload;
}
