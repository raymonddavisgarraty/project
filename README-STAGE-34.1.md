# Stage 34.1 — Legacy candidate compatibility

Root cause: Stage 34 required `importSignature` while existing schemaVersion=2 LCB candidates do not have that field. The review queue silently skipped them.

Replace only `scripts/importer/review34.mjs` with this patch. It accepts pending-review candidates with source.url and facts, regardless of importSignature presence. Reviews remain bound to the SHA-256 hash of the exact candidate file. New candidates with importSignature retain signature validation. Invalid entries now appear as `decision: invalid` rather than disappearing silently.

Run:

```powershell
node scripts/importer/test-stage34.mjs
node scripts/importer/run-review34.mjs list
node scripts/importer/run-review34.mjs show --file 100-glossy-hot-coin-boost--3876cdd6f03a.json
```

No automatic publication or editing of existing candidate JSON.
