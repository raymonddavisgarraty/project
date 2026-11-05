# Stage 44.3 — Responsive review preview UX

**Status:** draft feature stacked on Stage 44.2 PR #9. The change improves the presentation of pending game/casino reviews. It does NOT verify their content, approve editorial ratings, create new entity routes or permit a production release.

## What changed

The Stage 43.2 release gate intentionally hides complete legacy review text, numerical ratings, bonuses and unreviewed characteristics. Previously, the pending-review fallback was a nearly empty page.

Stage 44.3 creates a richer safe fallback for both game and casino detail templates:

- Responsive hero showing the actual directory title and per-page breadcrumbs.
- Editorial verification status panel with aggregate source-review counts taken from the Stage 43 audit, never from arbitrary text.
- Individually source-reviewed fact section using the existing Stage 43.3 field-level visibility policy. When no facts have been verified, show an informative empty state, not fabricated values.
- Game-specific or casino-specific checklist showing the fields still requiring authoritative source evidence and human editorial review.
- A four-step editorial methodology explanation, native in-page links and accessible sidebar navigation.
- Responsive Nunjucks/CSS only: no framework and no JavaScript required.
- The existing Stage 44.1 game cross-links still render below the new preview. The full, pre-existing approved-review layouts are untouched.

All checklist text describes **verification work**, not facts about the listed game or casino. A checked count is not a quality rating or recommendation. The preview projection deliberately excludes fact values, source URLs, affiliate offers and raw editorial copy.

## Files

- src/lib/review-preview443.mjs: pure fail-closed projection of Stage 43 claim statuses into safe checklist metadata.
- src/_data/reviewPreview443.js: Eleventy global resolver from existing Stage 43 audit.
- src/_includes/components/review-preview/review-preview.njk: reusable mobile-first page component.
- src/assets/css/components/review-preview.css: dark/light-compatible styles, responsive two-column cards and focus.
- src/en/games/game.njk and src/en/casinos/casino.njk: replace only their unapproved fallback branch; original approved branch remains intact.
- scripts/test-stage443.mjs and scripts/check-stage443.mjs: source, safety, and built-HTML validation.
- docs/architecture-checkpoint/stage443-review-preview-contract.md: component and editorial contract.

## PowerShell

From the local project root:

    git status --short
    git fetch origin
    git switch stage-44-3-adaptive-review-preview-components

Run in development mode:

    npm run test:stage443
    npm run test:stage442
    npm run test:stage44
    npm run test:stage433
    npm run test:stage432
    npm run test:stage431
    npm run test:stage43
    npm run build
    npm run check:seo
    npm run check:display
    npm run check:navigation
    npm run check:catalogue
    npm run check:review-pages
    npm run audit:editorial

Prior regression tests:

    npm run check:games
    npm run check:provenance
    npm run check:locales
    node scripts/test-stage42.mjs
    node scripts/test-stage412.mjs
    node scripts/importer/test-stage38.mjs
    node scripts/importer/test-stage39.mjs
    node scripts/importer/test-stage391.mjs
    node scripts/importer/test-stage40.mjs

Existing strict editorial and production checks must STILL fail until source evidence and human review resolve the outstanding claims. Do not forge approval fields.

## Browser QA

Start npm run dev. Review these four URLs:

    http://localhost:8080/en/games/sweet-bonanza/
    http://localhost:8080/en/games/the-big-dog-house/
    http://localhost:8080/en/casinos/royalspin-casino/
    http://localhost:8080/en/casinos/luckynova-casino/

Confirm each has its own correct H1/breadcrumb, a review-status card, individually checked-facts area, source-checklist cards and working on-page navigation. There should be NO legacy RTP, max win, score, bonus, license or payment claims without approvals. Cross-links between both game pages remain intact.

Inspect mobile/tablet/desktop widths 320/375/768/960/1280px, 200% zoom, dark theme, keyboard focus and JS-disabled rendering.

## Scope boundary

This UX makes a development preview visually complete, but does NOT create a substantiated editorial review. Do NOT deploy provisional, mostly methodology-based pages as stand-alone SEO content. They remain in the development sitemap but Stage 43 blocks production. The next substantive milestone is actual first-party fact-checking, revision-bound approval and an explicit page publication decision.
