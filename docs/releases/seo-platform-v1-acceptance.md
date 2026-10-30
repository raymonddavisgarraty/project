# SEO Platform v1.0 — Release Acceptance Plan

Checkpoint: 2026-10-30. This plan is subordinate to the user-owned Master Development Brief v1.0 and Product UX/IA/Studio Integration Blueprint v1.0 (both dated 2026-10-29). It does not claim production-readiness.

## Product contract

SEO Review Platform is a public, static Eleventy 3.x / Nunjucks / HTML5 / CSS / vanilla-JavaScript site. Content Intelligence Studio is a separate future internal application (Stage 46), not a runtime dependency. Only versioned, offline candidate packages may enter the existing editor/import pipeline, with no automatic approval or live publication.

## v1.0 completion criteria

1. Responsive working EN homepage, game/casino listing/detail views, real keyboard navigation, accessible light/dark theme, shared design tokens and non-JS primary navigation. Provider, article and guide entity models must have stable IDs; unpublished/empty pages must not be created solely for navigation.
2. Structured Game, Provider, Casino, Article/Guide/Research, Source, Claim, EditorialReview, LocaleContent and RelatedEntity models. Stable internal IDs are not URLs; translated slugs are separate.
3. Verified entity-graph crosslinks to real, eligible, same-locale published pages only. No guessed provider/casino relationships, self-links, duplicates or dead anchors.
4. Correct sitemap, canonical, robots, hreflang, metadata, schema.org, 404 and redirect policies. Pending drafts must not be exposed as public indexable content.
5. Claim-level evidence, snapshots, observed timestamps, recorded editorial review and irreversible provenance trail. Unknown values never become made-up numbers or implied approval.
6. Central deny-by-default commercial CTA policy for hero/sidebar/cards, plus market and audience permissions; no placeholder URL or commercial offer in production HTML.
7. A SMALL ORIGINAL CONTENT PILOT with search intent/brief, primary-source facts, revised editorial copy, human approval and useful internal links. UX placeholders are not this pilot.
8. Minimal privacy-reviewed analytics, reproducible search/filter/internal-link event tests, Search Console, link/crawl errors and baseline performance. Separate clicks from conversions.
9. A reviewed versioned Studio-to-Platform offline import/export contract and one NONPUBLISHING test package that passes validation, normalization and evidence checks without changing published records.
10. After Stage 45, an Integration Handoff Package (schemas, field mappings, workflow, example packages, rejected cases, automated tests and limits) suitable as the starting brief for an independent Stage 46 Studio development chat.

Technically ready to integrate is NOT a claim of public launch, legal permission, verified user claims or successful indexation.

## Three-product architecture addendum — 2026-10-30

SEO Platform remains the producer of approved public information; future Content Intelligence Studio is an independent research-only candidate producer, while a future independent Telegram Bot consumes a versioned sanitized PUBLISHED catalogue. Neither app is implemented inside the Eleventy repository.

Reference contracts are intentionally separate: docs/integration/studio-platform-contract-v1.md is an INBOUND pending-candidate (research) draft; docs/integration/published-catalogue-contract-v1.draft.md is an OUTBOUND approved-public-snapshot RFC, NOT implemented. The authority/identity/commercial decisions are recorded in docs/architecture-checkpoint/adr-three-product-published-catalogue.md.

No change to Stage 41–45 roadmap. Stage 44–45 must evaluate safe public catalogue export and field-level redaction, canonical/relation integrity, revocations, market/channel-approved offers and consumer compatibility, subject to actual editorial and production approvals. Studio MVP still begins only after Stage 45 handoff (Stage 46); the Telegram Bot can be a separate subsequent MVP once the approved catalogue is stable.

## Stage order and actual GitHub status

- Stage 34–40 baseline exists on main. Stage 38 explicit publish and review/hash/exclusive-create semantics are protected.
- Stage 41.2: implementation in draft PR #1, NOT merged. Production origin validation, placeholder checks and centrally gated CTA are present. Run acceptance, not a reimplementation.
- UX/IA checkpoint: separate draft PR #2 relative to main; reconcile deliberately with the stacked technical branches.
- Stage 42: draft PR #3. Validate exact crawlable routes, canonical, sitemap, 404, robots, non-JS links and indexing rules. An initial draft of the Platform-owned offline EN game package contract is documented at docs/integration/studio-platform-contract-v1.md, with read-only Stage 33/36 checks only. Stage 34 intake is NOT compatible with arbitrary source hosts without a separately reviewed adapter.
- Stage 43: draft PR #4, remediation #5, partial-claim display #6–#7. Last user-reported editorial audit had 55 unverified claims and 66 blockers. No production permission.
- Stage 44: UI and links in draft PRs #8–#10. Original approved pilot content and controlled package test remain open deliverables, not already complete.
- Stage 45: telemetry, consent/privacy design, monitoring, performance and v1.0 gate remain TODO.
- Stage 46: Studio MVP is OUT OF SCOPE in this repository and conversation until the post-45 handoff.

PR #3 through #10 form a stacked chain. The latest checkpoint branch is based on PR #10 so it will not rewrite earlier commits. Existing PR statuses still need review/merge in the correct order.

## Stage 41.2 current acceptance gate

- Production SITE_URL must be real HTTPS origin (no localhost/example/placeholder); missing domain fails closed.
- Absent/invalid TELEGRAM_URL hides the link; do not infer permission from optional social URL.
- Production commercial offers require explicit content, partner, global-audience and market approvals. EN is a locale, not a visitor jurisdiction.
- Every hero, sidebar and card uses central commercial policy. Global approvals currently false; no bypass through affiliate ID, query string or environment-only switch.
- A local dev build still works and all Stage 38–40, Stage 41.2, games, locales and provenance tests pass.
- Stage 42/43 strict checks are additive; do not bypass their production stop just because Stage 41.2 passes.

Unresolved decisions include actual domain/hosting, legal markets, whether release is information-only, approved evidence/ratings, pilot keyword clusters, privacy analytics and commercial policy. Unknown means no permission, not guessed defaults.

## Stage 42.2 indexability correction — draft for local acceptance

Stage 42.2 adds a **separate approved indexation allowlist**; generated development routes can no longer imply SEO publication. Currently zero approved public-information releases exist; the sitemap is intentionally empty and all local HTML content pages are marked noindex while remaining browsable. The SEO audit validates all generated links but only allowlisted sitemap URLs, and production now fails if no independently approved indexable route exists. See README-STAGE-42.2.md.

This does NOT mean source facts are now verified or that the future outgoing JSON catalogue exists. The Stage 43 audit remains blocked and external commercial permissions remain denied. A real release requires revision-bound human content approvals and separately confirmed legal/public-information scope.

## Contract timing / release gates

After Stage 42: agree a versioned OFFLINE data package interface including entity IDs, locale, source references, claim statuses, revisions/hash semantics, candidate links, validation errors and manual decisions. The Blueprint example is conceptual, not the currently supported importer CLI schema.

After Stage 43–44: send ONE synthetic or explicitly reviewed nonpublishing package through existing normalization, provenance and quality gates; assert no live write, approval, or commercial decision.

After Stage 45: run complete technical, editorial, SEO, UX, analytics, privacy and legal release checklist, document actual passing evidence, freeze contract and deliver Integration Handoff Package. Then and ONLY THEN begin Stage 46 in another chat.

Disallow unauthorized auto-publish, copied competitor review copy, fabricated test/rating claims, DE/ES pages without market and localized review, secret content in static assets, invented public provider routes and unreviewed affiliate CTAs.
