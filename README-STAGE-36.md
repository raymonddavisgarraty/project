# Stage 36 — Provider Registry & Taxonomy

Additive patch: existing `registry.mjs`, `normalize-lcb.mjs`, Stage 30–35 scripts and original candidate JSON are NOT replaced.

## Install
Copy `scripts/` and `src/` from the ZIP into the project root.

## Commands
```
node scripts/importer/test-stage36.mjs
node scripts/importer/run-stage36.mjs audit
node scripts/importer/run-stage36.mjs propose
```
`audit` is read-only. `propose` creates immutable (`wx`) proposal JSON files in `data/editorial/normalization-proposals/`. Existing proposals are never overwritten. Review the proposals manually. **They do not update candidates or grant editorial approval.**

## Important
- `Amusnet Interactive` is a *proposed* alias for `amusnet`, not marked verified. Resolve only after checking an authoritative provider source.
- The stage merges source raw labels with normalized labels, so `Классика` and `Jackpot` can be recovered even if the earlier normalizer omitted them.
- Existing Stage 34 queue still displays `quality: unknown`; use Stage 35 audit for quality issues. This patch does not alter that CLI.
- For future integration, import `loadRegistries`, `resolveEntry`, `resolveMany`, `propose36` from `registry36.mjs`. Do not auto-apply proposals.
- Review proposed normalization and sources before Stage 37 approval. Never infer publication rights from publicly visible metadata.
