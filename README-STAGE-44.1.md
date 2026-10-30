# Stage 44.1 — Safe game graph and contextual navigation pilot

**Status:** draft pilot stacked on Stage 43.3 PR #7. No new provider/article pages, no content approvals, no production release.

## Verified baseline

The EN build has 7 canonical content URLs (home, game index, two game pages, casino index and two casino pages). Sweet Bonanza and The Big Dog House have reciprocal hand-curated relatedGames references. Both providerId claims are still unverified, even though the registry recognizes Pragmatic Play. Stage 43 production is still blocked: the baseline audit shows 55 unverified claims and 66 blockers.

## Delivered

- src/lib/game-navigation44.mjs: deterministic Game→Game resolver. A target must match an existing generated Stage 42 manifest route, correct EN canonical path, stable ID and slug. Duplicates, self-links, ambiguous legacy slugs and unknown/draft targets are skipped. Maximum six destinations per section.
- Manual relatedGames links are labelled **Other game pages**, not recommendations or similarity rankings. They are navigation only, even while editorial source checks are pending.
- Same-provider links are a separate section, emitted ONLY when both games' providerId claims have been individually verified by Stage 43 with no blocker codes and their actual provider IDs match. No provider profile route is invented.
- src/_data/gameNavigation44.js: Eleventy global source projection from games, publishedRoutes, cached Stage 43 audit and full-review policy.
- src/_includes/components/game-context/game-context.njk: semantic, server-rendered anchor lists on both full and pending game detail pages; omitted when empty. Responsive CSS component with visible keyboard focus and no JS dependency.
- src/lib/game-catalog44.mjs + src/_data/gameCatalog44.js: provider and volatility filter options only from Stage 43.3 source-reviewed field values.
- Games catalogue disables empty unverified facets with explanation. Search by title remains active; A–Z sort remains available.
- Provisional cards keep rating/RTP data attributes empty; reviewed provider/volatility values may be used as facets. CSS respects native hidden and the random-game animation respects reduced motion.
- Added unit/integration fixtures and a post-build navigation scanner.
- No modifications to original facts, claims, ratings, publication scripts, locale routing or commercial offers.

## Local Windows PowerShell

Run from the project directory, after checking git status and switching to this new branch:

    npm run test:stage44
    npm run test:stage433
    npm run test:stage432
    npm run test:stage431
    npm run test:stage43
    node scripts/test-stage42.mjs
    npm run build
    npm run check:seo
    npm run check:display
    npm run check:navigation
    npm run audit:editorial
    npm run check:games
    npm run check:provenance
    npm run check:locales
    node scripts/test-stage412.mjs
    node scripts/importer/test-stage38.mjs
    node scripts/importer/test-stage39.mjs
    node scripts/importer/test-stage391.mjs
    node scripts/importer/test-stage40.mjs

Expected negative: npm run check:editorial and an explicit production build still fail while unverified claims remain. Do NOT force pass by changing approval metadata.

## Browser review

Run npm run dev and open http://localhost:8080/en/games/sweet-bonanza/.
The page should show a neutral link to The Big Dog House and an editorial-pending label. The other game page should link back. No same-provider section yet, because providerId proof is missing. On /en/games/, title search works and unavailable provider/volatility filters show disabled-state explanations.

Test at 320, 375, 768 and 1280px, with Tab keyboard navigation and JavaScript disabled. Both game cross-links should exist as native HTML anchors in the built pages.

## Release/next steps

The manifest shows actual dev pages, not permission for public deployment or indexing. Stage 43 stays fail-closed. No /en/providers/, /de/, /es/, /en/articles/ or casino-to-game association routes are generated.

After code review and local regression: Stage 44.2 can refine reusable UX and prepare provider/guide models, but must still separate entity links from verified claims and market approval.
