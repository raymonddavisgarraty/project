# Stage 44.3 — Review-preview component and data contract

## Inputs

In the unapproved branch of each game or casino template, set:
- previewType = game or casino
- previewName = current pagination entity directory name
- previewKindLabel = Game or Casino
- previewStateText = Editorial verification pending.
- previewFactsTitle = existing Stage 43.3 source-checked facts heading
- previewRows = allowed rows from editorialFields433
- previewSnapshot = read-only status from reviewPreview443
- previewCatalogUrl and previewCatalogText = known real EN catalogue link

The shared Nunjucks component must never inspect original game facts, raw casino claims, unapproved editorials, rating numbers, bonus/affiliate data or source URLs. Only previewRows may contain actual values, and those have already passed the Stage 43.3 claim-level visibility policy.

## Status projection

createReviewPreview443 consumes the full read-only Stage 43 audit, rejects invalid/automatic approval flags and duplicate entity claims, and returns:
- checkedClaims and claimCount for existing claim entries
- source-review coverage per predefined editorial section
- publicationApproved = false (always; release gate is elsewhere)
- editorialStatus = verification-pending

Category claim completion is not a page-level approval, operator recommendation, reliable rating or jurisdiction clearance. Do not use it to change deployment behaviour. The source-checklist descriptions are methodological guidance, not researched product content.

Game sections: publisher/release, rules/configuration, RTP/winning potential, editorial assessment.
Casino sections: operator/licensing, promotions/conditions, game selection, payments/withdrawals, editorial assessment.

## Accessibility and responsive layout

One H1 and accurate page-level breadcrumbs. Section anchors #verified-details, #review-checklist, #editorial-process. Native links without JS. Wide viewport shows sidebar next to content; mobile stacks vertically. All inputs/copy escape via Nunjucks, and CSS colors use existing site variables for light/dark. No fake source dates, testimonials or new commercial links.

## SEO and publication safety

The existing 7 EN content routes, canonical rules and dev sitemap are unchanged. The global Stage 43 production release gate remains strict. This design mode is for local QA and must not be deployed as thin indexable content until an independently reviewed page-level release policy is implemented.

## Tests

test:stage443 exercises mixed-status synthetic audit records, malformed/duplicate claims, safe projections, live audit state and preserved review branch guards.
check:review-pages verifies final built HTML, per-entity headings, review section anchors, checklist counts and pending-facts empty states.
Existing check:seo, check:display and check:navigation continue to verify canonical links, leaked raw facts and internal navigation.
