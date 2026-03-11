import { cookies } from "next/headers";
import { TOKEN_COOKIE, verifyAuthToken } from "@/lib/auth";
import { findUserById, publicUser } from "@/lib/users";

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload?.sub) return null;

  const user = await findUserById(payload.sub);
  return publicUser(user);
}

export async function getUserFromRequest(request) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifyAuthToken(token);
  if (!payload?.sub) return null;

  const user = await findUserById(payload.sub);
  return publicUser(user);
}
