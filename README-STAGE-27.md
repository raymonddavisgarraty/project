# Stage 27 — Provenance and validation

## Install
Extract into project root preserving directories. Existing global game JSON and editorial files are NOT modified. `package.json` is replaced with the Stage 26 version plus `check:provenance`. If you have customized `package.json` since Stage 26, merge the new script manually instead of overwriting it.

## Commands
```powershell
npm run check:games
npm run check:provenance
npm run build
```

## Model
- `src/content/games/*.json`: canonical published game facts (unchanged).
- `src/content/provenance/games/*.json`: per-field status and evidence, separate from the facts.
- `src/content/import-candidates/games/*.json`: optional proposals for manual review; the checker validates their structure and never applies them.

Evidence example inside `fields.rtp.evidence`:
```json
{"url":"https://example.org/game-info","sourceType":"official","observedAt":"2026-10-20T12:00:00Z","value":96.48}
```
SourceType is an asserted classification requiring human verification. Do not mark `verified` solely because a URL exists; inspect whether the source actually supports the value. An empty evidence list is normal for imported legacy facts.

Candidate example (save as `src/content/import-candidates/games/sweet-bonanza-rtp-001.json`):
```json
{"gameId":"sweet-bonanza","field":"rtp","proposedValue":96.5,"sourceUrl":"https://example.org/game-info","observedAt":"2026-10-20T12:00:00Z","status":"pending"}
```

**No automatic acceptance:** checker never writes game facts, provenance or candidate records. An RTP difference may represent a legitimate version or operator-specific RTP, not necessarily an error; do not overwrite without version/market analysis.

## Scope
This is validation and provenance infrastructure, not a production crawler, source verifier, automatic conflict detector, or approval UI. The `unverified` statuses are intentionally conservative. Do not treat the original values as verified.
