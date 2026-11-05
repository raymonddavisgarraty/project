# Checkpoint 03 — Studio integration boundaries (design only)

Status: proposal for Stage 46 planning. **No Studio code is being added.**

## Separate responsibilities

```text
Studio: source collection, snapshots, extraction, conflicts, draft brief
      ↓ versioned, untrusted export package (NOT publication approval)
Existing importer/normalization/review 34–37
      ↓ independently approved and hash-bound staging
Editorial/localized QA 39/39.1, triage 40 (read-only)
      ↓ explicit Stage 38 publishing action by authorized reviewer
Approved facts + localized editorial files
      ↓ Eleventy static build and published route manifest
Public HTML; no runtime dependency on Studio
```

Stage ordering above represents logical requirements; it does not imply that `39` or `40` are enforced inside every Stage 38 call today. Treat them as separate checks until a verified integration exists.

### Proposed inbound envelope — NOT current Stage 38 schema

```json
{
  "schemaVersion": 1,
  "packageId": "example-export-001",
  "entityType": "game",
  "sourceEntityKey": "untrusted-external-key",
  "locale": "en",
  "status": "pending-editorial-review",
  "claims": [
    {
      "field": "rtp",
      "value": null,
      "sourceId": "s-001",
      "verificationStatus": "unverified"
    }
  ],
  "sources": [
    {
      "id": "s-001",
      "url": "https://www.example.org/source",
      "fetchedAt": "2026-10-29T00:00:00Z",
      "snapshotHash": "sha256:<hex>"
    }
  ],
  "editorialBrief": {
    "intent": "informational-review",
    "suggestedSections": ["overview", "features", "faq"]
  },
  "relatedEntityCandidates": [],
  "publicationApproved": false
}
```

This illustrative payload is **not accepted by current scripts** and uses example URLs inside design documentation only. Map it to current candidate, provenance and review schemas at Stage 46.

## Hard boundaries

1. Treat every Studio field and suggested link as **untrusted**; format/schema/URL whitelist validation and provenance are required.
2. Studio cannot set `review.decision=approved`, `reviewStatus=editorially-approved`, `status=approved-staging` or a published flag.
3. The current Stage 38 rechecks candidate SHA-256 and immutable review evidence, verified provider registry, duplicate ID/slug and uses exclusive writes. Keep those checks.
4. The publisher owns route assignment, canonical, locale status and public link graph. Suggested relation IDs from Studio require editorial confirmation and published target resolution.
5. Keep source snapshots, secrets, competitor collections, raw dumps and private analytics out of `src/assets` / `_site`.
6. Stage 46 contract needs explicit version migration, idempotent import, evidence binding, rejection reporting, rollback and test fixtures before implementation.

## Pending decisions

Source rights and robots/legal terms; exact game/provider identity-matching rules; export package signing vs hash binding; curator UI; access controls; release/revocation after import.
