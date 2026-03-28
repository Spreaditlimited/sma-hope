# SMA Hope Foundation Nigeria Website

Official website codebase for `smahope.org`, built with Next.js App Router, TypeScript, and Tailwind CSS.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Sanity-ready content integration
- Vercel-ready deployment
- Stripe/Paystack payment scaffolding

## Routes

- `/`
- `/about`
- `/what-is-sma`
- `/our-story`
- `/support-for-families`
- `/book`
- `/donate`
- `/contact`
- `/updates`
- `/updates/[slug]`
- `/transparency`
- `/faqs`
- `/privacy-policy`
- `/terms`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Run development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Content Management

Sanity schema files are in `src/sanity/schemas`.
Default Sanity connection is set to project `80lf2wvv` and dataset `production` (overridable via env vars).

Current schema coverage:

- site settings
- blog updates posts
- FAQ items
- book settings
- donation settings
- footer settings

If Sanity env vars are missing, the site automatically falls back to local content in `src/content`.

## Contact Form

- API route: `src/app/api/contact/route.ts`
- Purpose routing is mapped in `src/lib/contact-routing.ts`
- Anti-spam implemented using honeypot field and minimum submit-time check
- Email delivery uses Resend API via `src/lib/email.ts`

## Payments

Scaffold endpoints are implemented at:

- `src/app/api/payments/stripe/route.ts`
- `src/app/api/payments/paystack/route.ts`
- `src/app/api/payments/paystack/webhook/route.ts`
- `src/app/api/payments/paystack/complete/route.ts`
- `src/app/api/payments/book/stripe/route.ts`
- `src/app/api/payments/book/paystack/route.ts`

These are designed for easy credential swap-in and production checkout wiring.

## FEZ Delivery Fulfillment

- FEZ client: `src/lib/fez/client.ts`
- FEZ webhook endpoint: `src/app/api/fez/webhook/route.ts`
- FEZ sync endpoint: `src/app/api/fez/sync/route.ts`
- Book order payment persistence automatically attempts FEZ shipment creation in `src/lib/payments/processing.ts` after successful Paystack verification.

Recommended setup:

1. Configure FEZ env vars in `.env.local` (`FEZ_BASE_URL`, `FEZ_USER_ID`, `FEZ_PASSWORD`, `FEZ_ORG_SECRET_KEY`).
2. Register webhook URL in FEZ dashboard/API to:
   - `https://<your-domain>/api/fez/webhook?token=<FEZ_WEBHOOK_TOKEN>`
3. For fallback polling, call:
   - `POST /api/fez/sync` with `Authorization: Bearer <FEZ_SYNC_SECRET>`
4. Generate app-side FEZ secrets:

```bash
node -e "console.log('FEZ_WEBHOOK_TOKEN=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('FEZ_SYNC_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

## Donor Accounts and Dashboard

- Account routes:
  - `/account`
  - `/account/login`
  - `/account/reset-password`
- Supabase schema file: `supabase/schema.sql`
- Apply schema in Supabase SQL editor before using donor dashboard and webhook persistence.

## Admin Panel

- Admin routes:
  - `/admin`
  - `/admin/donations`
  - `/admin/book-orders`
  - `/admin/donors`
  - `/admin/settings`
- Role table: `public.admin_users` (created in `supabase/schema.sql`)
- Roles: `admin`, `ops`
- Admin and donor login both use Supabase auth at `/account/login`.

Bootstrap first admin:

```sql
insert into public.admin_users (email, role, active)
values ('smahopefoundation@gmail.com', 'admin', true)
on conflict (email)
do update set role = excluded.role, active = excluded.active;
```

## SEO

- Per-page metadata via `src/lib/metadata.ts`
- Open Graph + Twitter tags
- Organization schema markup in `layout.tsx`
- `sitemap.ts` and `robots.ts`

## Accessibility and Performance Notes

- Semantic page structure
- Keyboard-focus styles and skip link
- Reduced client-side JS by default
- Optimized image usage via `next/image`
