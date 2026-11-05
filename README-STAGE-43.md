# Stage 43 — Editorial Quality & Provenance

Status: proposed PR stacked on Stage 42. Audit and production safety only; no automatic approvals or publishing.

## Confirmed evidence gaps

- Both existing games are legacy-unverified. Their ten existing provenance fields are all unverified with empty evidence.
- Existing English editorial copy contains numerical RTP assertions and ratings whose underlying primary sources and scoring methodology have not been approved.
- Casino data contain claims about identity, licences, bonuses, ratings, game counts, payment methods and withdrawals, without a previous field-level evidence register.
- The editorial-author record includes a numerical review count that has not been independently verified.

The absence of a source is not proof that the claim is false. No real-world facts have been independently checked by this Stage 43 patch.

## Delivered

- src/lib/editorial43.mjs: pure read-only claim audit, field matching, reviewer approval, conflict checks and conservative freshness rules.
- scripts/editorial43.mjs: repository audit with optional --json and --strict.
- scripts/editorial43-log.mjs: explicit create-only local research journal. It does NOT grant approval.
- src/content/provenance/casinos/*.json: unverified claim ledgers for the two current casino records.
- src/content/provenance/authors/review-team.json: pending checks for identity, bio and review count.
- src/content/policies/rating-methodology.json: pending, not approved.
- .eleventy.js: a production-only fail-closed gate; local Eleventy builds remain available.
- scripts/test-stage43.mjs and scripts/test-stage43-log.mjs, plus documentation.

No source facts, editorial ratings, Stage 38 hash checks, release statuses or commercial offers are silently changed.

## Windows PowerShell — expected positive checks

    npm run test:stage43
    npm run audit:editorial
    npm run check:games
    npm run check:provenance
    npm run check:locales
    node scripts/test-stage42.mjs
    npm run build
    npm run check:seo
    node scripts/test-stage412.mjs
    node scripts/importer/test-stage38.mjs
    node scripts/importer/test-stage39.mjs
    node scripts/importer/test-stage391.mjs
    node scripts/importer/test-stage40.mjs

## Expected intentional failure while claims remain unverified

    npm run check:editorial

The strict check above MUST fail for the current content. A production-mode Eleventy build MUST also fail until the evidence and substantive editorial decisions are documented. Do not falsify approval statuses or bypass the gate to make these tests pass.

## Optional local research journal

    node scripts/editorial43-log.mjs record --entity-type=game --entity-id=sweet-bonanza --reviewer-id=editor-id --action=source-researched --note="Documented source research; no approval granted"

This writes exclusively to data/editorial/review-log43/, which is gitignored; preserve backups if research history is important. The log never updates reviewed fact or publication files.

## Acceptance

- Tests and regular Eleventy build pass; Stage 42 SEO checks still pass.
- Audit reports outstanding evidence and editorial reviews rather than inventing verification.
- Changing a reviewed claim without corresponding evidence causes a strict validation failure.
- Unsupported ratings and missing methodology prevent production readiness.
- Explicit production build is fail closed for both Node environment indicators.
- Stage 38 explicit publish and Stage 39–40 editorial gates remain unchanged.

Only after real primary-source research and human approvals can the gate become green. Approval metadata is not itself real-world evidence. This initial Stage 43 auditor does not cryptographically bind entire review snapshots; see the workflow guide for the remaining integrity work.
