# G2.4 — Independent signed review attestations (offline, no publication)

G2.3 established exact local file fingerprints. A valid SHA-256 is not a human decision. This checkpoint establishes a read-only, detached Ed25519 attestation contract for two different authorized reviewers: editorial content and information-rights review.

- src/lib/independent-review-attestations-g2.mjs checks exact subject identity, EN route, proposed content and source revision SHA-256, signed reviewer identity, domain-separated Ed25519 signatures, reviewer role, authorization time window and revoked/disabled keys. A signature from another request, revision or role fails.
- The trusted public-key store must be supplied by separate secure application configuration. Never accept a trust anchor or reviewer authority inside a Studio/candidate package. No real keys are installed or authorized in this repository. Production key lifecycle, custody, revocation and audit log remain future reviewed work.
- Test keys are generated in memory using node:crypto.generateKeyPairSync, never checked into Git.
- Every result, even with two valid signatures, returns editorialApproved:false, rightsApproved:false, indexabilityApproved:false, publicationApproved:false, publicExportApproved:false and autoPublish:false. ok:true only means an offline review attestation verified. It does not prove evidence authenticity, source rights, jurisdiction eligibility, factual review completeness or a signed public release.
- The signature is calculated over the UTF-8 domain prefix SEO-PLATFORM:G2.4:REVIEW-ATTESTATION:V1 plus a newline and the G2.2 canonicalJsonG2(statement). This is a Node-specific canonicalization, not RFC 8785.

The new module is NOT wired to Eleventy, Stage 42 indexability, Stage 43 source audit, preflight route approval, Studio, Telegram, commercial offers or any public catalogue. No private data/editorial/ is read; no network calls or release writes occur.

## Windows verification

    npm run test:review-attestations
    npm run test:source-revision
    npm run check:source-revision
    npm run test:pending-review-integrity
    npm run test:release-preflight
    npm run verify:integration

The standalone equivalent implementation passed locally on Node 22.16.0 with 28 negative cases. Exact GitHub branch and its cross-import test require owner's Windows acceptance.

## Remaining authority gate

An independent release authority must bind real reviewer identity to independently verified claims/evidence, actual source files rather than self-reported hashes, approved content and rights, locale/market scope, revocation and rollback. Only an approved release projection may be used jointly for HTML indexability and the sanitized outbound Published Catalogue. This checkpoint cannot authorize either.
