# ADR — Three products, one approved published catalogue

**Decision:** Accepted as architectural direction; implementation is deferred.  
**Checkpoint:** Stage 41.2 architectural supplement, 2026-10-30.  
**Sources:** Master Development Brief v1.0, Product UX/IA/Integration Blueprint v1.0, the user-approved three-product addendum.  
**Stage numbering:** Unchanged: 41.2 → 42 → 43 → 44 → 45; Studio MVP at Stage 46 in a separate conversation. Telegram Bot MVP is a separate later project, independent from Studio once the published catalogue is stable.

## 1. Architectural boundary and authority

    External research → Content Intelligence Studio [FUTURE, INTERNAL]
         → inbound VERSIONED research candidate (not approved)
         → SEO Platform (Eleventy + editorial Stage 34–40 / Stage 43)
         → independently reviewed, revision-bound publication
         → outbound VERSIONED, sanitized, approved catalogue [FUTURE]
         → public Eleventy site and independent Telegram Bot [FUTURE]

**SEO Platform is the source of truth for approved published information.**
- Studio collects sources, evidence snapshots, contradictions and content briefs, but can only PROPOSE facts and relationships. It never writes live content or approves an editorial publication.
- Editors own factual and rights verification, original localized text, rating methodology, claims, relationships, publication and market/channel decisions.
- SEO Platform owns release-bound publication filtering, safe public HTML/catalogue projections, canonical URLs, SEO, commercial eligibility and revocation. Eleventy remains static.
- Telegram Bot reads only the allowed, versioned public catalogue for game/casino search and brief cards. It cannot make new editorial or market approvals. A cache is permitted; a separate editable copy of all reviews is not.
- Other future verticals can reuse IDs, evidence/review machinery, SEO and components. Do not create a universal CMS, framework or migrate off Eleventy now.

## 2. Durable identity and relation rules

Target stable entity types: Game, Provider, Casino, Bonus/Offer, Article/Guide/Research, Category, Source, plus editorial/claim/revision support models.

| Decision | Rule |
|---|---|
| ID versus slug | Immutable typed ID; locale-specific slug/URL may change. All foreign keys and Bot deep links refer to IDs |
| Review revision | A claim and approval bind to the *exact* content/fact revision. New revision requires a new editorial decision |
| Game → Provider | Provider registry ID PLUS approved per-game providerId evidence |
| Game → Features / Themes | Normalized taxonomy IDs, displayed values require independent source review |
| Game → Similar Games | Explicit editorial relation and explainable criteria; no unverified similarity inference |
| Game → Related Articles | Explicit Article ID + published same-locale route, never a ghost article page |
| Casino → Game | Current casino availability independently verified for applicable market |
| Casino → Offer | Verified Offer ID with separate legal/channel/rights decision |
| Source → Claim | Preserve evidence privately; export only separately approved public source attributions |

Never create live links from Studio relatedEntityCandidates, fuzzy title matching, arbitrary slugs, unpublished entities or routes not allowed for the selected locale/scope. No self-links, duplicates or broken URLs.

**Existing gaps to migrate, not silently erase:** game editorial relatedGames uses some legacy slugs; casino entities rely on slug without consistently explicit immutable IDs; current publishedRoutes lists generated DEVELOPMENT pages, not independently approved public releases. The provider registry verified flag means registry identity, not independently verified game relationships. These are incompatible with treating current generated routes as a published public feed.

## 3. Strict export boundary

Export eligibility requires an explicit revision-bound publication decision, exact Stage 43 evidence/editorial audit, locale/market permissions, authorized public fields, valid canonical published URL and approved relationships to eligible targets. Neither build success, generated routes, sourceStatus nor a quality-score label grants release.

The catalogue must NEVER include: draft/rejected/conflicted claims; unreviewed facts, scores, promotions or affiliate URLs; private evidence snapshots; internal reviewer notes; research briefs; source credentials, API keys, session secrets or personal user analytics. Only explicitly approved source citations may be visible. An entity approval alone does not approve an offer.

The current audit has 55 unverified claims, 66 blockers and productionReleaseAllowed=false (last reported 2026-10-30). Therefore an actual approved published export cannot be claimed or enabled today.

## 4. Commercial policy across web and Telegram

Stage 41.2 currently denies commerce by default. Do not edit this gate at the checkpoint. Future approved CommercialOffer should contain immutable offerId/revision, partnerId, target entityId, terms/expiry/observedAt, marketCodes, web/telegram channel allowlist, age/legal and ad restrictions, rights/reviewer decisions, and controlled destinations.

**Affiliate URL presence never enables an offer.** Approval for web does not approve Telegram. EN language, Telegram user language or a guessed location never establish jurisdiction. If market/channel authorization is unknown, omit the promotional CTA or entire restricted item. Confirm platform policies, partner terms and applicable laws before activating gambling promotions.

## 5. Site-to-Bot and Bot-to-site navigation (deferred)

Website → Bot: optional user-initiated HTTPS Telegram deep link with an allowlisted Bot username and an opaque payload referencing stable entity ID, validated length and revocation. Never encode secrets, personal data, arbitrary URLs or affiliate overrides. The exact token shape and username are deliberately not chosen now.

Bot → website: canonical URL read from the *current approved catalogue*, not reconstructed from guessed slugs. Deleted/revoked content must return unavailable, not a stale affiliate target. Bookmarks/subscriptions are Bot-specific private user data with separate privacy and retention rules, not an editorial content copy.

## 6. Checkpoints, no roadmap change

| Existing stage | Integration-aware work |
|---|---|
| 41.2 | Record this ADR and existing deny-by-default commercial/production boundary; no Studio, Bot or catalogue exporter code |
| 42 | Approve entity IDs, valid URLs and TWO distinct contracts: inbound research candidate and outbound approved public snapshot |
| 43 | Independent factual/provenance/revision approvals and rights/freshness checks |
| 44 | Original reviewed content pilot, approved relations and a nonpublishing Studio-format package. Test first safe outbound projection when actual approved content exists |
| 45 | Monitoring, privacy, consumer compatibility, export integrity, revocation and final SEO Platform v1.0 acceptance |
| 46 | Studio MVP in a separate chat and application. Telegram Bot MVP separate once approved catalogue is stable; need not depend on Studio |

No Stage 41.2 UI template, generated route, production flag, importer Stage 38, affiliate decision or external application is changed by this ADR.

## 7. Deferred blocking decisions

Stable ID migration for Casino, Offer, Article and Category; approved publication manifest separate from generated routes; release/field-level revision binding; content + market rights; actual domain/hosting and bot details; catalogue URL and cache strategy; revocations/tombstones; channel-specific offer approvals; real source-reviewed pilot, Stage 45 privacy/analytics and final Integration Handoff Package.

**Acceptance:** documentation and dependency requirements only, never implicit live public release.
