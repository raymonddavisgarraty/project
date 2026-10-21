# Stage 28.1 — Separate import-candidate validation

Fixes the integration mismatch between Stage 27 provenance validation and Stage 28 importer.

## Install

Copy `scripts/check-provenance.mjs` and `scripts/check-import-candidates.mjs` into the project's `scripts/` directory, replacing only `check-provenance.mjs`. **Do not overwrite package.json.** No dependencies added. Node 22 compatible.

Stage 27 provenance validation now checks **published game records only**. The new candidate validator handles two distinct existing formats:

- Stage 28 `kind: "game-import-candidate"` for new games that do not exist in the published database.
- Stage 27 field-level proposals for existing games.

This change does not promote candidates, update published records, or affect Eleventy templates. The validator checks structural integrity, not the accuracy or legal reuse of extracted facts.

## PowerShell commands

```powershell
node scripts/importer/test.mjs
node scripts/importer/run.mjs --fixture tests/fixtures/sample-game.html
npm run check:games
npm run check:provenance
node scripts/check-import-candidates.mjs
npm run build
```

To add an npm script **without replacing package.json**, edit its existing `scripts` section and add:

```json
"check:import-candidates": "node scripts/check-import-candidates.mjs"
```

Then run `npm run check:import-candidates` instead of the direct Node command.

Expected: `check:provenance` passes for the two published games even when Demo Fruit Quest is in the import queue; `check-import-candidates` validates Demo Fruit Quest independently.

Do not commit generated demonstration candidates unless intentionally preserving fixtures; prefer excluding `src/content/import-candidates/games/*.json` in `.gitignore` (keep `.gitkeep`).
