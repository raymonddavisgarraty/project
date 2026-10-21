# Stage 30 — Provider Registry + Field Normalization + Offline Batch

## Compatibility
Additive patch for Stage 29. No `package.json`, Eleventy templates, published game data, or existing scripts are overwritten. Uses Node.js 22 built-ins only. Requires the Stage 29 adapter at `scripts/importer/adapters/latestcasinobonuses.mjs` and fixture at `tests/fixtures/lcb-america-burger-bounty.html`.

## Install
Unzip at the repository root preserving folders.

## Tests
```powershell
node scripts/importer/test-stage30.mjs
node scripts/importer/batch-lcb.mjs --manifest tests/fixtures/lcb-batch-manifest.example.json
npm run check:games
npm run check:provenance
npm run build
```
The batch command is **dry-run by default** and prints a summary. It does not fetch any pages, write candidates, or publish content.

## Save candidates (only after checking dry-run)
```powershell
node scripts/importer/batch-lcb.mjs --manifest tests/fixtures/lcb-batch-manifest.example.json --write
```
This writes JSON to `src/content/import-candidates/lcb/`, with exclusive creation (`wx`); it never silently overwrites an existing candidate. This directory is intentionally distinct from published game records. The existing Stage 28.1 `check-import-candidates.mjs` only validates the `games` directory, not the `lcb` directory; Stage 30's batch output is separately validated by its extraction and normalization functions, not by that older validator.

## Multiple pages
Save HTML files locally where permitted, place a manifest alongside the HTML files, and add `{ "html": "saved-page.html", "url": "https://latestcasinobonuses.bet/slots/correct-slug/" }` entries. Each entry must match the page it was saved from. Paths are relative to the manifest's directory. Maximum 100 entries per run.

## Safety and scope
- Offline only; **no crawling, sitemap discovery or remote requests** in this patch. Source access and permissions must be reviewed separately.
- Provider aliases are an illustrative registry, **not an authoritative vendor list**. Unknown providers stay `null` and are flagged.
- Known theme labels map to language-independent codes. Unknown labels remain in `normalization.unmappedThemes` for review and are not discarded.
- Missing RTP/volatility/maxWin stay `null`; dates in the future get a review flag.
- No automatic publishing, AI-generated editorial text, third-party reviews or images.
- Existing Stage 29 extractor's limited HTML recognition remains; test on more real saved pages before considering bulk crawling.
- Importer output uses `schemaVersion: 2` and is a **research candidate**, not a drop-in replacement for the published game schema.
