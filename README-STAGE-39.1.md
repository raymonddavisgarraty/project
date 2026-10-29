# Stage 39.1 — Fact Consistency & Published Content Comparison

## Installation

Extract the ZIP into the repository root. Only three new files are included; Stage 38 and 39 files are unchanged.

## Checks

```powershell
node scripts/importer/test-stage391.mjs
node scripts/importer/test-stage39.mjs
node scripts/importer/test-stage38.mjs
npm run build
```

## Audit a draft

```powershell
node scripts/importer/run-stage391.mjs audit --editorial "data/editorial/english/SLUG.json" --slug SLUG --staging "data/editorial/approved-staging/HASH.json" --published-dir "src/content/locales/en/games"
```

The audit exits with 0 when ready, 2 when not ready, 1 for runtime errors. It does not publish anything.

Checks: numeric RTP and reel claims, release year, volatility, misleading guaranteed wins, and near-duplicate content against already published English JS/JSON editorial modules. Stage 39 checks are retained.

## Limitations

- Claim detection is regex/heuristic and does not prove factual accuracy. Human fact-checking remains mandatory.
- Token-set similarity may miss paraphrases and may flag common boilerplate; review matches manually.
- Published JS modules are imported as **trusted local project code**; do not point `--published-dir` at untrusted downloads.
- This does not alter Stage 38's explicit publication or immutable review requirements.
- It does not check live websites or external copyright/licensing.
