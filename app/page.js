import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getSystemStatus } from "@/lib/system-status";

export default async function HomePage() {
  const user = await getCurrentUser();
  const system = getSystemStatus();

  return (
    <main className="page-shell">
      <div className="layout-wrap">
        <div className="top-nav">
          <div className="logo">
            <span className="logo-dot" />
            Nebula VM
          </div>
          <div className="nav-actions">
            {user ? (
              <Link className="btn btn-dark" href="/dashboard">
                Dashboard
              </Link>
            ) : (
              <>
                <Link className="btn btn-dark" href="/login">
                  Login
                </Link>
                <Link className="btn btn-brand" href="/register">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="hero-grid">
          <section className="glass-panel">
            <h1 className="hero-title">
              Dashboard premium pentru <span className="gradient-text">Stripe + VM orchestration</span>
            </h1>
            <p className="subtitle">
              Setup complet pentru autentificare, billing subscriptions, webhooks idempotente și management VM.
              Gândit pentru iterații rapide și deployment pe Vercel.
            </p>
            <div className="button-row">
              <Link className="btn btn-brand" href={user ? "/dashboard" : "/register"}>
                {user ? "Deschide dashboard" : "Începe acum"}
              </Link>
              <Link className="btn btn-dark" href="/pricing">
                Vezi pricing
              </Link>
            </div>
            <div className="badges">
              <span className="badge">
                <span className={`badge-dot ${system.hasStripeCore ? "success" : "warning"}`} />
                Stripe core {system.hasStripeCore ? "configurat" : "lipsă env"}
              </span>
              <span className="badge">
                <span className={`badge-dot ${system.hasWebhookSecret ? "success" : "warning"}`} />
                Webhook verification {system.hasWebhookSecret ? "activ" : "dev mode"}
              </span>
              <span className="badge">
                <span className={`badge-dot ${system.hasAuthSecret ? "success" : "warning"}`} />
                Auth secret {system.hasAuthSecret ? "setat" : "fallback"}
              </span>
            </div>
          </section>

          <section className="glass-panel">
            <h2 className="section-title">Ce ai gata din start</h2>
            <div className="stats-grid">
              <article className="stat-card">
                <div className="stat-label">Autentificare</div>
                <div className="stat-value">Register, login, logout, cookie JWT</div>
              </article>
              <article className="stat-card">
                <div className="stat-label">Billing</div>
                <div className="stat-value">Stripe Checkout + Billing Portal</div>
              </article>
              <article className="stat-card">
                <div className="stat-label">Infrastructure</div>
                <div className="stat-value">Webhook create/delete VM cu audit events</div>
              </article>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
