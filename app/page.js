import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="page-wrap">
      <div className="card dashboard-card">
        <h1 className="title">VM SaaS Dashboard</h1>
        <p className="subtitle">
          Template-style setup în Next.js: auth, Stripe subscriptions, webhook-uri pentru provisioning VM.
        </p>

        <div className="btn-row" style={{ marginTop: 18 }}>
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Mergi la dashboard
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn-primary">
                Create account
              </Link>
              <Link href="/login" className="btn-muted">
                Login
              </Link>
            </>
          )}
          <Link href="/pricing" className="btn-muted">
            Vezi pricing
          </Link>
        </div>

        <div className="dashboard-grid">
          <div className="kv">
            <span>Auth</span>
            <strong>Register / Login / Logout</strong>
          </div>
          <div className="kv">
            <span>Billing</span>
            <strong>Stripe Checkout + Billing Portal</strong>
          </div>
          <div className="kv">
            <span>Provisioning</span>
            <strong>Webhook create/delete VM</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
