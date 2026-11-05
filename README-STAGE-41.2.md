# Stage 41.2 — Production Configuration & Commercial Safety

Baseline: GitHub raymonddavisgarraty/project main at 8c7252fbce1659b16bfbd31d50e2ffcb62cd3432.

## Changes
- SITE_URL is validated at build time; development falls back to localhost:8080. Production requires a real HTTPS origin.
- Optional TELEGRAM_URL: only https://t.me/<channel> is accepted; missing or invalid links are hidden. Invalid explicit values fail production checks.
- Separate approval fields for partner, content, markets, and globally accessible audiences. All are required; unknown or pending values deny.
- A global static page cannot enforce visitors' jurisdiction; therefore globalCommercialApproved and globalDemoApproved are deliberately false.
- Central commercial.forGame and commercial.forCasino helpers replace independent lookups in the sidebar, game hero, casino hero and casino card.
- Legacy partner IDs remain but example.com URLs are removed.
- Home page, header/footer and author card no longer link to unpublished routes. Existing reviews are left intact; casino claims and legacy factual accuracy are deferred to Stages 41.4/43.
- Home WebSite JSON-LD uses the resolved canonical URL.
- scripts/check-production.mjs checks built HTML for placeholder URLs, wrong canonical, unapproved sponsored links, and broken /en/ links.

## PowerShell checks
Run from the repository root:

    node scripts/test-stage412.mjs
    npm run check:locales
    npm run check:games
    npm run check:provenance
    node scripts/importer/test-stage38.mjs
    node scripts/importer/test-stage39.mjs
    node scripts/importer/test-stage391.mjs
    node scripts/importer/test-stage40.mjs
    npm run build

Production-like build requires your REAL HTTPS domain:

    $env:NODE_ENV = 'production'
    $env:SITE_URL = 'https://YOUR-ACTUAL-DOMAIN.TLD'
    npm run build
    npm run check:production

Do not deploy if check:production fails or when the domain is not configured. Local smoke tests and regression commands must be run before merge.

## Scope
No automatic publishing, Stage 34–40 gate changes, unverified content approval, DE/ES activation, Studio integration or mass UX changes.
Rollback: close the PR branch without merging. The base branch is unchanged.
