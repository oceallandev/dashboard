# Dashboard Next.js (Template-style SaaS: Auth + Stripe + VM Webhooks)

Interfață inspirată din template-urile Vercel pentru SaaS/Stripe, cu:
- `register/login/logout` funcțional
- dashboard protejat
- pagini `Home` și `Pricing`
- Stripe Checkout + Billing Portal
- webhook Stripe pentru create/delete VM cu idempotency pe `event.id`

## 1) Instalare

```bash
npm install
cp .env.example .env.local
```

Completează `.env.local`:
- `AUTH_SECRET` (obligatoriu)
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` (pentru checkout)
- `STRIPE_WEBHOOK_SECRET` (opțional; dacă îl setezi, webhook-ul validează semnătura Stripe)
- `VM_CREATE_WEBHOOK_URL`, `VM_DELETE_WEBHOOK_URL` (opțional; dacă nu le setezi, evenimentele se salvează local în `data/vm-events.json`)

## 2) Rulare

```bash
npm run dev
```

Aplicația pornește pe `http://localhost:3000`.

Dacă vrei exact ca în exemplul tău pe port 5000:

```bash
PORT=5000 npm run dev
```

## 3) Rute UI

- `GET /` (landing)
- `GET /pricing`
- `GET /login`
- `GET /register`
- `GET /dashboard` (protejat)

## 4) Flux auth

- API:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`

Utilizatorii sunt salvați local în `data/users.json`.

## 5) Flux Stripe

- dashboard:
  - `POST /api/stripe/create-checkout-session`
  - `POST /api/stripe/create-portal-session`
- Stripe trimite evenimente la webhook:
  - `checkout.session.completed` => create VM
  - `customer.subscription.deleted` => delete VM

Webhook disponibil pe ambele rute:
- `POST /api/stripe/webhook`
- `POST /webhook`

## 6) Test rapid webhook (fără semnătură)

Funcționează dacă `STRIPE_WEBHOOK_SECRET` NU este setat:

```bash
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "customer.subscription.deleted",
    "data": {
      "object": {
        "customer": "cus_ABC123"
      }
    }
  }'
```

## 7) Ce urmează

- Legi `VM_CREATE_WEBHOOK_URL` și `VM_DELETE_WEBHOOK_URL` la serviciul tău real de provisioning/deprovisioning VM.
- Adaugi planuri multiple Stripe (mai multe `price_id`).
- Migrezi stocarea utilizatorilor din JSON într-o bază de date (PostgreSQL + Prisma).
