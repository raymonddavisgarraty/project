# Stage 37 — Editorial Approval (additive patch)

Install: extract ZIP at the project root. Only three new files are added under `scripts/importer/`; the Stage 34 and Stage 36 modules are dependencies and are not replaced.

## Tests

```powershell
node scripts/importer/test-stage37.mjs
node scripts/importer/test-stage34.mjs
node scripts/importer/test-stage36.mjs
```

## Prepare the first editorial draft

```powershell
node scripts/importer/run-stage37.mjs prepare --file america-burger-bounty--7b3984d5ea36.json
```

Output: `data/editorial/drafts/america-burger-bounty--7b3984d5ea36.json` (create-only, no overwrite). The proposal in `data/editorial/normalization-proposals/` must match the exact candidate SHA-256 and current registry mapping. Draft defaults to `decision: rejected` and has blank reviewer, reason and evidence.

Review and edit the draft in VS Code. A `decision: approved` requires reviewer, reason, `confirmedRights: true`, `confirmedFacts: true`, and evidence from at least one independent HTTPS source, as enforced by Stage 34. The Stage 37 validator also checks that the provider is verified in the registry and that taxonomy codes exist. If unknown taxonomy labels are present, set `taxonomyChecked: true` only after manually examining and resolving their implications. Do not invent data or evidence.

```powershell
node scripts/importer/run-stage37.mjs validate --file america-burger-bounty--7b3984d5ea36.json
node scripts/importer/run-stage37.mjs approve --file america-burger-bounty--7b3984d5ea36.json
```

**As of 2026-10-22, America Burger Bounty has a future release date (2026-11-19). It cannot be approved as released.** The validator blocks approval while the candidate's release date is in the future, even if the draft release date is removed. The initial `rejected` draft may be prepared for later review. A validation of an incomplete/rejected draft may fail until reviewer and reason are supplied.

Approved decisions are immutable and recorded via Stage 34 in `data/editorial/reviews`. There is **no publication** and **no modification of source candidates**. Stage 35 staging is a separate explicit action.

Note: Stage 37 is an additional workflow over Stage 34; Stage 34's older direct `decide` CLI still exists. Use Stage 37's `approve` command for the stricter registry and future-release checks. A future hardening milestone should unify these entrypoints to eliminate bypasses.
