# Support catalogue

Public: `/support-sma-care`. Admin: `/admin/support-items`.

Includes education, assessment/testing, equipment, nutrition, feeding procedures and family support. Supplier photos are copied from Downloads, excluding the withdrawn wheelchair. Hoist price includes the sling. Unknown costs remain null and images are optional.

## Release

Owner deployment approval is required. Apply the additive `database/011-support-catalog.sql` migration to the SMA Hope database through the existing controlled migration workflow before release. It creates current-item and revision-history tables only. No production migration or deployment was performed during implementation.

An administrator can add/edit items, choose a category, change prices and cost basis/date, set an optional existing support image or Cloudinary URL, and set draft, active or visible-but-paused status. Operations users can read but not edit. Draft removes a listing; paused keeps its explanation visible but rejects checkout. Saved revisions and administrator audit events are retained atomically. Existing slugs remain fixed.

## Donation semantics

Standard online gifts remain unrestricted foundation donations. Selecting an item records an explicit support preference, not a purchase, reserved item or restricted fund. Restricted gifts require a separate written agreement before payment. No stock, beneficiary count or fundraising-progress claim is generated.

Checkout validates the selected item on the server and snapshots its title, category, cost basis, amount, date and revision in Paystack metadata. Client-supplied preference details are ignored. Verified payments preserve that snapshot in donation/subscription records. The title appears in confirmation emails and both account/admin records. Monthly gifts use the existing configured plans and may be smaller than the listed cost.

## Verification

`npm test`, `npm run lint`, `npm run build`.

With the existing isolated MySQL fixture at 127.0.0.1:33317/smahope_test and `/private/tmp/sma-lms-test.env`, run `node scripts/testing/support-preview.mjs`, then `node tests/integration/support-catalog.mjs`. Preview uses port 3043, a separate source copy and explicit synthetic payment plans. Paystack initialization and reCAPTCHA responses are mocked only in that test process; other Paystack calls are blocked. SMTP passwords are blank. The integration test cleans up only its own synthetic identities, item revisions, donation and audit rows.

Nine groups cover permissions, CSRF, validation, draft/public visibility, optimistic concurrency, partial/monthly checkout snapshots, signed webhook persistence, donor/admin reporting and paused-option rejection. No real payment or email is sent.

## Equipment supplier

Owner supplied the name **EveryMedical Nigeria Enterprises** on 26 November 2026 for the equipment quotations and images. It is recorded on the equipment items as an internal supplier field. Public page data and Paystack preferences explicitly omit this field. No supplier identity, warranty or product-specification verification is implied by recording the name.

## Education budget basis

Education prices were corrected on 26 November 2026: outreach US$10,000 for a target of 10,000 enrolments at the owner’s planning allowance of US$1 per enrolment; video delivery US$300 for 15 minutes × two full viewings × 10,000 learners at US$1 per 1,000 delivered minutes. These are planning estimates, not actual spend or guaranteed outcomes. Video storage and other platform costs are separate; shared infrastructure is contributed. Catalogue supports an optional USD cost with no implicit FX conversion. Checkout remains in NGN, with a clearly explained donor-chosen amount.

## Production preparation — 26 November 2026

Owner authorised deployment. The production database was backed up and the two additive catalogue tables installed and structurally verified before the Git release. All 117 unit tests and nine isolated integration groups passed. The top navigation replaces About us with Support; About us remains in the footer.
