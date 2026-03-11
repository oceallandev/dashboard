import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const VM_EVENTS_FILE = path.join(DATA_DIR, "vm-events.json");
const STRIPE_EVENTS_FILE = path.join(DATA_DIR, "stripe-events.json");

async function ensureJsonFile(filePath, fallback) {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(filePath, "utf8");
  } catch {
    await writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
  }
}

async function readJson(filePath, fallback) {
  await ensureJsonFile(filePath, fallback);
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

async function writeJson(filePath, data) {
  await ensureJsonFile(filePath, data);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}

export async function readUsers() {
  return readJson(USERS_FILE, []);
}

export async function writeUsers(users) {
  await writeJson(USERS_FILE, users);
}

export async function readVmEvents() {
  return readJson(VM_EVENTS_FILE, []);
}

export async function appendVmEvent(event) {
  const events = await readVmEvents();
  events.push(event);
  await writeJson(VM_EVENTS_FILE, events);
}

export async function readProcessedStripeEvents() {
  return readJson(STRIPE_EVENTS_FILE, []);
}

export async function hasProcessedStripeEvent(eventId) {
  if (!eventId) return false;
  const events = await readProcessedStripeEvents();
  return events.includes(eventId);
}

export async function addProcessedStripeEvent(eventId) {
  if (!eventId) return;
  const events = await readProcessedStripeEvents();
  if (events.includes(eventId)) return;
  events.push(eventId);
  await writeJson(STRIPE_EVENTS_FILE, events);
}
