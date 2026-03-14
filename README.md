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
- `src/app/api/payments/book/stripe/route.ts`
- `src/app/api/payments/book/paystack/route.ts`

These are designed for easy credential swap-in and production checkout wiring.

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
