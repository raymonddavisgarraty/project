# Stage 43.3 — Root language entrypoint and field-level claim visibility

**Status:** draft stacked on Stage 43.2. This is a development UX and evidence-presentation change, not proof that any game/casino facts have been verified, or a production-release approval.

## Why this stage

- The existing Eleventy site has an actual homepage at /en/ but nothing generated at /. Browsers opening http://localhost:8080/ get a missing page despite a healthy dev server.
- The earlier Stage 43.2 display gate conservatively hides all game/casino characteristics pending the full editorial audit. A partial-approval presentation path is useful, provided no unchecked values, ratings or commercial offers can leak.
- Both current games and both casinos remain unverified in the actual Stage 43 report (55 unchecked claims, 66 blockers on 29 October 2026). Nothing in this patch changes those statuses.

## Root route

- src/index.njk generates /index.html with a **zero-second HTML meta refresh** to /en/, a fallback clickable link, a canonical URL pointing to /en/, and noindex.
- The redirect is **client-side** and the dev server still returns HTTP **200** when serving the entrypoint. It is **not an HTTP 302**. On a real hosting platform, configure a server-level 302 (or the appropriate intentional routing) after deciding the i18n entrypoint policy.
- Do not put / in sitemap.xml. Only /en/ is the present canonical homepage. /de/ and /es/ remain planned and unpublished; the root must not invent translated routes.
- scripts/seo42.mjs validates the root entrypoint and rejects wrong targets, missing noindex/canonical or missing fallback link. scripts/test-stage42.mjs includes matching fixtures and a negative redirect scenario.
- Technical SEO must keep 7 sitemap content URLs; the build gains a ninth HTML file (7 content pages + 404.html + root entrypoint).

## Claim-level fact presentation

- src/lib/editorial-fields433.mjs reads the existing **Stage 43 audit results**, not hand-entered flags or Studio recommendations. A field is displayable only when its claim has status verified, no blocker codes, and a safe value formatter.
- src/lib/editorial-audit433.js is a shared cached import for the existing Stage 43.2 full-page resolver and the new claim-level resolver.
- The full, unreviewed editorial prose remains behind Stage 43.2's **whole-release fail-closed gate**. The fallback detail page now optionally displays an isolated source-reviewed facts table if individual claims have passed review.
- Game allowlist: providerName, releaseYear, reels, paylineType, volatility, rtp, maxWinMultiplier, paylines. Casino allowlist: licence, game count, and type. Every result is explicitly labeled as an **individually reviewed claim, not a fully approved page**.
- Editorial ratings, bonus offers, marketing claims, withdrawals, hit frequency and unsupported prose are NOT exposed by this partial-fact component. Operators' jurisdictional eligibility is not inferred from an informational licence claim.
- Catalogue cards may display the same approved individual values as text; unapproved fields remain absent from hidden sort/filter data attributes.
- Existing Stage 43.2 post-build checker is extended to allow the exact individually approved values while still blocking unapproved numerical facts and bonus/ratings leaks. The Stage 43 global production-release gate is unchanged.

### Important integrity limitation

Stage 43 validates claim/value equality, primary-source entry structure and an explicit reviewer marker, but does **not** independently authenticate sources, approve the entire copy, or cryptographically bind all editorial decisions to a full content snapshot. Fields do not become verified by adding metadata casually. Real reviewers must examine the authoritative source and the precise edition/market. This change never turns an unverified field into a verified one.

This claim-level mechanism does NOT decide whether an otherwise unfinished detail page should be indexed: Stage 43 production builds remain blocked, and page-level release eligibility must be a separate approved decision. Do not deploy thin placeholders or bypass the gate.

## Commands for local Windows PowerShell

First verify no unstaged modifications would be overwritten, and fetch/switch to the new branch. In normal **development** environment:

    npm run test:stage433
    npm run test:stage432
    npm run test:stage431
    npm run test:stage43
    node scripts/test-stage42.mjs
    npm run build
    npm run check:seo
    npm run check:display
    npm run audit:editorial

Then run:

    npm run dev

In a separate browser tab visit:
- http://localhost:8080/ — should immediately navigate to /en/ in the browser.
- http://localhost:8080/en/ — current homepage.
- http://localhost:8080/en/games/sweet-bonanza/ — shows the verification notice, not the old unverified RTP/rating.
- http://localhost:8080/sitemap.xml — contains 7 real EN content routes, not /.

For all previous checks, also run:
    
    node scripts/test-stage412.mjs
    node scripts/importer/test-stage38.mjs
    node scripts/importer/test-stage39.mjs
    node scripts/importer/test-stage391.mjs
    node scripts/importer/test-stage40.mjs
    npm run check:locales
    npm run check:games
    npm run check:provenance

Expected intended failure: npm run check:editorial (unapproved legacy claims). A production Eleventy build still refuses release.

## Acceptance

1. Root browser URL opens /en/ while / remains absent from sitemap.
2. SEO audit passes with 9 generated HTML pages and 7 sitemap content URLs.
3. Field-level unit fixtures show only individually approved claims; conflicting, missing or invalid approvals cannot leak.
4. Current 55/66 audit baseline stays unchanged, game/casino numerical ratings/bonuses remain hidden and production stays blocked.
5. No edits to original game/casino facts, provenance JSON, Stage 38 publisher, or commercial permissions.
6. The behaviour is implemented using Eleventy, Nunjucks and vanilla JS only.
