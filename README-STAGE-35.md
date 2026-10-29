# Stage 35 — Quality Audit & Approved Staging

This is an additive patch. Copy `scripts/importer/*.mjs` to the existing project.

Prerequisites: Stage 33 `quality33.mjs`, Stage 34.1 `review34.mjs`.

## Test

```powershell
node scripts/importer/test-stage35.mjs
node scripts/importer/test-stage34.mjs
```

## Audit actual candidates

```powershell
node scripts/importer/run-stage35.mjs audit
```

This reports actual `normalization.issues` and computed quality, unlike the Stage 34 queue's `unknown` fallback.

## Stage a reviewed candidate

Only after an actual Stage 34 `approved` decision exists for the exact candidate revision:

```powershell
node scripts/importer/run-stage35.mjs stage --file <candidate-file>.json
```

Output goes to `data/editorial/approved-staging/<sha256>.json` and is **not read by Eleventy**. It is intentionally not a published game. Existing staging files are never overwritten. No auto-publishing, no fabricated provider or source facts.

Important: Stage 34 validates a provider ID format, not existence in the provider registry. Independently verify the provider, legal data-use rights, evidence, and any future release dates before approving. Stage 36 will map approved staging records to the actual production game schema after validating the project data model.
