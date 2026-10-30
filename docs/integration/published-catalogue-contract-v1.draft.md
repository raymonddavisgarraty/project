# RFC — Outbound Published Catalogue Contract v1 (DRAFT)

**Direction:** SEO Platform → approved public catalogue → public Eleventy HTML / future Telegram Bot / other read-only clients.  
**Different contract:** Studio → SEO Platform *inbound* pending candidate interface is described in docs/integration/studio-platform-contract-v1.md (PR #12). The two payloads must NEVER be interchangeable.  
**Status:** DRAFT SPECIFICATION only. Not generated, not a public feed, not an API and not approved data.

## 1. Authority, consumer and version model

Platform owns an immutable approved release projection (not raw source files). The consumer sees a versioned JSON snapshot with contractVersion=1, kind=seo-platform-published-catalogue, releaseId, generatedAt (UTC), locale, applicable access/market scope, entity arrays, revision and revocation metadata. Each entity has stable typed ID, a locale-scoped approved canonical URL, exact approved contentRevision and publication decision.

A future export should be atomically generated from *the same approved projection* that Eleventy uses for HTML. Website and Bot may cache/distribute it but not edit its content. Unknown version, missing validation, altered hash, revoked release or insufficient market permissions → fail closed.

No output path is committed now. A versioned JSON file is preferred over a Bot-dependent runtime API. Output splitting by locale/market and cache strategies must be reviewed before Stage 44–45 implementation.

## 2. Proposed common fields (not current implemented schema)

| Field | Rule |
|---|---|
| contractVersion, kind, releaseId | Exact protocol/release identity; never infer approval from the payload alone |
| generatedAt, contentRevision | Deterministic released snapshot time and revision; not a fabricated review timestamp |
| id, type | Immutable ID and entity kind: game/provider/casino/article/category/offer |
| locale | Only explicitly approved localized content; EN currently active |
| canonicalUrl | Actual approved public same-locale route; never guess from slug |
| publicationStatus, publishedAt, updatedAt | True published/approved revision, recorded dates, never import timestamps |
| title, summary | Independently approved original localized copy |
| facts | Field-level approved allowlist; unknown stays null or absent |
| availability | Explicit legally permitted public information scope and market eligibility |
| relationships | Reviewed relation types + stable target IDs and eligible public target URLs |

### Type-specific projections (future)
- Game: source-reviewed providerId, RTP, volatility, reels, normalized featureIds/themeIds when verified.
- Provider: verified company identity and published game IDs, not mere registry identities.
- Casino: source-reviewed operator/regulatory claims and reviewed relationships.
- Article: approved category/topic IDs, original summary and real canonical.
- Category: reviewed published hub members, not arbitrary SEO taxonomy combinations.
- Offer: governed by an independent commercial/channel permission record (see below).
- Source: internal identity stays private; only independently approved *public* citation metadata may be included.

Stable IDs must not be changed on title/slug updates. Canonical URL history/redirects are owned by SEO Platform. A versioned replacement must not leave stale entities active in Bot caches.

## 3. Mandatory export gate

For each record, export only if ALL conditions pass:
1. The exact entity + locale + revision has explicit human editorial/publication approval.
2. All exported factual fields have approved matching evidence, freshness and publication rights.
3. Actual target HTML canonical URL is generated and eligible for public indexing/availability in the relevant scope. Note: current publishedRoutes is only a *development build route manifest*, NOT an approval registry.
4. Relationships refer to already eligible entities by stable ID; same locale/market; no self links, missing routes or duplicates.
5. Content and jurisdiction access policy authorize the audience; locale language does not identify user country.
6. Sanitization by explicit allowlist excludes raw source snapshots, internal notes, imported briefs, scripts, API keys, reviewer identities, unapproved links and PII.
7. The complete snapshot/manifest passes integrity and failed-release rollback tests.

With current Stage 43 audit (55 unverified claims / 66 blockers), no entity should be falsely marked published. Building an empty *test fixture* does not authorize deploying an empty public feed.

## 4. Commercial offers and Telegram channel

The default PUBLIC-INFO feed must not automatically carry affiliate destinations or bonus terms. An offer appears only when a separate exact revision-bound decision proves: partner/target identity, verified terms and wagering data, effective/expiry window, rights, allowed market(s), explicit channel web and/or telegram, age/legal/advertising restrictions, reviewer, approved link and required disclosures.

Bot and website use the same Platform-owned permission policy. No client may create commercial links from raw affiliateId fields or assume that web approval also covers Telegram. When market or channel is unknown, the commercial projection is empty.

Public information and commercial offers should be independently revocable. Do not publish private approval logs in the public JSON.

## 5. Schema shape example — INERT EMPTY EXAMPLE, NOT GENERATED

    {
      "contractVersion": 1,
      "kind": "seo-platform-published-catalogue",
      "releaseId": "illustrative-shape-only",
      "generatedAt": "2026-10-30T00:00:00Z",
      "locale": "en",
      "scope": {
        "channel": "public-info",
        "marketCodes": []
      },
      "entities": {
        "games": [],
        "providers": [],
        "casinos": [],
        "articles": [],
        "categories": [],
        "offers": []
      },
      "tombstones": []
    }

This example is not a validated release; these arrays represent no published content. Real reviewed examples and machine-enforced JSON Schema belong to Stage 44–45, after editorial pilot and the required market/publication decisions.

## 6. Deep links and client responsibilities

- Future site → Bot links are opt-in, allowlisted HTTPS Telegram links, referencing a stable entity ID via an opaque validated payload. No Bot identity or token scheme is chosen now.
- Future Bot must validate entity exists, current release scope/locale, revocation and availability; then render only approved short fields. No private evidence and no independent fact authoring.
- Future Bot → site links must use approved canonicalUrl from the catalogue. Deleted or unavailable entities return an unavailable state, not a constructed ghost page.
- Bookmarks and subscriptions are Bot user state (separate private storage and retention policy), never a duplicate editable review database.
- Telegram user language, telephone locale or arbitrary location hints do not prove market eligibility. Under uncertainty suppress all offers.

## 7. Required later tests and handoff

Stage 42: ID/slug compatibility and draft schema review; retain existing inbound Studio package spec.  
Stage 43: field-level source/claim verification and revision approvals.  
Stage 44: approved pilot with true entity/relation checks, nonpublishing research-package validation and a **safe zero-export test under current unapproved state**; then one real approved publication fixture if permissions exist.  
Stage 45: deterministic export, privacy/no-secret scans, 404/canonical consistency, rejected unsupported locale/market, invalid relation, duplicate ID, stale/revoked/expired offers, integrity/hash, consumer compatibility, refresh/rollback and analytics monitoring.  
After Stage 45: publish the Integration Handoff Package, covering this outgoing contract as well as the separate inbound Studio contract. Studio app and Bot app remain separate projects.

**No exporter implementation, no new public URL, no new data model migration, and no Bot/Studio application is permitted by this checkpoint alone.**
