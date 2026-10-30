# Stage 41.2 — v1.0 Acceptance Matrix

Status as of 2026-10-30: Stage 41.2 implementation exists in draft PR #1 and is stacked under later draft PRs. Its success does not mean SEO Platform v1.0 is production-ready.

## Code present

- src/lib/site-config.js: environment-driven SITE_URL/TELEGRAM_URL validation; production HTTPS origin required.
- src/lib/commercial-policy.js and src/_data/commercial.js: centralized deny-by-default offers, independent source of permissions for hero/sidebar/cards.
- src/_data/publication.js: global commercial/demo flags currently false.
- src/_data/markets.js: current GB/DE/ES market statuses are pending-legal-review.
- src/_data/partners.js: no approved live offer URLs.
- scripts/test-stage412.mjs and scripts/check-production.mjs: negative and output checks.

## Technical acceptance (not release permission)

Run all commands in Windows PowerShell from repository root:

    node scripts/test-stage412.mjs
    npm run check:v1-boundaries
    npm run check:locales
    npm run check:games
    npm run check:provenance
    node scripts/importer/test-stage38.mjs
    node scripts/importer/test-stage39.mjs
    node scripts/importer/test-stage391.mjs
    node scripts/importer/test-stage40.mjs
    npm run build
    npm run check:seo
    npm run check:display

Production smoke test requires a genuine domain AND final editorial permission. Never invent domain, switch existing global approval flags or mark source claims verified just to pass checks. Unverified legacy content must still block production.

Source review, legal decisions, canonical/indexation eligibility, content pilot and analytics are separate gates after Stage 41.2. Stage 38 publishing checksums, approvals and exclusive-create behavior must remain unchanged.

## Explicit checkpoint limits

Do not create Content Intelligence Studio code, Studio runtime API, direct-write hook, approved public provider pages or fake import schema. Contract definition is scheduled after Stage 42 acceptance; one nonpublishing package validation after Stage 43–44; final handoff after Stage 45. Do not merge divergent stacked PRs without regression review and conflict reconciliation.
