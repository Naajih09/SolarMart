# SolarMart

Responsive React + Tailwind marketing website for SolarMart, built around lead generation for solar installations.

## Stack

- React
- Vite
- Tailwind CSS
- Vercel-ready API endpoint for lead submissions

## Pages

- Home
- About
- Solar Packages
- How It Works
- Calculator
- Contact
- Quote Request

## Local development

1. Install dependencies with `npm install`
2. Start the app with `npm run dev`

For local API testing, run the project with `vercel dev` or deploy to Vercel so the `/api/lead` endpoint is available.

## Lead engine setup

The form endpoint is production-oriented now and will only return success when a real delivery target is configured.

Use one of these options:

- Email delivery with Resend:
  - `RESEND_API_KEY`
  - `LEAD_NOTIFICATION_EMAIL`
  - Optional: `LEAD_FROM_EMAIL`
- Webhook delivery:
  - `LEAD_WEBHOOK_URL`

Current SolarMart public contact values are wired into the frontend, and local lead notifications are set to `Naajihibnsiraj@gmail.com`.

Before production submissions will work, add one of these:

- `RESEND_API_KEY` for direct email delivery through Resend
- `LEAD_WEBHOOK_URL` for delivery to Zapier, Make, n8n, or your own backend

Copy `.env.example` into `.env.local` for local testing, or add the same variables in your Vercel project settings.
