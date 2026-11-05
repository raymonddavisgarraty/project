# Stage 43.5 — Human source capture and handoff (Sweet Bonanza original)

**Important:** This procedure is for *lawfully obtained, unapproved, private research*. It does not bypass licensing, copyright, commercial permissions, publisher access controls or editorial review. Do not capture a source if its terms prohibit retention. Do not paste licensed game rules or private editorial notes into public commits, `src/`, `_site/` or a Telegram bot.

## 1. The authority chain

Source identity and URL → verified publication/edition by the human researcher → privately captured exact file bytes → locally computed SHA-256 → manifest → **independent claim review** → approved provenance and original editorial copy → publication gate.

The software performs only **the manifest and byte-integrity steps**. A captured document may be misleading, modified, outdated, unauthorized or edition-incompatible even if its SHA matches.

## 2. Private directory, never tracked

Use the existing root of the repository and create a private folder only if needed:

    New-Item -ItemType Directory -Force .\data\editorial\evidence-snapshots

For a source lawfully saved by a human reviewer, place a file with a simple ASCII basename (letters, digits, hyphens) ending in `.pdf`, `.html` or `.txt`, e.g. `official-original-rules.pdf`. Do not rename a non-PDF into .pdf. Do not copy scraped competitor editorial text.

On Windows, calculate actual byte count and checksum:

    (Get-Item .\data\editorial\evidence-snapshots\official-original-rules.pdf).Length
    Get-FileHash .\data\editorial\evidence-snapshots\official-original-rules.pdf -Algorithm SHA256

Record **the exact URL and UTC observation time of the original capture**, not an invented game release date. The source must be one of the currently reviewed Stage 43.4 dossier leads; to add a new publisher-hosted rulebook URL, update/review the research dossier first.

## 3. Private manifest example (illustrative; placeholders WILL NOT pass validation)

```json
{
  "schemaVersion": 1,
  "kind": "research-source-snapshot-bundle",
  "bundleId": "sweet-bonanza-research-435",
  "entityType": "game",
  "entityId": "sweet-bonanza",
  "edition": "original-sweet-bonanza-2019",
  "createdAt": "REPLACE_WITH_ACTUAL_UTC_TIME",
  "sampleOnly": false,
  "status": "pending-source-review",
  "editorialApproved": false,
  "publicationApproved": false,
  "autoPublish": false,
  "snapshotRecords": [
    {
      "sourceId": "pragmatic-2019-launch",
      "sourceUrl": "https://www.pragmaticplay.com/en/news/pragmatic-play-launches-sweet-bonanza/",
      "sourceType": "first-party-announcement",
      "fileName": "captured-official-announcement.html",
      "mimeType": "text/html",
      "observedAt": "REPLACE_WITH_ACTUAL_UTC_TIME",
      "byteLength": 0,
      "sha256": "REPLACE_WITH_ACTUAL_SHA256",
      "documentRevision": null,
      "authenticityStatus": "unverified",
      "rightsStatus": "pending-review",
      "reviewStatus": "candidate-only"
    }
  ],
  "claimLeads": [
    {
      "field": "maxWinMultiplier",
      "sourceId": "pragmatic-2019-launch",
      "candidateValue": 21175,
      "qualifier": "producer-announced-maximum",
      "status": "candidate-only"
    }
  ],
  "notes": "Captured for independent review; source identity, rights and original game edition still require responsible editorial validation."
}
```

The canonical private manifest schema is `schemas/editorial/source-snapshot435.v1.schema.json`. The CLI additionally checks source identities against the unchanged Stage 43.4 dossier, current facts/provenance and actual local bytes.

After replacing **every** placeholder, write the JSON only inside the gitignored evidence folder as `manifest.json`. Do not copy the example into source-of-truth provenance.

## 4. Read-only check and interpretation

    node scripts/check-stage435.mjs --manifest=data/editorial/evidence-snapshots/manifest.json

If `ok: true`, file SHA and the manifest agree. This is **not** proof that the file came from the publisher, describes the correct rules, supports the proposed claim, or may lawfully be published. It should still report:
- sourceAuthenticityVerified=false
- rightsApproved=false
- editorialApproved=false
- publicationApproved=false
- autoPublish=false
- publicExportApproved=false

A genuine editor must next establish the document origin, exact mathematical rules version, relevant operator, permitted jurisdiction, rights for use/retention, and each field's meaning. For Sweet Bonanza, resolve 21,100× vs 21,175×, 96.48% minimum vs 96.51% theoretical and high vs medium volatility before any value changes.

## 5. Security and data management

- Private data under `data/editorial/evidence-snapshots/` is ignored by Git, but not necessarily encrypted. Protect local access, backups and retention; do not use this workflow for secret credentials or personal data.
- The CLI never fetches remote URLs, uploads files, writes to `src/content/`, updates approval records, or invokes Stage 38.
- Each record points to a basename in the **same folder**. It rejects path traversal, symlinks, oversized documents and checksum mismatches.
- If you require a new source kind, other locale, new game, or multiple review stages, extend the contract with separate tests and human approval rather than bypassing these checks.
