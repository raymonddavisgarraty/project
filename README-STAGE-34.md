# Stage 34 — Editorial Review Workflow (CLI)

Extract into `seo-review-platform` root. Adds files only; does not replace existing code or modify site templates.

## Test
```powershell
node scripts/importer/test-stage34.mjs
node scripts/importer/test-stage33.mjs
npm run check:games
npm run check:provenance
npm run build
```

## Review queue
```powershell
node scripts/importer/run-review34.mjs list
node scripts/importer/run-review34.mjs show --file 100-glossy-hot-coin-boost--3876cdd6f03a.json
node scripts/importer/run-review34.mjs prepare --file 100-glossy-hot-coin-boost--3876cdd6f03a.json
```
The last command creates `data/editorial/drafts/<filename>`; it will never overwrite an existing draft. Open and edit the JSON manually. `decision` defaults to `rejected`. To approve, set `decision: "approved"`, reviewer, reason, `confirmedRights: true`, `confirmedFacts: true`, fix the facts (providerId, future date, taxonomy), and provide independent evidence URL(s) with notes. Never mark facts verified without actually verifying them; check the rights to use the data independently.

Then:
```powershell
node scripts/importer/run-review34.mjs decide --file 100-glossy-hot-coin-boost--3876cdd6f03a.json --draft data/editorial/drafts/100-glossy-hot-coin-boost--3876cdd6f03a.json
```
Decisions are immutable and stored under `data/editorial/reviews/<SHA256-of-exact-candidate-file>.json`. A new imported revision gets a different hash and its own review. Source candidate JSON is never modified. Approval DOES NOT publish or modify `src/content/games`, and `autoPublish` remains false. Publishing reviewed games with localized editorial text and provenance is a separate future stage.

## Limitations
- Review is a command-line workflow, not a browser-based moderation panel.
- Evidence URLs are syntactically checked, not fetched or independently authenticated. A human must validate them.
- `confirmedRights` is a human attestation, not a legal determination.
- Approval validates a selected subset of facts; does not guarantee that all details are correct.
- Do not commit unlicensed third-party HTML, images, or descriptions.
