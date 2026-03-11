import Link from "next/link";
import { redirect } from "next/navigation";
import DashboardActions from "@/components/dashboard-actions";
import { getCurrentUser } from "@/lib/session";
import { getSystemStatus } from "@/lib/system-status";
import { getVmEventsForUser } from "@/lib/activity";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("ro-RO", {
      dateStyle: "short",
      timeStyle: "short"
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function DashboardPage({ searchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [events, system] = await Promise.all([getVmEventsForUser(user, 18), Promise.resolve(getSystemStatus())]);
  const success = searchParams?.success;
  const canceled = searchParams?.canceled;

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
            <Link className="btn btn-dark" href="/pricing">
              Pricing
            </Link>
          </div>
        </div>

        <div className="dashboard-layout">
          <section className="glass-panel">
            <h1 className="hero-title">
              <span className="gradient-text">Control Center</span>
            </h1>
            <p className="subtitle">Gestionează billing-ul, statusul infrastructurii și evenimentele VM.</p>

            <div className="kpi-grid">
              <article className="kpi">
                <div className="key">Email</div>
                <div className="value">{user.email}</div>
              </article>
              <article className="kpi">
                <div className="key">Subscription</div>
                <div className="value">{user.subscriptionStatus || "inactive"}</div>
              </article>
              <article className="kpi">
                <div className="key">Stripe customer</div>
                <div className="value">{user.stripeCustomerId || "-"}</div>
              </article>
              <article className="kpi">
                <div className="key">VM ID</div>
                <div className="value">{user.vmId || "-"}</div>
              </article>
            </div>

            <div className="badges">
              <span className="badge">
                <span className={`badge-dot ${system.hasStripeCore ? "success" : "warning"}`} />
                Stripe core
              </span>
              <span className="badge">
                <span className={`badge-dot ${system.hasWebhookSecret ? "success" : "warning"}`} />
                Webhook signature
              </span>
              <span className="badge">
                <span className={`badge-dot ${system.hasVmCreateHook ? "success" : "warning"}`} />
                VM create hook
              </span>
              <span className="badge">
                <span className={`badge-dot ${system.hasVmDeleteHook ? "success" : "warning"}`} />
                VM delete hook
              </span>
            </div>

            <div className="form-stack">
              {success && (
                <div className="alert">
                  Plata s-a finalizat. Stripe va trimite webhook-ul și VM-ul va fi provisionat automat.
                </div>
              )}
              {canceled && <div className="alert error">Checkout-ul a fost anulat înainte de plată.</div>}
              <DashboardActions hasCustomer={Boolean(user.stripeCustomerId)} />
            </div>
          </section>

          <section className="glass-panel">
            <h2 className="section-title">Activity Timeline</h2>
            <p className="subtitle">
              Ultimele evenimente VM pentru contul tău. Dacă webhook-urile externe nu sunt setate, logurile sunt
              locale.
            </p>

            {events.length ? (
              <div className="timeline">
                {events.map((event) => (
                  <article key={event.eventId} className="timeline-item">
                    <div className="timeline-item-head">
                      <span className="action">{event.action}</span>
                      <span className="when">{formatDate(event.at)}</span>
                    </div>
                    <div className="meta">VM: {event.vmId || "-"}</div>
                    <div className="meta">Customer: {event.customerId || "-"}</div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-box">
                Nu există evenimente VM încă. După primul checkout și webhook vei vedea aici timeline-ul complet.
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
