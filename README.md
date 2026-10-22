# SMA Hope Foundation

Nigeria-focused SMA information, foundation news, supporter accounts, and administration. Next.js 16, React 19, TypeScript, Tailwind, MySQL, and Better Auth. The website runs on Vercel; its dedicated `smahope` database runs on the owner’s Hostinger VPS alongside the separately isolated Effikos and UnsaidBox databases.

## Development

```sh
npm install
npm run dev -- --port 3002
```

Private configuration belongs in `.env.local`. See `.env.example`; never commit credentials or `.local/`. The database connection verifies TLS against `certificates/mysql-ca.pem`. `smahope_app` can only read and modify data in `smahope.*`; schema changes use the separately authorised infrastructure workflow. Connection pools are bounded and shared across development reloads. The public CA certificate is traced into Vercel functions.

## Accounts and administration

- Supporter login: `/account/login`; workspace: `/account`.
- Separate administrator login: `/admin/login`; workspace: `/admin`.
- Recovery: `/account/reset-password` and `/admin/reset-password`.
- Better Auth uses separate identity, credential, session, and recovery tables and cookie names for administrators and supporters. No public administrator registration exists. Passwords use Better Auth’s password implementation. Login and recovery requests are rate limited in MySQL.
- Every protected API verifies a server-side session. Supporter record ownership comes from that session, never a client-supplied email or ID. Mutating account/admin APIs validate the request origin. Admin roles are checked on the server; only `admin` can publish or invite administrators.
- Payment-created accounts receive a password setup link, never a temporary password in email. Imported Supabase users must choose a new password via recovery. Existing Supabase sessions/password hashes were not copied.
- Dashboard totals keep currencies separate and exclude unsuccessful donations. Supporter history covers the latest 100 records; administrator reporting paginates the selected period.

## Content and SEO

`/blog` contains eight initial guides for Nigerian families, with search, four topic pages, sources, related articles, and printable checklists. `/admin/content` provides a structured editor: drafts, live preview, publishing/unpublishing, source validation, stable URLs, revision conflict checks, and audit records. Published guides are stored in MySQL. Code-based initial guides are an initial fallback only when no database override exists. Configured database failures do not silently republish an unpublished article.

Clinical guides remain visibly **clinical review pending**. A qualified clinician must perform an actual review before the site claims medical review. Practical content and clinical advice remain distinct.

Existing foundation news URLs at `/updates/[slug]` remain available, using the existing Sanity content integration and local fallback. Public metadata, canonical URLs, sitemap, social previews, and Article/Organization structured data use `https://www.smahope.org`. Admin, account, and checkout routes are noindex; drafts do not enter the sitemap.

The book is unreleased. `/book` keeps the interest signup; `/order-book` redirects to it. Book checkout is closed unless `BOOK_SALES_OPEN=true` is deliberately configured. Existing order and delivery history is retained.

## Integrations

- Contact and password recovery: Hostinger SMTP through `src/lib/email.ts`. All transactional mail uses the approved cream/sage/navy template in `src/lib/email-template.ts`, a 140px logo, an explicit dark-mode logo variant, inline light styles, table layout, accessible text links, and a plain-text alternative. Dark-mode rendering depends on the receiving mail client.
- Newsletter and book interest: Brevo, with inline status and a validated list ID.
- Donations: Paystack initialization, signature-checked webhooks, and verified transaction completion.
- Existing book fulfilment: FEZ. The migration never creates shipments.
- Stripe routes return an explicit unavailable response; no fake checkout-success scaffold is exposed.

Existing payment webhook URLs remain unchanged. No live charge, marketing subscription, recovery email, or delivery should be created as a smoke test. For a provider checkout rehearsal, use a separately configured provider test environment.

## Database migration and recovery

`database/001-initial.sql` defines the dedicated MySQL schema; `002-integrity.sql` adds ownership foreign keys and history indexes. `supabase/schema.sql` is retained only as the historical source schema.

The 22 October 2026 migration preserved 2 supporter profiles, 9 donations, 3 book orders, 13 payment events, and 1 admin record, plus 3 personal identities. Every imported field was compared before committing. Supabase was left intact as a recovery copy. Supabase connection variables were removed from Vercel and local runtime configuration; recovery-only settings are held privately in `.local/supabase-recovery.env`. Private encrypted source backups and the migration report are under `.local/`.

Daily encrypted MySQL backups run at 02:45 UTC (with up to five minutes of jitter), retain 30 days, and are restricted to this database. A restore into a temporary schema and normalized re-export comparison passed. An encrypted recovery copy and key are saved privately off the VPS. This is an initial off-server recovery copy, not continuous off-server replication. Keep the key in an owner-controlled password manager. See `operations/backup/README.md`.

Do not rerun the initial migration over a populated database. Before cutting over, compare source records again for payments received since the export. Do not roll back to Supabase after new MySQL writes without reconciling those records.

## Verification

```sh
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run verify:site
node tests/integration/access.mjs
```

The route checker verifies 28 public pages, metadata, canonical URLs, one H1/main landmark, structured data, sitemap coverage, private noindex directives, 404s, social imagery, and unauthenticated API denial. Integration tests use temporary records and clean them up: supporter ownership, separate admin/user sessions, logout isolation, role restrictions, origin checks, draft isolation, publishing, sitemap inclusion, and conflicting edits.

SMTP authentication and read-only Paystack/Brevo connectivity are checked separately. These checks do not prove inbox delivery or complete a financial transaction. Runtime dependencies were updated to resolve reported advisories; the remaining `braces` advisory is in the development-only ESLint dependency chain with no compatible upstream fix reported.

## Appearance

Public pages, authentication and both workspaces share Light / Dark / System appearance settings, following the Unsaidbox pattern. Light is the default; System follows device changes. The preference is stored locally under `smahope:appearance:v1`, synchronises between tabs, and is applied by a static script before hydration. Storage failure leaves the control usable for the current visit.

`src/lib/theme.ts` owns preference validation and initialisation, `src/components/theme-provider.tsx` owns browser synchronisation and the accessible picker, and `src/app/theme.css` owns semantic dark tokens. Component styles preserve their light values with `light-dark()` pairs. Use the shared surface, text, line, link and status tokens when adding UI. The shared `BrandLogo` selects the approved transparent dark variant without recolouring photographs. Print uses the light palette. Preference boot behaviour and core text contrast are covered by `tests/theme.test.mjs`.
