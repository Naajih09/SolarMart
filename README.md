# SolarMart

SolarMart has pivoted into an e-commerce and affiliate marketplace MVP built with React, Vite, Tailwind CSS, and Vercel serverless APIs.

## Current MVP Surface

- Storefront homepage
- Product catalogue with filters
- Product detail pages
- Client-side cart
- Guest checkout flow
- Paystack checkout initialization and verification
- Affiliate dashboard and referral capture
- NEPA bill calculator with product recommendation
- Lead email endpoint
- Auth and admin endpoints

## Routes

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

## Local Development

1. Install dependencies with `npm install`
2. Start the storefront with `npm run dev`
3. Use `npm run vercel:dev` for local serverless route testing

## Environment Variables

### Email and lead delivery

- `RESEND_API_KEY`
- `LEAD_NOTIFICATION_EMAIL`
- `LEAD_FROM_EMAIL`
- `LEAD_WEBHOOK_URL`

### Checkout

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_CALLBACK_URL`

### Database

- `DATABASE_URL`

### Auth and admin bootstrap

- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Production Store Notes

- Product records are synced from [src/store/catalog.js](/c:/Users/DELL/OneDrive/Desktop/Naajih_code_space/SolarMart/src/store/catalog.js) into PostgreSQL the first time the product APIs run.
- Successful payment verification creates the order and order items in PostgreSQL through `/api/store?action=verify`.
- Order notification emails are sent to `LEAD_NOTIFICATION_EMAIL` using Resend after verified checkout.
- Guest checkout is allowed, with optional account creation at checkout.
- If `ADMIN_EMAIL` and `ADMIN_PASSWORD` are provided, the admin account is auto-created in the database.

## Deployment Checklist

1. Add all environment variables to the `solar-mart` Vercel project.
2. Provision a PostgreSQL database and set `DATABASE_URL`.
3. Add Paystack production credentials and set `PAYSTACK_CALLBACK_URL` to `https://your-domain.com/checkout/success`.
4. Add Resend credentials for order notifications.
5. Set `AUTH_SECRET` to a strong random value.
6. Optionally set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to bootstrap the first admin account.
7. Deploy and test:
   - product listing -> cart -> checkout
   - payment -> `/checkout/success`
   - order persistence in PostgreSQL
   - affiliate referral checkout
   - Resend order notification email
