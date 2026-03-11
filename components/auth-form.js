"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/auth/${isLogin ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "A apărut o eroare.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="card">
        <h1 className="title">{isLogin ? "Login" : "Register"}</h1>
        <p className="subtitle">
          {isLogin
            ? "Intră în dashboard și gestionează abonamentul."
            : "Creează contul pentru a începe."}
        </p>

        <form onSubmit={onSubmit} className="stack">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nume@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label>
            Parolă
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="minim 6 caractere"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={6}
              required
            />
          </label>

          {error && <div className="alert alert-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Se procesează..." : isLogin ? "Login" : "Create account"}
          </button>
        </form>

        <p className="subtitle" style={{ marginTop: 18 }}>
          {isLogin ? "Nu ai cont?" : "Ai deja cont?"}{" "}
          <Link href={isLogin ? "/register" : "/login"} className="inline-link">
            {isLogin ? "Înregistrează-te" : "Mergi la login"}
          </Link>
        </p>
      </div>
    </div>
  );
}
