# G2 checkpoint — Release-scope preflight, NOT publication

**Development only.** Based on the newly integrated `main` baseline after PR #23. No changes to live Eleventy rendering, Stage 42.2 indexability, Stage 43 approval gates or Studio/Bot applications.

## Problem

The existing `createIndexability42` requires globally `productionReleaseAllowed=true`. Therefore an independently reviewed pilot cannot be considered for release while unrelated legacy claims remain pending. Disabling that gate would be dangerous.

This small **read-only preliminary validator** is an initial building block for a future *approved release-scope authority*. It looks at independently reviewed per-entity audit items, current generated route identity, immutable entity ID vs slug, reviewed author, SHA-256 revision binding, explicit global-information rights and the absence of unreviewed relations/commerce. An unrelated failing preview audit item does not prevent an otherwise valid **synthetic proposal**.

It **never** permits real release. Even if all synthetic candidate checks pass, the return value states `publicExportApproved:false`, `indexabilityApproved:false`, `publicationApproved:false`, `autoPublish:false`. Its `eligibleProposals` are research/planning diagnostics only. Callers may not write them to sitemap, robots, HTML, published routes or a public JSON catalogue.

## Scope and limits

- Only EN game/casino identity, route and publication *preflight*. No actual approved content is currently available.
- An independently measured hash is an input for the preflight, not something the module computes or authenticates. Passing fabricated audit decisions and matching fabricated hashes **must not** be considered a real approval. The future trusted adapter needs revision computation from canonical facts + human-approved editorial copy + evidence/rights decision log.
- Author reviews are mandatory; all mapped claims must already be verified by a trustworthy Stage 43 audit. The existing casino audit uses slug for provenance; changed casino IDs are intentionally blocked until migration.
- Related links and commercial offers are **not** approved in this version; any candidate relation is rejected. A live game containing unreviewed `relatedGames` cannot be treated as eligible yet.
- Global public-information rights are required because the current static site does not restrict audiences geographically. EN does not prove a visitor's jurisdiction; specific gambling/marketing rights must be reviewed separately.
- Output is fail-closed for duplicate/invalid records and rejects unexpected decision fields, including affiliate links.

## Reproducible tests

```powershell
npm run test:release-preflight
npm run verify:integration
```

Test covers 20 synthetic rejection cases, one eligible but **nonpublishing** synthetic preflight, and the **real repository** with zero proposed public pages. No user-private `data/editorial/` files are read or changed by the preflight module.

## Remaining G2 work before G3/G4

1. Design a versioned, authenticated human release-decision manifest; source trust must not depend on flags supplied by Studio.
2. Compute exact canonical revision digests for facts, editorial content, source decisions, author and public-visibility fields.
3. Migrate per-entity identities/author attribution and review-safe relations, including casino ID/slug split.
4. Validate market/global public-information eligibility, separate commercial/channel permissions, and revocation.
5. Only after those checks connect the same trusted release authority to the HTML indexability allowlist and **future** outbound JSON catalogue; test false approvals, revocations, stale hashes and rollback.

This PR must remain draft until Windows acceptance. No public deployment or publication is authorized.
