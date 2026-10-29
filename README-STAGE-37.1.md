# Stage 37.1 — Unified Approval Gate

## Installation
Extract the ZIP at the project root. The patch replaces only:
- `scripts/importer/review34.mjs`
- `scripts/importer/stage37.mjs`
- `scripts/importer/run-review34.mjs`
- `scripts/importer/test-stage34.mjs` (updated regression test for the stricter approval policy)

Requires Stage 36 and Stage 37 already installed.

## What changed
- `review34.decide()` delegates **approved** decisions to `stage37.validate37()` before writing any immutable review record. The old `run-review34.mjs decide` path cannot bypass Stage 37.
- Stage 37 approval validates current normalization proposal file, candidate hash, source URL, and current registry mappings.
- Approved provider must match a verified provider in current mapping; approved themes/features must be known and supported by current proposal.
- Existing Stage 34 evidence/rights checks, future release block, and immutable review storage remain in force.
- `rejected` decisions can still be recorded without an approval proposal.
- No publishing or candidate mutation.

## Tests
```powershell
node scripts/importer/test-stage34.mjs
node scripts/importer/test-stage36.mjs
node scripts/importer/test-stage37.mjs
node scripts/importer/test-stage35.mjs
npm run build
```

## Existing command
```powershell
node scripts/importer/run-review34.mjs decide --file FILE.json --draft data/editorial/drafts/FILE.json
```
The command now rejects approvals lacking an up-to-date Stage 36 proposal. Optional custom locations: `--proposals PATH --registries PATH`.

## Important
Approval still requires a human editor, independent evidence, confirmed rights and verified facts. A successful test does not verify the correctness of source facts or authorize republishing copyrighted descriptions.
