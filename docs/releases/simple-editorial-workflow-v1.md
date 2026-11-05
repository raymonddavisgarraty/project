# Minimal content workflow — Draft → Review → Published (development preview)

SEO Platform is a single-editor information site, not an enterprise approval system. Experimental PR #27 with two Ed25519 reviewer signatures was closed without merging. G2–G2.3 remain internal diagnostics, not everyday paperwork.

## Simple status registry

`src/content/publication-state.en.json` has only type, id and status for existing EN games/casinos. All four are initially `draft`. Allowed statuses: `draft`, `review`, `published`, `archived`. Missing records default to draft; new imports never auto-publish.

Published status alone never grants public visibility. The pure `previewContentWorkflowV1` checks Stage 43 per-entity claim and author audit (not global unrelated draft blockers), the existing generated route and identity, publisher/source flag for games, independent SHA revision match, reviewedBy/reviewedAt and explicit global public-information rights. Only for a hypothetical published entry are additional decision fields required.

Strictly allowlisted preview fields: stable type/ID, EN path, title, short summary and revision. No ratings, casino bonuses, gambling offer terms, affiliate URLs, internal sources, private notes, unapproved relationships or Telegram links. Basic HTML tags in public text are rejected. The module returns `previewOnly:true`, `publicationApproved:false`, `indexabilityApproved:false`, `publicExportApproved:false` even in positive synthetic tests.

## Windows acceptance

    npm run test:content-workflow
    npm run check:content-workflow
    npm run verify:integration

20 synthetic negative cases + 3 unpublished states; real repository report must show four drafts and zero published candidates. The scripts do not write files, produce `_site` JSON or enable sitemap/indexing.

## Next actual product deliverables

Human editor verifies actual original copy and consequential source facts, authorship and information/market rights for one EN pilot (prefer a noncommercial game-information page). Then apply a controlled content revision and review state; publish HTML and a versioned, sanitized catalogue from the same approved set. Add rollback/revocation testing before Telegram consumes it. Commercial offers, bonuses and affiliate links remain separately disabled until their market/channel eligibility is established.

The legacy Stage 43 global production gate and Stage 42 indexability remain unchanged. This checkpoint is a safe PREVIEW, not a release.
