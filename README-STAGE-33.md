# Stage 33 — Quality Gate + Incremental State Protection

## Installation
Extract this ZIP into the root of `seo-review-platform` preserving directory structure. It replaces `scripts/importer/discovery31.mjs`, `pipeline32.mjs`, `normalize-lcb.mjs` and adds `quality33.mjs`, `test-stage33.mjs`. Make a Git commit or backup before extraction.

## Tests
```powershell
node scripts/importer/test-stage33.mjs
node scripts/importer/test-stage31.mjs
node scripts/importer/test-stage32.mjs
node scripts/importer/test-live321.mjs
node scripts/importer/test-stage30.mjs
npm run check:games
npm run check:provenance
npm run build
```

## Changes
- Discovery retains existing `fetchedAt`, `candidateFile`, `signature` and `checkedAt` for unchanged URLs. Changed sitemap `lastmod` moves previously fetched URL back to `changed`.
- New candidates include `importSignature` (hash of stable extracted facts/raw/source URL) and `quality` (`needs-review` or `ready-for-editorial-review`, always `autoPublish:false`).
- Expanded conservative theme dictionary. Unknown providers/themes remain unresolved, never guessed.
- When source changes, candidate revisions are written to a separate `--rev-<hash>.json` file, never overwriting editorial files. If the same signature is already recorded, re-fetch is skipped.

## Important limits
- Existing fetched records created before Stage 33 have no `signature`. Their first *changed* re-fetch will create a revision; previous files remain intact.
- The hash detects changes in extracted facts, not arbitrary HTML changes. Sitemap `lastmod` is the current trigger for re-fetch; HTTP conditional requests and scheduled rechecks are future work.
- `ready-for-editorial-review` does NOT mean verified, approved or publishable. Data from third parties still requires verification and source-use authorization.
- Stage 33 tests are offline. Do not run a large network crawl until permissions/terms and request limits are confirmed.
