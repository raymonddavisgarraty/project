# Stage 42.2 — Separate generated routes from indexable releases

**State:** draft, fail-closed SEO fix stacked on the three-product architecture PR #13. No data, provenance, approved content, commercial permissions or public export feed is created by this stage.

## Defect addressed

Previously, the Stage 42 sitemap used the global publishedRoutes array. That array lists HTML pages rendered in development, **not human-approved releases**. The last owner audit returned zero verified claims, 55 unverified and 66 blockers, yet the development sitemap listed 7 URLs and detail templates inherited the default robots meta "index, follow". Robots.txt was Disallow: / in development and Stage 43 blocked production, but treating that as sufficient would create a future indexing leak when deploying.

The release policy now separates:
1. **Generated routes:** site navigation and editorial preview pages, including all 7 current EN pages.
2. **Explicitly approved indexable routes:** only pages passing independently reviewed content revisions, global information-publication/market rights and Stage 43 audit. Currently **zero**.

## Implementation

- src/lib/indexability42.mjs: pure, read-only fail-closed route allowlist. Independently requires global Stage 43 audit approval, explicit public-information rights, exact approved release decision, a real human reviewer/date, matching approved source revision hash and entity-level readiness. Does not import Studio candidate status or affiliate offers.
- src/_data/indexability42.js: project-owned Eleventy data projection. No actual public release decisions or independently measured approved revision hashes currently exist; approvals=[], revisionHashes={}, informationApproved=false. This MUST NOT be bypassed by setting development routes to "approved".
- src/_includes/layouts/base.njk: default robots to **noindex, follow**, except for a path explicitly allowed by indexability42 and not independently marked noindex.
- src/sitemap.njk: only indexability42.routes (currently empty). Homepage, catalogues and pending detail pages still build and work locally.
- scripts/seo42.mjs and scripts/check-stage42.mjs: continue to test **all generated** HTML links, page canonical, 404, root redirect and orphan pages, but compare sitemap only against the smaller approved set and require noindex on every excluded generated page.
- .eleventy.js: production now has a second independent fail-closed check. Stage 43 production audit must pass, AND there must be at least one independently approved indexable route. If no release manifest exists, production build is rejected even after a hypothetical all-green Stage 43 audit.
- scripts/test-stage422.mjs: synthetic approved-release fixture, 21 explicit negative approval scenarios, temp HTML fixture for empty sitemap, unapproved noindex violation, sitemap leak, production empty gate, approved synthetic route and noindex-vs-sitemap contradiction.

No new Eleventy pages, public data feeds, bots or Studio app are generated. All current routes remain navigable in local development.

## Engineering decisions and limitations

The synthetic positive fixture is NOT an approval of any real game or market. The pure function intentionally accepts independent future authorizations and a precomputed revision-hash map, but Stage 42.2 DOES NOT IMPLEMENT an adapter that can create those trusted inputs. The real project Eleventy data supplies none, so the public allowlist remains empty.

This is safer than auto-approving a homepage or index whenever all individual game claims are verified; a neutral-looking homepage can still contain unreviewed rankings/promises. The real Stage 44 content pilot and revisions must precede any live indexation.

SEO robots: sitemap.xml with an empty urlset is a development/internal QA artifact only. It must not be deployed as a live catalogue. Development robots.txt still disallows crawlers; per-page noindex is an additional, independently testable signal, not a substitute for staging authentication or prevention of external access.

The future published JSON catalogue (separate from sitemap.xml) MUST also use an approved public projection, not the generated route manifest. Its proposal contract lives at docs/integration/published-catalogue-contract-v1.draft.md; it is not implemented here.

## PowerShell

From repository root, after stopping npm run dev:

    git status --short
    git fetch origin
    git switch stage-42-2-publication-aware-indexing-gate

    npm run test:stage422
    npm run test:stage42
    npm run test:stage433
    npm run test:stage432
    npm run test:stage44
    npm run test:stage442
    npm run test:stage443
    npm run test:integration-contract
    npm run check:v1-boundaries

    npm run build
    npm run check:seo
    npm run check:display
    npm run check:navigation
    npm run check:catalogue
    npm run check:review-pages
    npm run audit:editorial

Expected in DEVELOPMENT:
- successful build and all tests;
- check:seo ok=true, 9 HTML pages, **0 sitemapEntries**, 4 legacy audit warnings;
- generated _site/sitemap.xml has no <loc> elements;
- _site/en/index.html, both catalogue pages and all four detail pages contain meta robots="noindex, follow";
- _site/robots.txt still says Disallow: /;
- Stage 43 audit still says productionReleaseAllowed:false and 66 blockers.

Production build is intentionally expected to fail. Do not invent a SITE_URL, edit approvals or disable any Stage 38–43 safeguards merely to obtain a successful production build.

## Exit / next work

After Stage 42.2 acceptance, proceed with explicit stable IDs/URL ownership and Stage 43 editorial-source review. The future release adapter must establish revision-bound authorizations from actual human-approved evidence and legal/publication scopes. Do not publish a source-unverified content pilot, infer market access from EN locale or create a Telegram Bot in this branch.

## SEO audit API fail-closed behavior

The auditSeo42() standalone utility now defaults indexableRoutes to **[]**, never to all generated routes. Existing Stage 42 synthetic positive fixtures explicitly pass indexableRoutes: routes, but the actual scripts/check-stage42.mjs injects only indexability42.routes. This makes accidental invocation without an independently approved allowlist fail closed. Both Stage 42 and Stage 42.2 synthetic tests exercise the distinction.
