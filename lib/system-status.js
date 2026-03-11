export function getSystemStatus() {
  const hasAuthSecret = Boolean(process.env.AUTH_SECRET);
  const hasStripeCore = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
  const hasWebhookSecret = Boolean(process.env.STRIPE_WEBHOOK_SECRET);
  const hasVmCreateHook = Boolean(process.env.VM_CREATE_WEBHOOK_URL);
  const hasVmDeleteHook = Boolean(process.env.VM_DELETE_WEBHOOK_URL);

  return {
    hasAuthSecret,
    hasStripeCore,
    hasWebhookSecret,
    hasVmCreateHook,
    hasVmDeleteHook,
    mode: hasVmCreateHook && hasVmDeleteHook ? "remote-vm-hooks" : "local-vm-log"
  };
}
