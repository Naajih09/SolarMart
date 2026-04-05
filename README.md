# SolarMart

SolarMart has pivoted into an e-commerce and affiliate marketplace MVP built with React, Vite, Tailwind CSS, and Vercel serverless APIs.

## Current MVP Surface

- Storefront homepage
- Product catalogue with filters
- Product detail pages
- Client-side cart
- Guest checkout flow
- Affiliate dashboard and referral capture
- NEPA bill calculator with product recommendation
- Lead email endpoint
- Checkout initialization endpoint

## Routes

- `/`
- `/products`
- `/products/:slug`
- `/cart`
- `/checkout`
- `/dashboard`
- `/affiliate`
- `/login`
- `/register`
- `/calculator`
- `/ref/:affiliateCode`

## API Routes

- `/api/products`
- `/api/products/:id`
- `/api/cart`
- `/api/checkout`
- `/api/affiliate`
- `/api/affiliate/:code`
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

`DATABASE_URL` is reserved for the PostgreSQL-backed production phase. The current MVP uses shared catalog data and client-side cart state so the UI and serverless routes are already wired while payment and persistence credentials are still being completed.
