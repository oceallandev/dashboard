import { redirect } from "next/navigation";
import Link from "next/link";
import DashboardActions from "@/components/dashboard-actions";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const success = searchParams?.success;
  const canceled = searchParams?.canceled;

  return (
    <div className="page-wrap">
      <div className="card dashboard-card">
        <h1 className="title">Dashboard VM</h1>
        <p className="subtitle">Gestionează contul, abonamentul Stripe și webhook-urile VM.</p>

        <div className="dashboard-grid">
          <div className="kv">
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div className="kv">
            <span>Status abonament</span>
            <strong>{user.subscriptionStatus || "inactive"}</strong>
          </div>
          <div className="kv">
            <span>Stripe customer</span>
            <strong>{user.stripeCustomerId || "-"}</strong>
          </div>
          <div className="kv">
            <span>VM ID</span>
            <strong>{user.vmId || "-"}</strong>
          </div>
        </div>

        <div className="stack">
          {success && <div className="alert">Plata a fost finalizată. Așteaptă webhook-ul Stripe.</div>}
          {canceled && <div className="alert alert-error">Plata a fost anulată.</div>}
          <DashboardActions hasCustomer={Boolean(user.stripeCustomerId)} />
          <p className="subtitle">
            Vrei să vezi planul înainte de checkout?{" "}
            <Link className="inline-link" href="/pricing">
              Vezi pricing
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
