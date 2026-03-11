import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { authCookieOptions, signAuthToken, TOKEN_COOKIE } from "@/lib/auth";
import { createUser, findUserByEmail, publicUser } from "@/lib/users";
import { registerSchema } from "@/lib/validators";

export async function POST(request) {
  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Date invalide." }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: "Utilizatorul există deja." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({ email, passwordHash });
    const token = await signAuthToken(user);

    const response = NextResponse.json({ user: publicUser(user) }, { status: 201 });
    response.cookies.set(TOKEN_COOKIE, token, authCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
}
