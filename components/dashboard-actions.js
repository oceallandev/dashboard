"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardActions({ hasCustomer }) {
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");

  const startCheckout = async () => {
    setCheckoutLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST"
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Checkout indisponibil.");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Nu am primit URL-ul de checkout.");
    } catch (err) {
      setError(err.message);
      setCheckoutLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setPortalLoading(true);
    setError("");

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST"
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Portalul de billing nu e disponibil.");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("Nu am primit URL-ul portalului.");
    } catch (err) {
      setError(err.message);
      setPortalLoading(false);
    }
  };

  const logout = async () => {
    setLogoutLoading(true);
    setError("");

    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setError("Nu am putut face logout.");
      setLogoutLoading(false);
    }
  };

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="btn-row">
        <button className="btn-primary" onClick={startCheckout} disabled={checkoutLoading}>
          {checkoutLoading ? "Redirecționez..." : "Plătește cu Stripe"}
        </button>
        {hasCustomer && (
          <button className="btn-muted" onClick={openBillingPortal} disabled={portalLoading}>
            {portalLoading ? "Deschid..." : "Manage billing"}
          </button>
        )}
        <button className="btn-danger" onClick={logout} disabled={logoutLoading}>
          {logoutLoading ? "Ies..." : "Logout"}
        </button>
      </div>
    </>
  );
}
