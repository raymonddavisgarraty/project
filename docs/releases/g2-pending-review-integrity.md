# G2.2 — Pending review manifest and deterministic revision fingerprint

**Development-only offline module.** No source authenticity, human approval, rights, public export or indexability is granted. Designed to precede the trusted release manifest and outbound Published Catalogue.

## Why

The G2 preflight introduced in PR #24 can check hypothetical per-entity approvals, but matching approval fields alone are not evidence. This checkpoint defines a **pending-only**, exact-content fingerprint and manifest so editorial proposals can identify what text/facts they refer to without being confused with an independently authorized release.

The module `src/lib/pending-review-integrity-g2.mjs` contains three pure functions:
- `canonicalJsonG2(value)`: stable Node.js JSON serialization using sorted object keys, preserving exact array order and values, rejecting unsupported values/unsafe object keys, non-finite numbers, cycles and oversized payloads. **Not RFC 8785**; hashes are specific to this documented Node algorithm.
- `fingerprintPendingPayloadG2(payload)`: SHA-256 of the exact candidate identity, locale, canonical path, proposed title/summary/facts, referenced evidence digests, pending market scope and no related IDs. These are **unapproved research values**, even if the checksum matches.
- `inspectReviewRequestG2({manifest,payloads,now})`: rejects manifest/payload mismatches, unknown keys, false timestamp/locale, changed revision, duplicate IDs, approval injection, rights/commerce/publishing escalation. Returns *all six approval flags false*, including on valid synthetic fixtures.

The module reads or writes NO project/editorial files. It never publishes JSON, builds routes, authorizes release, injects site HTML, changes `.eleventy.js`, updates `indexability42`, modifies Stage 43 audit or enables Telegram links. It does not accept source snapshot bytes, private notes, personal records, secrets, affiliate URLs or reviewer credentials as approved output. No provenance or version status can be inferred solely from a matching hash.

## Acceptance

```powershell
npm run test:pending-review-integrity
npm run test:release-preflight
npm run verify:integration
```

Tests use synthetic-only data and check 24 negative manifest/payload cases plus invalid/cyclic JSON, hashing stability and unchanged no-publication flags.

## Remaining before any trusted actual release

1. An independently controlled human release decision authority and signed or otherwise authenticated reviewer identity are REQUIRED. Neither the manifest nor the preflight can self-certify.
2. Compute hashes from *actual canonical source files* (global facts, approved localized copy, claim/provenance records, rights and revision metadata), not caller-provided claimed hash values. Keep private source snapshots outside Git.
3. Apply per-field source verification, rights/freshness, locale/market rules, reviewed relations and independent commercial/Telegram decisions.
4. Only an audited, revocable approved release can supply **both** HTML indexability and a sanitized read-only public catalogue. At present `sitemapEntries=0` is correct.
5. Ensure revoked, revised or stale releases cannot remain in client caches. Production and Telegram remain disabled.

**No actual SEO Platform v1.0 publication or Content Intelligence Studio/Telegram Bot application is enabled by this checkpoint.**
