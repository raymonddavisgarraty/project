# Studio to SEO Platform — Offline Candidate Contract v1 (Stage 42)

Status: DRAFT PLATFORM-SIDE CONTRACT, pending formal approval. No Content Intelligence Studio application is included. No live importer, auto-approval or production publish capability is enabled.

Governing documents: SEO Platform Master Development Brief v1.0 and Product UX / IA / Integration Blueprint v1.0, dated 29 October 2026.

## Direction clarification for the three-product ecosystem

This contract is for INBOUND, internal, pending editorial candidates only. It must never feed the public site or Telegram Bot directly. A separate OUTBOUND, publisher-owned approved catalogue is specified as a non-implemented RFC at docs/integration/published-catalogue-contract-v1.draft.md. Do not treat valid research data as a published snapshot or as a commercial rights decision.

## Boundaries

Studio (future Stage 46, separate product) may supply proposed facts, research evidence, a content brief, and relation candidates. The Platform must independently verify the package and then route it through human editorial validation. Quality checks, readiness labels, a valid JSON schema or a normalized provider ID do not mean approved, released or compliant. Published Eleventy pages never depend on Studio at runtime.

## Files and v1 scope

- schemas/integration/game-candidate.v1.schema.json: JSON Schema 2020-12 envelope. The separate runtime validator enforces additional cross-reference and value checks.
- scripts/integration/contract-v1.mjs: pure validation and read-only Stage 33-style preview mapping.
- scripts/integration/check-contract-v1.mjs: read-only CLI inspector, 256 KB maximum, using the actual Stage 33 qualityReport and Stage 36 propose36 plus verified registries.
- scripts/integration/test-contract-v1.mjs: positive, negative and existing-importer compatibility tests.
- tests/fixtures/integration/studio-game-candidate.pending.v1.json: fictional sample, sampleOnly=true, publicationApproved=false, autoPublish=false.
- tests/fixtures/integration/synthetic-source-snapshot.txt: fictional source bytes whose actual SHA-256 matches the sample's source metadata.

Version 1 accepts only single EN game research packages. Provider, Casino, Article, Guide and Research still require separately designed schema versions and explicit supported import adapters. No provider/article URLs are generated from a package.

## Envelope field mapping

| Field | Interpretation |
|---|---|
| contractVersion=1, kind | Exact protocol identification; unknown versions rejected |
| packageId, revision, createdAt | Stable import revision, timestamp and duplicate/collision identity; not public URL |
| entityType=game, entityId | Stable logical game ID, distinct from publicly approved slug |
| locale=en, status=pending-editorial-review | EN only; no publication decision |
| sampleOnly | Marks synthetic material; example.org is permitted only in test packages |
| publicationApproved=false, autoPublish=false | Mandatory. No input flags may grant permissions |
| proposedFacts | Title, providerId, releaseDate, RTP, volatility, maxWin, reels, paylines, themes, features; null represents unknown |
| sourceSnapshots | Unique source IDs, original HTTPS URL, observedAt UTC, SHA-256 metadata, source type and rightsStatus=pending-review |
| claims | Every nonempty proposed fact requires a field/value/source association, status unverified or conflicted only |
| editorialBrief | Intent and section candidates; not original or approved review copy |
| relatedEntityCandidates | Proposed Game-to-Game editorial links, not public relations or automatically rendered links |

The validator checks shape, source-ID uniqueness, claim/value consistency, source references, timestamps, numeric bounds, safe URLs and explicit denial of approval. It does NOT fetch or independently verify real sources, legal permissions, gameplay results, ratings or source snapshot bytes for arbitrary external input.

## Mapping to EXISTING pipeline — precise current compatibility

1. Platform-owned mapping yields an IN-MEMORY Stage 33 candidate-like structure with schemaVersion=2, status=pending-review, facts copied from proposedFacts, and source.url from the research package. It has autoPublish=false and stage34ImportCompatible=false.
2. Existing Stage 33 qualityReport can flag missing/invalid facts but its ready-for-editorial-review status is NOT an approval.
3. Existing Stage 36 propose36 can compare suggested provider identity and taxonomy to the verified registries. A matched registry ID is NOT proof of the actual game's producer.
4. CRITICAL: Stage 34 review34.loadCandidate currently hardcodes latestcasinobonuses.bet as the allowed host. A valid future Studio package may have another legitimate first-party source. The current host-specific loader MUST NOT be bypassed by substituting a fabricated LCB URL or blindly allowing every host.
5. A separately reviewed, Platform-side Stage 34 adapter is REQUIRED to preserve actual source host, exact bytes/hash, rights and claim binding, approval decisions and create-only semantics. This integration is NOT implemented in this stage.
6. The later existing Stage 35 staging, Stage 37 editorial review, Stage 38 explicit publisher and Stage 43 fact evidence checks remain distinct manual gates. No imported flag may stand in for these approvals.
7. Briefs and proposed related entities do not become public copy or links until separately reviewed and explicitly published. No affiliate or market permission is inferred.

## Verification

Run from the root of a local project checkout:

    npm run test:integration-contract
    npm run check:integration-contract
    npm run check:v1-boundaries
    node scripts/test-stage412.mjs
    node scripts/importer/test-stage38.mjs
    node scripts/importer/test-stage39.mjs
    node scripts/importer/test-stage391.mjs
    node scripts/importer/test-stage40.mjs
    npm run build
    npm run check:seo
    npm run check:display
    npm run audit:editorial

The sample report must indicate validated-proposal-only, stage34DirectImportCompatible=false, editorApproved=false, publicationApproved=false, stage38PublishingInvoked=false and autoPublish=false. Zero new routes or written files are expected. The schema is documentation, while the runtime cross-reference validator is the actual CLI enforcement for this checkpoint; independent JSON Schema engine validation can be added before final handoff.

## Next gate

After Stage 43/44: test one genuinely sourced, independently reviewed package through a purpose-built intake adapter, with no live write. Complete the original content pilot and human decisions. After Stage 45: freeze and deliver Integration Handoff Package, including this contract's migration plan, all supported entity types, failures, fixtures, analytics and privacy. Only then start Studio MVP in another chat.
