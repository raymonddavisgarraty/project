# Stage 38 — Publishing Bridge (explicit only)

Copy `scripts/importer/*.mjs` to your project. Does not modify existing Eleventy templates, games.js or content.

## Prerequisites
- A real immutable approved review in `data/editorial/reviews/<candidate-sha256>.json`.
- Stage 35 approved staging in `data/editorial/approved-staging/<candidate-sha256>.json`.
- An original candidate whose exact bytes match that SHA-256.
- A manually written, fact-checked **English editorial JSON** (not generated from scraped prose), with `slug`, `seo`, `hero`, `sections`, `pros`, `cons`, `faq`, `author`, `updatedDate`. Optional: `rating`, `media`, `monetization`, `relatedGames`.
- Verified provider in `src/content/registries/providers.json`.

## Commands
```
node scripts/importer/test-stage38.mjs
node scripts/importer/run-stage38.mjs check --staging data/editorial/approved-staging/<hash>.json --editorial data/editorial/english/<slug>.json --slug <slug>
node scripts/importer/run-stage38.mjs publish --staging data/editorial/approved-staging/<hash>.json --editorial data/editorial/english/<slug>.json --slug <slug>
npm run check:games
npm run check:provenance
npm run build
```
`check` is dry-run; `publish` is the **only** write action. Both require complete editorial approval. Publishing creates `src/content/games/<slug>.json` and `src/content/locales/en/games/<slug>.js` with exclusive create. No automated publishing during imports or builds. Existing files cannot be overwritten.

## Important
- No production games currently approved; do not publish any existing pending candidate.
- Publishing copies editorial JSON to a JS module; no auto-generated reviews or invented ratings/affiliate IDs.
- This is a first bridge; after publish run the existing checks and Eleventy build and inspect rendered HTML before git commit/deployment. Publishing does not deploy.
