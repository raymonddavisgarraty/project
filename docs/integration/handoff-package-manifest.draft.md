# Integration Handoff Package — future manifest (not yet implemented)

Delivery point: AFTER Stage 45 and final SEO Platform v1.0 release readiness check. Consumer: separate Stage 46 Content Intelligence Studio development chat/project.

This file is only a planning manifest. NO Studio package importer or export schema has been implemented by this checkpoint.

Required final artifacts:
1. Architecture, release configuration, published-route and locale/market rules.
2. Versioned schemas: Game, Provider, Casino, Article/Guide/Research, Source, Claim, EditorialReview, LocaleContent, RelatedEntity, PublicationDecision and CommercialOffer as applicable.
3. Export/import JSON contract with schema version, stable IDs vs localized slugs, field types, source URLs, observed timestamps, source snapshot hashes, conflicts, editorial brief, revision/approval handling and rejected-package diagnostics.
4. Exact field mapping into the existing src/content and data/editorial structures; current Stage 34–40 entrypoints, explicit Stage 38 publish, and Stage 43 independent evidence review.
5. Valid synthetic pending-review package and negative fixtures: duplicate IDs, missing provenance, source conflict, stale time-sensitive facts, invalid URL, wrong locale, unapproved rating and forbidden CTA.
6. Reproducible schema and read-only dry-run tests, no-live-write assertions, Stage 38–40 regression, and manual editorial approval path.
7. Allowed published internal relations, canonical/robots/sitemap/hreflang behavior, SEO release gates and rollback documentation.
8. Analytics event taxonomy and privacy constraints, performance and Search Console baselines, unresolved release blockers.
9. Studio development brief, interface versioning/migration rules, ownership matrix and known limitations.

Rule: Studio outputs are candidates. A passed quality check is not a human editorial approval; reviewed related-entity candidates are not live links; public files are never changed automatically.

Stage 42 interim checkpoint: docs/integration/studio-platform-contract-v1.md and its game-only JSON schema/test fixture are PROVISIONAL Platform-side interface definitions. They are not the final handoff, not direct Stage 34 intake, and need review after Stage 43–45 acceptance.
