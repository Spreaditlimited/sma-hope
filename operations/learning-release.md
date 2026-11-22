# SMA Hope learning release

Prepared locally on 22 November 2026. Owner selected SMA Hope as the course host, replacing the earlier TochukwuNkwocha.com plan. Production release authorised by the owner on 22 November 2026. The additive learning migration was applied after an encrypted database backup; existing account, donation, order and subscription counts were unchanged. Production-only Cloudflare Stream signing secrets were configured without changing the existing account authentication secrets.

## Course and video assets

- Public landing: `/learn/understanding-sma`.
- Learner workspace: `/account/learn`; registration: `/account/register`.
- Administration: `/admin/learning` (existing separate administrator authentication).
- Five finished landscape videos, about 14 minutes total, uploaded to Cloudflare Stream with signed URLs required and English captions attached.
- Video metadata and transcripts: `src/lib/learning/assets.json`. This is server-side course data and contains no credentials.
- Course has one module, five lessons and three questions per lesson. At least two correct answers complete a lesson. All lessons are immediately available. There is no medical qualification or diagnostic claim.

## Release preparation

1. Apply `database/003-learning.sql` through the authorised infrastructure connection after running the existing encrypted backup. The runtime database identity intentionally has no schema privileges. The additive migration creates only learning tables and initially inserts the course as a draft. It does not change existing accounts, donations or orders.
2. Configure `CLOUDFLARE_STREAM_SIGNING_KEY_ID` and `CLOUDFLARE_STREAM_SIGNING_PRIVATE_KEY` in the approved deployment environment using the existing Stream signing key. Keep them secret; never use a `NEXT_PUBLIC_` variable. The local test configuration already contains these keys privately.
3. Inspect the intended Git diff, preserve unrelated work, run `npm test`, TypeScript, ESLint and `npm run build`.
4. Follow the site’s existing Git deployment workflow: commit reviewed application changes, push main and verify Vercel production uses that exact commit. Keep private book-production outputs and credentials out of Git.
5. Publish the free course as part of the authorised launch. Verify production registration, login, enrolment, Stream playback, quizzes and saved progress with a clearly identified temporary foundation test learner, then remove that test learner and its course records so grant reports contain real enrolments only.

Turning Free enrolment or Published off closes new enrolment; existing learner access remains. This initial LMS has no paid checkout. New courses can be added using the same structure in a future change.

## Verification

- Automated integration test: `tests/integration/learning.mjs`. It is hard restricted to `http://localhost:3021` and `127.0.0.1:33317/smahope_test`. Supply its private environment path through `SMAHOPE_TEST_ENV`. Never point it at production.
- Tested anonymous and unenrolled access denial; registration; CSRF rejection; idempotent enrolment; five lesson payloads; signed and unsigned video access; transcripts; resume storage; failing and passing quizzes; complete course state; learner/admin isolation; report scores; CSV; and the free toggle.
- Browser checked desktop lesson playback, transcript availability, quiz submission and saved completion. Mobile layout checked at 375px. Browser verification found and fixed the local Stream allowed-origin port, inherited radio-input widths, duplicate page headings and initial resume timestamp.
- No emails were sent, no payments were created and no live learner data was used in the integration tests.

## Reporting limits

The monthly report is an enrolment cohort report. Completion is a passed check in all five lessons. First/latest scores compare attempts at the same lesson checks, not a controlled pre-course/post-course study. Learner references omit names and emails; these pseudonymous identifiers should still be handled privately. Administrator access is required for JSON and CSV.
