"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function AuthForm({ mode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isLogin = mode === "login";

  const passwordChecks = useMemo(
    () => ({
      min: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      digit: /\d/.test(password)
    }),
    [password]
  );

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
    <main className="page-shell">
      <div className="layout-wrap">
        <div className="top-nav">
          <div className="logo">
            <span className="logo-dot" />
            Nebula VM
          </div>
          <div className="nav-actions">
            <Link className="btn btn-dark" href="/">
              Acasă
            </Link>
          </div>
        </div>

        <section className="glass-panel auth-panel">
          <h1 className="hero-title">{isLogin ? "Intră în cont" : "Creează cont nou"}</h1>
          <p className="subtitle">
            {isLogin
              ? "Accesează dashboard-ul, gestionează abonamentul și monitorizează webhook-urile VM."
              : "Înregistrare rapidă cu reguli de securitate pentru parolă."}
          </p>

          <form className="form-stack" onSubmit={onSubmit}>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nume@domeniu.com"
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
                placeholder={isLogin ? "Parola contului tău" : "minim 8 caractere, Aa1"}
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={isLogin ? 1 : 8}
                required
              />
            </label>

            {!isLogin && (
              <div className="badges">
                <span className="badge">
                  <span className={`badge-dot ${passwordChecks.min ? "success" : "warning"}`} />
                  minim 8
                </span>
                <span className="badge">
                  <span className={`badge-dot ${passwordChecks.upper ? "success" : "warning"}`} />
                  literă mare
                </span>
                <span className="badge">
                  <span className={`badge-dot ${passwordChecks.lower ? "success" : "warning"}`} />
                  literă mică
                </span>
                <span className="badge">
                  <span className={`badge-dot ${passwordChecks.digit ? "success" : "warning"}`} />
                  cifră
                </span>
              </div>
            )}

            {error && <div className="alert error">{error}</div>}

            <div className="button-row">
              <button className="btn btn-brand" type="submit" disabled={loading}>
                {loading ? "Se procesează..." : isLogin ? "Login" : "Create account"}
              </button>
              <Link href={isLogin ? "/register" : "/login"} className="btn btn-dark">
                {isLogin ? "Nu am cont" : "Am deja cont"}
              </Link>
            </div>
          </form>

          <p className="subtitle" style={{ marginTop: 10 }}>
            Poți reveni oricând la <Link className="inline-link" href="/">pagina principală</Link>.
          </p>
        </section>
      </div>
    </main>
  );
}
