# Stage 37.1.1 — Stage 35 regression compatibility

## Change
Only `scripts/importer/test-stage35.mjs` is replaced. The production approval gate (`review34.mjs`, `stage37.mjs`) and staging code (`stage35.mjs`) are unchanged.

The regression test now creates isolated temporary provider/theme/feature registries, a Stage 36 normalization proposal with the candidate SHA-256, and a valid editorial draft. It stages a historical release and separately verifies that a future-release candidate cannot be approved even after its date is cleared in the draft. It checks immutable staging (no overwrite) and `autoPublish: false`.

The `provider.example.org` URL is a synthetic test fixture, **not evidence for a real game**.

## Install
Extract the ZIP into the project root, replacing the one test file.

## Run (PowerShell)
```powershell
node scripts/importer/test-stage35.mjs
node scripts/importer/test-stage34.mjs
node scripts/importer/test-stage36.mjs
node scripts/importer/test-stage37.mjs
npm run build
```

Expected Stage 35 output:
`Stage 35 tests OK (unified approval gate, future-release block, staging, hash binding, no overwrite, no publish).`

Tested with Node.js 22 against the provided Stage 37.1, Stage 35, and Stage 33 modules in an isolated local fixture. This is a regression-test fix, not proof of full repository build compatibility.
