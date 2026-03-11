import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { authCookieOptions, signAuthToken, TOKEN_COOKIE } from "@/lib/auth";
import { createUser, findUserByEmail, publicUser } from "@/lib/users";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email și parolă sunt obligatorii." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Parola trebuie să aibă minim 6 caractere." }, { status: 400 });
    }

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
