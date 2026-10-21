# Stage 29 — LatestCasinoBonuses offline adapter (prototype)

## Scope
- No new dependencies, no modifications to existing Eleventy templates, published games, or package.json.
- Parses **saved HTML** into a separate `pending-review` candidate. No network requests are made by this patch.
- Site access rules and permission to automate crawling have NOT been confirmed. Do not bulk-fetch until verified.
- Extractor is based on observed source labels and a synthetic HTML fixture, not tested against a real saved page. Real markup may differ.

## Install
Unzip at repository root, preserving `scripts/` and `tests/`.

## Test
```powershell
node scripts/importer/test-lcb.mjs
node scripts/importer/run-lcb.mjs --html tests/fixtures/lcb-america-burger-bounty.html --url https://latestcasinobonuses.bet/slots/america-burger-bounty/
```
The second command prints JSON; it does not write files.

## Candidate file
Add `--write` to write under `src/content/import-candidates/lcb/`. This separate folder is deliberately NOT consumed by the published-game validator. It uses exclusive create (`wx`) to prevent silent overwrite.

## Real HTML validation
Save an HTML page **manually where permitted**, e.g. `tests/fixtures/real-lcb-page.html`, then pass it with `--html` and the matching `--url`. Review output for missing or incorrect fields before enabling any automation. Do not check third-party HTML into a public repo without appropriate rights.

## Caveats
- No external review, rating, publication date, image, or editorial text is copied.
- Missing facts remain `null` and are never fabricated.
- A `providerId` slug is provisional until matched against provider directory.
- `themes` retain raw labels; normalized taxonomy is a future stage.
- The extractor expects HTML table rows. If the real site uses other markup, adapter needs revision.
- The source may have jurisdiction-specific restrictions; do not assume game availability.
