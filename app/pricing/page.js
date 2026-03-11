import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function PricingPage() {
  const user = await getCurrentUser();

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
            <Link className="btn btn-dark" href={user ? "/dashboard" : "/login"}>
              {user ? "Dashboard" : "Login"}
            </Link>
          </div>
        </div>

        <section className="glass-panel">
          <h1 className="hero-title">
            <span className="gradient-text">Starter VM</span> pentru billing automat
          </h1>
          <p className="subtitle">
            Flux complet de la plată la provisioning VM și dezactivare automată când abonamentul este anulat.
          </p>
          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-label">Provisioning</div>
              <div className="stat-value">{"checkout.session.completed -> create VM"}</div>
            </article>
            <article className="stat-card">
              <div className="stat-label">Deprovisioning</div>
              <div className="stat-value">{"customer.subscription.deleted -> delete VM"}</div>
            </article>
            <article className="stat-card">
              <div className="stat-label">Billing Control</div>
              <div className="stat-value">Portal Stripe pentru update/cancel</div>
            </article>
          </div>
          <div className="button-row">
            <Link className="btn btn-brand" href={user ? "/dashboard" : "/register"}>
              {user ? "Continuă spre dashboard" : "Creează cont"}
            </Link>
            <Link className="btn btn-dark" href={user ? "/login" : "/login"}>
              {user ? "Schimbă cont" : "Am deja cont"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
