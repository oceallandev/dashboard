import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { authCookieOptions, signAuthToken, TOKEN_COOKIE } from "@/lib/auth";
import { findUserByEmail, publicUser } from "@/lib/users";
import { loginSchema } from "@/lib/validators";

export async function POST(request) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Credentiale invalide." }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Credentiale invalide." }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Credentiale invalide." }, { status: 401 });
    }

    const token = await signAuthToken(user);
    const response = NextResponse.json({ user: publicUser(user) }, { status: 200 });
    response.cookies.set(TOKEN_COOKIE, token, authCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ error: "Cerere invalidă." }, { status: 400 });
  }
}
