import "./globals.css";

export const metadata = {
  title: "Dashboard VM",
  description: "Dashboard cu auth + Stripe + webhook-uri VM"
};

export default function RootLayout({ children }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
