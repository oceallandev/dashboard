import "./globals.css";

export const metadata = {
  title: "Nebula VM Dashboard",
  description: "Dashboard SaaS complet: auth, Stripe subscriptions, webhook-uri și VM orchestration."
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
