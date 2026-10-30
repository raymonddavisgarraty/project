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

## Local acceptance evidence (2026-10-30; user PowerShell results)

Checkout: checkpoint-v1-release-target-stage412, draft PR #11. The following were actually run by the project owner and reported as successful:

| Command / group | Observed result |
|---|---|
| npm run check:v1-boundaries | status passed, six checks, zero errors; productionReleaseApproved false |
| node scripts/test-stage412.mjs | Stage 41.2 tests OK |
| npm run check:locales | EN active, DE/ES planned, market approvals pending |
| npm run check:games | Two legacy-unverified global game records structurally validated |
| npm run check:provenance | Both game provenance records structurally validated; facts unchanged |
| Stage 38, 39, 39.1 and 40 importer tests | All reported OK; explicit publishing, approvals, collision and read-only safeguards tested |
| npm run build | Eleventy v3.1.6 completed successfully; 11 output files written |
| npm run check:seo | ok true; 9 HTML pages, 7 sitemap entries, zero errors; four editorial warnings |
| npm run check:display | ok true; 7 checked pages |
| npm run check:navigation | ok true; 2 games and 2 casinos checked |
| npm run check:catalogue | ok true; 2 catalogues and 6 planned provider identities |
| npm run check:review-pages | ok true; 4 provisional review pages checked |
| npm run audit:editorial | productionReleaseAllowed false; 55 unverified claims, zero verified, 66 blockers, zero release-ready |

**Decision:** Stage 41.2 configuration/commercial-safety mechanism is accepted at the LOCAL TECHNICAL level on that branch. This is not merge approval, domain deployment approval, market/legal clearance, Studio integration or public launch permission. The current Stage 43 editorial release blocker is functioning as intended. The new Stage 42 offline candidate-contract prototype is separately tested and has not been run in this user's checkout yet.

Local untracked files were explicitly observed: data/editorial/, stage-41-2-baseline.zip and a legacy stages 34–40 file. No deletion or mutation was required.

## Next action

Review the Stage 42 contract and the documented Stage 34 source-host incompatibility; validate the package read-only, then complete a human-reviewed content pilot and Stage 45 before release/handoff. Keep the stacked PR chain intact until actual dependency-by-dependency acceptance.

