import crypto from "node:crypto";
import { readUsers, writeUsers } from "@/lib/db";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function findUserByEmail(email) {
  const users = await readUsers();
  const normalized = normalizeEmail(email);
  return users.find((user) => user.email === normalized) || null;
}

export async function findUserById(id) {
  const users = await readUsers();
  return users.find((user) => user.id === id) || null;
}

export async function findUserByStripeCustomerId(customerId) {
  if (!customerId) return null;
  const users = await readUsers();
  return users.find((user) => user.stripeCustomerId === customerId) || null;
}

export async function createUser({ email, passwordHash }) {
  const users = await readUsers();
  const normalizedEmail = normalizeEmail(email);
  const now = new Date().toISOString();

  const user = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash,
    createdAt: now,
    updatedAt: now,
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionStatus: "inactive",
    vmId: null
  };

  users.push(user);
  await writeUsers(users);
  return user;
}

export async function updateUser(userId, patch) {
  const users = await readUsers();
  const index = users.findIndex((user) => user.id === userId);
  if (index < 0) return null;

  const nextUser = {
    ...users[index],
    ...patch,
    updatedAt: new Date().toISOString()
  };

  users[index] = nextUser;
  await writeUsers(users);
  return nextUser;
}
