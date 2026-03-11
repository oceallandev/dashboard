# Nebula VM Dashboard

Dashboard SaaS în Next.js cu:
- auth complet (`register/login/logout`) cu cookie JWT
- Stripe Checkout subscriptions + Billing Portal
- webhook lifecycle pentru provisioning/deprovisioning VM
- idempotency pentru evenimente Stripe
- activity timeline VM și system health badges
- UI premium glass/marble (responsive desktop + mobile)

## Setup local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Aplicația rulează implicit pe `http://localhost:3000`.

## Variabile de mediu

Obligatorii pentru producție:
- `AUTH_SECRET`

Necesare pentru Stripe billing:
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET` (recomandat puternic în production)

Opționale pentru provisioning extern VM:
- `VM_CREATE_WEBHOOK_URL`
- `VM_DELETE_WEBHOOK_URL`

Fără VM webhooks externe, evenimentele VM sunt logate local în `data/vm-events.json`.

## Rute principale

UI:
- `/`
- `/pricing`
- `/login`
- `/register`
- `/dashboard`

API:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/create-portal-session`
- `POST /api/stripe/webhook`
- `POST /webhook`
- `GET /api/system/status`

## Webhook test (dev mode, fără semnătură)

Dacă `STRIPE_WEBHOOK_SECRET` nu este setat:

```bash
curl -X POST http://localhost:3000/webhook \
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

## Calitate

```bash
npm run lint
npm run build
```
