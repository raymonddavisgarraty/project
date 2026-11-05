# Stage 44.2 — Responsive catalogues, shared search and offline provider-profile design

**Status:** draft UX iteration on top of Stage 44.1. No new published routes, no invented provider profiles, no author/claim approval, and no change to the Stage 43 production release gate.

## 1. Games and Casinos catalogue alignment

The existing Games search layout was fixed in Stage 44.1. In Casinos, the **2 casinos found** counter still inherited a bottom-aligned action row. Stage 44.2 corrects Casinos with:
- A top-aligned panel; one column on narrow phones, two columns at 620–899px, four columns at 900px+.
- The Reset button and result count use the same 52px action height, centered vertically and allowed to wrap on very narrow windows.
- Each field has min-width:0 and its select/input is box-sizing:border-box for narrow screens.
- Disabled Type and Withdrawal filters have visible explanations rather than looking like working controls.
- Casino cards use readable 1-column layout on phones and 2 columns from 620px, with equal height, robust long titles and visible keyboard focus.
- Games cards use 1 column below 380px, 2 from 380px, 3 from 760px and 4 from 1100px; prevents tiny 5-column game cards near the 900px breakpoint.

## 2. Shared progressive-enhancement controller (vanilla JS)

- /src/assets/js/pages/catalog-search442.js is loaded before each existing games-search.js or casinos-search.js wrapper, preserving separate page entrypoints.
- Search is title-based; game search may additionally match individually verified provider names. No hidden unverified provider/volatility fields are used.
- Reset, zero-results messaging, live count and accessible search label work in both catalogues.
- Query-string fields are selected only when an existing, enabled option permits them. Disabled/unverified facets cannot filter the results, even when someone pastes legacy query parameters.
- Only Title A–Z sort is active; legacy sort=rating-desc, sort=rtp-desc and sort=new-desc are not accepted as a way to expose unsupported ranking signals.
- Esc clears a nonempty search input; reset returns to the full catalogue and removes active search parameters.
- Random game selection chooses from currently visible cards and respects prefers-reduced-motion.
- Cards and initial counts are server-rendered. Without JS, the user can still navigate by ordinary HTML anchors and see the full catalogue.

## 3. Casino filter review

- /src/lib/casino-catalog442.mjs derives **Type** options from the Stage 43.3 field-level reviewed projection, with a fixed allowlist of normalized type codes.
- No casino Type options are currently available because all legacy claims remain unverified. Withdrawal and rating options are deliberately disabled.
- A new verified Type value may unlock that option, but **does not approve the whole casino page, market eligibility or any commercial offer**.
- Provisional casino-card hidden attributes remain empty except for individually verified Type; unapproved ratings, bonuses, withdrawal speeds and provider claims stay hidden.

## 4. Provider profile UI preparation — OFFLINE ONLY

- /prototypes/provider-profile-stage442.html is a standalone, responsive noindex design contract with overview, games, evidence and editorial-release areas. It contains no fabricated provider history, awards, ratings, offers or claims. It is a local design file, not an Eleventy template.
- /src/lib/provider-blueprint442.mjs builds a source-safe **design inventory**, never a route. Provider registry identity is not treated as verified editorial content.
- Game links in the future design inventory are included only when a matching generated EN route exists and the game providerId claim has Stage 43 claim-level verification. Even then, the provider blueprint does not become publishable.
- Release still requires original localized provider editorial, primary sources, human review, jurisdiction/market approval and explicit route creation. No /en/providers/ or /de/, /es/ content is generated in this stage.

## PowerShell commands

In the project directory, after checking for local changes:

    git status --short
    git fetch origin
    git switch stage-44-2-responsive-catalog-ux-provider-blueprint

Verification:

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
    npm run audit:editorial

Other retained quality checks:

    npm run check:games
    npm run check:provenance
    npm run check:locales
    node scripts/test-stage42.mjs
    node scripts/test-stage412.mjs
    node scripts/importer/test-stage38.mjs
    node scripts/importer/test-stage39.mjs
    node scripts/importer/test-stage391.mjs
    node scripts/importer/test-stage40.mjs

Run npm run dev and inspect these local URLs:
- http://localhost:8080/en/casinos/ — Reset and 2 casinos found should be vertically aligned; Type/Withdrawal visibly disabled.
- http://localhost:8080/en/games/ — search/result count, responsive grid and random game.
- http://localhost:8080/en/games/sweet-bonanza/ — Stage 44.1 cross-link and pending-review notice remain.
- http://localhost:8080/en/ — root redirect continues working.

Visually inspect widths 320, 375, 620, 768, 900, 1024 and 1280 px and test keyboard focus and no-JS fallback. The provider prototype can be opened directly from the repo as a local HTML file.

## Release invariants

- Node/Eleventy and post-build tests must pass before merge; do not claim the PR is production-ready based on source-only checks.
- The initial Stage 43 editorial audit still has **55 unverified claims and 66 blockers** as of the last local verification. Those numbers are not changed by this UX patch.
- Strict npm run check:editorial and an explicit production build are **expected to fail** until genuine evidence and human review resolve the blockers. Do not set approval flags to bypass the gate.
- There is no real provider directory, no affiliated bonus or rating endorsement and no new indexable taxonomy page.
