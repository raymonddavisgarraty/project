# Stage 42 — Technical SEO foundation (draft PR)

Built on the Stage 41.2 branch. No new indexable game/casino/provider/article pages or automatic publishing.

## Delivered
- Runtime-independent build-time route allowlist drawn from existing published Eleventy data only. No imported candidates or Studio data.
- sitemap.xml with absolute canonical routes; excludes filter queries, 404, DE/ES and imported drafts.
- robots.txt: development disallows crawling; production explicitly allows it and advertises the sitemap. Robots.txt is not a privacy/security mechanism or a substitute for noindex.
- /404.html noindex. Configure the production host to return actual HTTP status 404 for missing URLs.
- SEO QA checks canonical, metadata, Open Graph URL, generated routes, sitemap and robots, internal HTML anchors and fragments, noindex conflicts, and orphan pages.
- **Updated by Stage 42.2:** A generated route is NOT an approved indexable page. See README-STAGE-42.2.md for the new fail-closed sitemap/noindex policy; Stage 43 source verification, separate release authorizations and verified revisions must all pass before indexing.

## Run (PowerShell)
    node scripts/test-stage42.mjs
    npm run build
    npm run check:seo
    node scripts/test-stage412.mjs
    node scripts/importer/test-stage38.mjs
    node scripts/importer/test-stage39.mjs
    node scripts/importer/test-stage391.mjs
    node scripts/importer/test-stage40.mjs

## Production mode (only with your real owned HTTPS domain)
    $env:NODE_ENV = 'production'
    $env:SITE_URL = 'https://YOUR-REAL-DOMAIN.TLD'
    npm run build
    npm run check:seo
    npm run check:production

Replace the demonstration domain above before running; do not deploy a localhost or placeholder canonical. Reset environment variables after testing.

## Acceptance
Existing seven EN pages still build; 404 is a utility page, not indexable content. Sitemap contains only independently approved indexable pages (currently none); generated preview pages remain available for QA. No internal href to nonexistent pages or JavaScript-only navigation for critical links. Stage 38–40 and 41.2 protections must remain unchanged.

## Deferred
Stage 43: evidence, editorial quality and legacy indexability.
Stage 44: verified provider links, related-game blocks, server-rendered pagination, curated landing pages.
Stage 45: HTTP-status smoke test, CWV and Search Console.
