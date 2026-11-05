# Stage 43.5 — Private Source Snapshot Integrity (Offline, Pending Review)

**Status:** draft; no source authenticity, legal rights, claim verification or public release granted. This checkpoint builds on Stage 43.4 Sweet Bonanza original-2019 research only.

## Why this checkpoint exists

Stage 43.4 found a manufacturer announcement (6×5, high volatility, up to 21,175×), a manufacturer product page, and an **unauthenticated third-party mirror** of apparent rules (theoretical RTP 96.51%, minimum 96.48%, medium-volatility text). These materials do **not** establish an operator-specific/default RTP, exact game-rule edition, source integrity, rights or facts suitable for immediate approval.

A URL and a research summary are not evidence of *what exact bytes* the editor inspected. Stage 43.5 creates a **private offline manifest** and byte-integrity checker for captured files that a human independently and lawfully obtains.

### Guarantees and non-guarantees

| Gate | What it actually means |
|---|---|
| Manifest syntax | Consistent entity ID, source ID, edition, revision description, timestamps, private source type |
| URL binding | Identified URL is **the same research lead** already declared in the Stage 43.4 dossier; NOT proof that bytes were served by it |
| Byte length and SHA-256 | Captured local bytes match their manifest; does NOT authenticate the publisher, date, version, market, rights or factual content |
| Claim leads | Suggested field/value/qualifier agrees with the existing **research** observation; does NOT approve the field |
| Rights and editorial status | Always pending/unverified. Neither source capture nor checksum may set an approved state |
| Public indexing | No changes. Stage 42.2 noindex / empty sitemap and Stage 43 release gate remain active |

## Files

- `schemas/editorial/source-snapshot435.v1.schema.json`: **versioned private manifest JSON Schema**. Runtime cross-reference and checksum checks are stricter than JSON Schema alone.
- `src/lib/source-snapshot435.mjs`: pure manifest validator. Strict fields, source-ID/URL/type binding to the existing Stage 43.4 dossier, no approvals, ISO UTC chronology, path safety, SHA digest shape, candidate claim links.
- `scripts/check-stage435.mjs`: read-only Node CLI. Reads only user-selected **local files**. Verifies actual byte length, SHA-256, PDF signature (if PDF), regular-file type and disallows symlinks, path traversal and unapproved bundle promotion.
- `scripts/test-stage435.mjs`: sample and adversarial cases. Tests tampering, CRLF byte drift on Windows, source substitution, approved/rights injection and real-candidate metadata still not implying authenticated evidence.
- `tests/fixtures/stage435/evidence-bundle.synthetic.json` and `synthetic-snapshot.txt`: **fictional fixture**, zero claims, no original game content. The file must use LF on Windows, macOS and Linux; `.gitattributes` pins it to `eol=lf`.
- `.gitignore` prevents accidental commit of the **private** `data/editorial/evidence-snapshots/` directory. Existing untracked `data/editorial/` and other user files are untouched.
- `docs/editorial435-private-source-capture.md`: manual evidence capture and editor handoff; no network downloads are performed by the project.

## Commands (PowerShell, from repository root)

    git status --short
    git fetch origin
    git switch stage-43-5-private-source-snapshot-integrity

    npm run test:stage435
    npm run check:snapshot-integrity
    npm run test:stage434
    npm run check:evidence-pilot
    npm run test:stage43
    npm run test:integration-contract
    npm run check:entities

    npm run build
    npm run check:seo
    npm run check:display
    npm run check:navigation
    npm run check:review-pages
    npm run audit:editorial

To inspect a future *privately captured* and manually described bundle (do not paste copyrighted/private source bytes into Git):

    node scripts/check-stage435.mjs --manifest=data/editorial/evidence-snapshots/manifest.json

The CLI permits a manifest directly in `tests/fixtures/stage435/` (synthetic only) or `data/editorial/evidence-snapshots/` (private real captures). An arbitrary file elsewhere is refused. All actual source bytes stay in the same folder as the manifest. A real manifest requires a source ID and exact URL already present in Stage 43.4, and at least one matching unapproved research claim lead. For new legitimate sources, add a separate reviewed research-dossier revision first; never bypass the allowlist.

**Expected synthetic check:** `ok: true`, `sourceFilesChecked: 1`, `claimLeadsChecked: 0`, `byteIntegrityVerified: true`, but `sourceAuthenticityVerified: false`, `rightsApproved: false`, `editorialApproved: false`, `publicationApproved: false`, `autoPublish: false`.

The site still has 55 unverified claims and 66 blockers per the owner's latest Stage 43 audit. The strict editorial check is **supposed** to fail until independent evidence and a responsible human editor actually approve the correct revision and market. No data is automatically exposed to Eleventy, Studio or Telegram.

## Acceptance and further work

1. Actual Windows Node/Eleventy regression run succeeds; the synthetic SHA-256 remains portable.
2. Human reviewer obtains publisher-distributed original game rules/maths and checks authenticity/edition/operator configuration. The third-party mirror cannot simply be relabeled official.
3. Reviewer confirms rights for private retention and potential public citation, with a specific verified source version.
4. Each candidate claim, original editorial paragraph, author and rating methodology undergoes independent verification and an explicit revision-bound decision. Discrepancies remain visible and cannot be normalized away.
5. Only after that can Stage 43 evidence records change through the existing approved pipeline. Stage 38 and the future approved publication catalogue remain separate gates; Studio and Bot are out of scope.
