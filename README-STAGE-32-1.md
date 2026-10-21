# Stage 32.1 — Live Sitemap + Network Import

Overlay these files into the project root, retaining the existing Stage 31/32 importer modules.

1. `node scripts/importer/test-live321.mjs`
2. Review the source site's terms and your permission to collect data. Use a truthful User-Agent; no bypass of access restrictions.
3. Dry-run (network requests, but no saved candidates/state):
   `node scripts/importer/run-live321.mjs --confirm-permission --maps 1 --limit 3`
4. Persist up to three candidates and the discovery manifest:
   `node scripts/importer/run-live321.mjs --confirm-permission --maps 1 --limit 3 --write`
5. `npm run check:games`; `npm run check:provenance`; `npm run build`

Safety: one Sitemap index, at most three slot Sitemap files, at most five HTML pages, 10-second inter-request delay, HTTPS same-host allowlist, no redirects, robots.txt validation, max XML size 2MB, Stage 32 HTML size/time limits, and pending-review only. `--confirm-permission` records operator confirmation; it is not itself a grant of permission. No publishing. If the server rejects or rate-limits requests, stop rather than circumventing restrictions.

Caution: Stage 32's existing fetcher may reject a candidate that already exists because it uses exclusive file creation. Such failures remain visible; the discovery manifest should not be treated as an authoritative history of successful writes until that condition is addressed. Avoid committing downloaded third-party HTML fixtures.
