# Stage 40 — Editorial Workflow Queue

Extract into repository root. Adds three scripts; does not modify existing code or publish anything.

## Run

```powershell
node scripts/importer/test-stage40.mjs
node scripts/importer/test-stage391.mjs
node scripts/importer/test-stage39.mjs
node scripts/importer/test-stage38.mjs
npm run build
node scripts/importer/run-stage40.mjs report
```

Export immutable report (fails if output exists):

```powershell
node scripts/importer/run-stage40.mjs export --out-file data/editorial/reports/workflow40.json
```

Options: `--staging-dir`, `--draft-dir`, `--published-dir`, `--facts-dir`, `--threshold`.

## Statuses

- `needs-editorial`: approved staging exists, English draft missing.
- `blocked`: staging invalid, slug collision, or automated editorial audit errors.
- `ready-for-human-review`: automated audits pass; **not** publication approval.
- `published-or-collision`: matching output exists; manually verify provenance.
- `unlinked-draft`: editorial draft has no corresponding approved staging.

Staging has no guaranteed slug field: this tool derives a *suggested* slug from the candidate filename. Before publishing, use the Stage 38 explicit slug and review workflow.

No auto-publishing, no approval mutation, no network access. All published `.js` modules scanned by Stage 39.1 must be trusted local project files.
