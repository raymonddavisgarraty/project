# Stage 43.2 — Source Reconciliation and Safe Display

**Status:** draft, stacked on Stage 43.1. Research and display protection only. No automatic fact changes, editorial approvals or publication.

## Findings for original Sweet Bonanza

The Pragmatic Play announcement dated 25 June 2019 describes the original Sweet Bonanza game as a 6-by-5 tumbling slot with high volatility, free spins and possible winnings up to **21,175x** the original bet.

- First-party release: https://www.pragmaticplay.com/en/news/pragmatic-play-launches-sweet-bonanza/
- First-party original game page: https://www.pragmaticplay.com/en/games/sweet-bonanza-slot/

The repository currently has maxWinMultiplier **21100** and RTP **96.48** for the original game. The inspected first-party pages do not establish the exact RTP or operator-specific configuration. The difference between 21100 and 21175 is an **unresolved candidate discrepancy**, not permission to edit the facts. Newer Sweet Bonanza sequels are separate games.

A research-only correction proposal resides at research/correction-proposals/sweet-bonanza-original-432.json. It is explicitly unapproved and has no signed source snapshot or independent human review.

## Changes

- Added a conservative, **global fail-closed** presentation policy derived from the complete Stage 43 audit.
- Game and casino detail templates now show a neutral verification notice and canonical catalogue link until the whole release has been editorially approved. The original rich layouts remain in a guarded branch for future approved data.
- Game/casino/home cards, rail, header, footer and trust copy no longer expose or imply unverified ratings, provider facts, bonuses or withdrawal statistics.
- Removed unreviewed catalogue sort/filter options rather than allowing unverified hidden data attributes to drive them.
- Neutral page titles/descriptions while editorial review is incomplete.
- Added pure policy tests, template-guard tests and a post-build HTML scanner that detects leaked legacy numeric values and casino claims.
- Preserved all original source facts, editorial modules, provenance records, Stage 38 manual publication and Stage 43 production gate. Nothing is auto-approved.

## Run (PowerShell; development environment)

    npm run test:stage432
    npm run test:stage431
    npm run test:stage43
    npm run check:games
    npm run check:provenance
    npm run check:locales
    npm run build
    npm run check:seo
    npm run check:display
    npm run audit:editorial

Regression checks:

    node scripts/test-stage412.mjs
    node scripts/test-stage42.mjs
    node scripts/importer/test-stage38.mjs
    node scripts/importer/test-stage39.mjs
    node scripts/importer/test-stage391.mjs
    node scripts/importer/test-stage40.mjs

**Intended failing check:** npm run check:editorial. It must remain red for unreviewed legacy content. The production-mode Eleventy build must also refuse release. Never bypass these checks.

## Acceptance / remaining constraints

1. Existing EN game/casino pages and catalogues still build and pass SEO link/canonical auditing.
2. Unapproved numeric game facts, ratings, casino licence/bonus/payment/withdrawal claims do not appear in generated HTML or hidden card metadata.
3. Future approved pages can use existing rich templates only after the whole Stage 43 audit is green.
4. Source leads and the 21175x candidate are clearly unapproved; no values are changed.
5. The current all-or-nothing presentation gate is intentionally conservative. A future field-level visibility policy requires strong per-document approval bindings and separately approved editorial content.
6. Development pages remain in the dev sitemap from Stage 42. Deployment is blocked; this is not approval to publish thin placeholder pages.
7. Source evidence for release requires original rules, version/market notes and explicit human editorial sign-off.

Full Node/Eleventy build and release checks are required before merging this PR.
