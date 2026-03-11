import Link from "next/link";
import { getCurrentUser } from "@/lib/session";

export default async function PricingPage() {
  const user = await getCurrentUser();

  return (
    <div className="page-wrap">
      <div className="card dashboard-card">
        <h1 className="title">Pricing</h1>
        <p className="subtitle">Plan simplu pentru dashboard + provisioning VM prin webhook Stripe.</p>

        <div className="dashboard-grid">
          <div className="kv">
            <span>Plan</span>
            <strong>Starter VM</strong>
          </div>
          <div className="kv">
            <span>Include</span>
            <strong>1 VM activ + billing management</strong>
          </div>
          <div className="kv">
            <span>Activare</span>
            <strong>Automat la `checkout.session.completed`</strong>
          </div>
          <div className="kv">
            <span>Dezactivare</span>
            <strong>Automat la `customer.subscription.deleted`</strong>
          </div>
        </div>

        <div className="btn-row">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Continuă spre dashboard
            </Link>
          ) : (
            <>
              <Link href="/register" className="btn-primary">
                Începe acum
              </Link>
              <Link href="/login" className="btn-muted">
                Am deja cont
              </Link>
            </>
          )}
          <Link href="/" className="btn-muted">
            Înapoi acasă
          </Link>
        </div>
      </div>
    </div>
  );
}
