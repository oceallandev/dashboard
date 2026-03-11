import { readVmEvents } from "@/lib/db";

export async function getVmEventsForUser(user, limit = 25) {
  if (!user) return [];

  const events = await readVmEvents();
  return events
    .filter((event) => {
      if (event.userId && event.userId === user.id) return true;
      if (event.customerId && event.customerId === user.stripeCustomerId) return true;
      return false;
    })
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    .slice(0, limit);
}
