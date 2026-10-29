# Stage 39 — Editorial Content Pipeline

## Install
Extract ZIP into the project root, retaining paths. This patch **adds** three files under `scripts/importer/` and does not modify Stage 38 or any Eleventy templates.

## Verify
```powershell
node scripts/importer/test-stage39.mjs
node scripts/importer/test-stage38.mjs
npm run build
```

## Create a brief from approved staging
```powershell
node scripts/importer/run-stage39.mjs brief --staging "data/editorial/approved-staging/HASH.json" --slug game-slug --out "data/editorial/briefs/game-slug.json"
```
Brief creation uses exclusive file creation: existing files are not overwritten.

## Audit an English editorial JSON draft
```powershell
node scripts/importer/run-stage39.mjs audit --editorial "data/editorial/english/game-slug.json" --slug game-slug --staging "data/editorial/approved-staging/HASH.json" --compare-dir "data/editorial/english"
```
Exit code 0 = automated checks passed, 2 = not ready, 1 = input/error. A passed audit is **not** a publication approval. Stage 38's separate explicit publishing remains required.

## Scope and limits
- Checks: schema compatibility with Stage 38, required sections/FAQ/pros-cons, SEO length warnings, evidence URL syntax, potential unverified RTP claim, exact or token-overlap duplicate among **JSON drafts** in compare-dir, future-release date, content fingerprint.
- Duplicate matching is heuristic; short boilerplate can produce false positives, and paraphrases can evade detection. The comparison does not read the existing `.js` editorial modules, nor compare with third-party websites.
- Evidence URLs are checked for format only, not visited or independently verified. The audit does not validate all numeric claims, check copyright, inspect images, verify affiliate disclosures, or certify unique/accurate content.
- No AI-generated review text, no auto-publish, no modification to existing published pages.
- Future date and staging hash validation use the existing Stage 38 validator; `brief` must be created only from a valid approved-staging record.
