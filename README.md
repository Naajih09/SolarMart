# SolarMart Monorepo

SolarMart now uses a `pnpm` workspace monorepo with separate frontend apps for the customer storefront and the admin workspace, plus shared Vercel serverless APIs at the repository root.

## Workspace Layout

- `apps/user-web`
  Customer storefront for products, cart, checkout, calculator, affiliate flow, and customer account access.
- `apps/admin-web`
  Admin-facing workspace for product management, affiliate approvals, and order oversight.
- `packages/shared`
  Shared React components, pages, contexts, styles, utilities, and site constants used by both frontends.
- `api`
  Shared backend endpoints for auth, store, admin actions, affiliate flow, checkout, and lead notifications.

## Frontend Routes

### User web

- `/`
- `/products`
- `/products/:slug`
- `/cart`
- `/checkout`
- `/checkout/success`
- `/dashboard`
- `/affiliate`
- `/login`
- `/register`
- `/calculator`
- `/ref/:affiliateCode`

### Admin web

- `/`
- `/dashboard`
- `/login`

## API Routes

- `/api/store?action=products`
- `/api/store?action=products&id=<slug-or-id>`
- `/api/store?action=cart`
- `/api/store?action=checkout`
- `/api/store?action=verify`
- `/api/affiliate?action=signup`
- `/api/affiliate?action=stats&code=<affiliate-code>`
- `/api/affiliate?action=track`
- `/api/auth?action=register`
- `/api/auth?action=login`
- `/api/auth?action=me`
- `/api/auth?action=logout`
- `/api/admin?action=products`
- `/api/admin?action=orders`
- `/api/admin?action=affiliates`
- `/api/lead`

## Package Manager

Use `pnpm` from the repo root:

```bash
pnpm install
```

## Local Development

### Backend and server env

Copy the root env file and set the server-side secrets:

```bash
cp .env.example .env.local
```

Root env variables:

- `RESEND_API_KEY`
- `LEAD_NOTIFICATION_EMAIL`
- `LEAD_FROM_EMAIL`
- `LEAD_WEBHOOK_URL`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_CALLBACK_URL`
- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

### Frontend env

The frontend apps only need the API origin:

`apps/user-web/.env.local`

```env
VITE_API_BASE_URL=http://localhost:3000
```

`apps/admin-web/.env.local`

```env
VITE_API_BASE_URL=http://localhost:3000
```

If you run a frontend on the same domain as the API, `VITE_API_BASE_URL` can be left empty.

### Run the apps

Customer storefront:

```bash
pnpm dev:user
```

Admin workspace:

```bash
pnpm dev:admin
```

To exercise the Vercel serverless routes locally, run Vercel from the root repo:

```bash
npx vercel dev
```

## Build Commands

Build both apps:

```bash
pnpm build
```

Build only the customer storefront:

```bash
pnpm build:user
```

Build only the admin workspace:

```bash
pnpm build:admin
```

## Production Deployment Shape

Recommended Vercel project split:

1. `solarmart-api`
   Root directory: repository root
   Purpose: serverless API routes and shared backend env
2. `solarmart-user-web`
   Root directory: `apps/user-web`
   Env: `VITE_API_BASE_URL=https://your-api-domain.com`
3. `solarmart-admin-web`
   Root directory: `apps/admin-web`
   Env: `VITE_API_BASE_URL=https://your-api-domain.com`

## Production Notes

- Products are now database-only and no longer auto-sync from demo seed data at runtime.
- Admin users add and delete products from the admin dashboard.
- Successful payment verification creates orders and order items in PostgreSQL through `/api/store?action=verify`.
- Order notification emails are sent to `LEAD_NOTIFICATION_EMAIL` using Resend after verified checkout.
- Guest checkout is allowed, with optional account creation at checkout.
- If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are provided, the first admin account is auto-created in the database.
