# Stage 32 — Controlled Fetcher + Discovery-to-Import Pipeline

## Compatibility
Additive patch for Stage 29–31. Does not replace published games, Eleventy templates, or package.json. Requires existing files: `scripts/importer/discovery31.mjs`, `scripts/importer/normalize-lcb.mjs`, `scripts/importer/adapters/latestcasinobonuses.mjs`, and `tests/fixtures/lcb-america-burger-bounty.html`.

## Tests
`node scripts/importer/test-stage32.mjs`

## Offline dry run
First use a Stage 31 discovery state containing the America Burger Bounty URL. For a reproducible test without modifying your real state, generate a separate test state:

`node scripts/importer/discover-urls.mjs --xml tests/fixtures/stage31/slots-sitemap.xml --state data/discovery/stage32-test.json --write`

Then:

`node scripts/importer/run-stage32.mjs --state data/discovery/stage32-test.json --html-map tests/fixtures/stage32/html-map.example.json`

The map points to the Stage 29 fixture, not the real downloaded HTML. To use real HTML, edit the map to point to `tests/fixtures/lcb-real-america-burger-bounty.html`.

## Write candidates (only after dry-run)
`node scripts/importer/run-stage32.mjs --state data/discovery/stage32-test.json --html-map tests/fixtures/stage32/html-map.example.json --write`

The write mode uses exclusive creation (`wx`), never overwrites existing candidate files, and marks successful URLs `fetched` in the discovery state. Re-run on the same state skips fetched URLs. A failed candidate remains pending. If a candidate already exists from Stage 30, write mode reports an error rather than overwriting it.

## Network mode (disabled unless explicitly confirmed)
Network use is **not authorized merely by passing a flag**. Before enabling, verify source terms and obtain the necessary permission. `robots.txt` is not itself a copyright license. Network mode fetches robots.txt, fails closed if unavailable, blocks redirects, restricts to the single HTTPS host, processes up to 5 pages, and uses 3s spacing. It does not bypass access controls, CAPTCHAs, or rate limits. Do not run until permitted.

`node scripts/importer/run-stage32.mjs --state data/discovery/lcb-urls.json --network --confirm-permission --limit 3`

Use `--write` only after reviewing the dry-run output.

## Known limits
- This is an initial controlled prototype. No automatic retry on HTTP 429/503; this avoids hammering the source. It does not automatically crawl sitemap indexes.
- Robots parsing supports common User-agent / Allow / Disallow rules, but is not a complete RFC 9309 implementation. For production, replace with a standards-compliant parser and enforce Crawl-delay where applicable.
- HTML fetch uses bounded size checks after receiving the response; use streaming bounds for high-scale deployments.
- Network content is not published; only normalized pending-review candidates are written.
- If `data/discovery/stage32-test.json` does not contain the example URL, adjust the fixture or the mapping. No fixture URLs are invented.
