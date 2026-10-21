# Stage 31 — Offline Sitemap Discovery + Incremental URL Manifest

Additive patch: Node.js 22 built-ins only. Does not overwrite Eleventy templates, package.json, published records or previous importer scripts.

## Install
Extract ZIP into the repository root.

## Test
```powershell
node scripts/importer/test-stage31.mjs
node scripts/importer/discover-urls.mjs --xml tests/fixtures/stage31/index.xml --xml tests/fixtures/stage31/slots-sitemap.xml
```
Expected: tests pass; discovery finds 2 distinct game URLs, 1 sitemap index; dry-run creates no state file.

## Persist discovery state
```powershell
node scripts/importer/discover-urls.mjs --xml tests/fixtures/stage31/slots-sitemap.xml --write
```
Creates `data/discovery/lcb-urls.json` with source URLs and new/changed state. Running the command again should report `added: 0`.

## Real sitemap files (offline)
Save source sitemap XML files locally only when access is permitted. Pass each file with `--xml`. If a sitemap index is passed, the CLI reports nested sitemap URLs but DOES NOT fetch them; save allowed child XML files and pass those explicitly.

## Important limitations
- No network access, no automatic fetching, no crawling, no publication.
- Filtering is deliberately strict: only `https://latestcasinobonuses.bet/slots/<slug>/` URLs. It may miss legitimate games with other URL patterns; validate against actual sitemap structure.
- `lastmod` is an unverified hint from source, not evidence of changed game facts. If `lastmod` is absent, changes are not detected; future content hash checks will be needed.
- Manifest `status` is a discovery state, NOT a review or publication status. No link to Stage 30 HTML import is made yet.
- XML extraction is intentionally lightweight; only sitemap `<loc>` and `<lastmod>` are supported, not compressed `.gz` or HTML catalogs. Do not use on untrusted giant files.
- `--write` persists research state under `data/discovery`; add it to `.gitignore` if you do not want operational manifests tracked.
- Before live access: verify robots.txt, terms/permissions, and applicable rights. Do not bypass blocking or rate limits.
