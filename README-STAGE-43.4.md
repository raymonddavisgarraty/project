# Stage 43.4 — First-party source reconciliation pilot: Sweet Bonanza (original)

**Status:** research checkpoint in Draft PR; not an original published review, not a validated source snapshot and not an editorial release approval. **No source facts, provenance, authors, ratings, CTAs, existing importer or indexation permissions are modified.**

## 1. Context and outcome

Owner's 2 November 2026 PowerShell report confirmed Stage 42.3 and the LF/CRLF SHA-256 fixture repair: integration tests, entity graph, Eleventy, SEO and navigation pass. The Stage 43 audit still reports **55 unverified claims, 66 blockers, zero approved and productionReleaseAllowed=false**. The next meaningful deliverable is *source evaluation*, not removing this gate.

The existing 43.1 research queue already noted a Sweet Bonanza max-win discrepancy (21,100× internal vs 21,175× manufacturer announcement). This Stage 43.4 review extends that research to a third-party-hosted copy of purported rules with **conflicting RTP and volatility descriptions**. It does NOT adjudicate which version is authoritative.

## 2. Research sources, checked 2026-11-02

| ID | Source | Evidence lead | Limitations |
|---|---|---|---|
| pragmatic-2019-launch | [Pragmatic Play official 25 June 2019 announcement](https://www.pragmaticplay.com/en/news/pragmatic-play-launches-sweet-bonanza/) | Developer, 6×5 tumbling game, year of announcement, high-volatility description, reported max up to 21,175× | Press release, not the authenticated game math sheet or operator RTP configuration |
| pragmatic-game-page | [Pragmatic Play official game overview](https://www.pragmaticplay.com/en/games/sweet-bonanza-slot/) | 8–12+ matching symbols anywhere, scatters, ten free spins, multipliers | Does not establish an exact RTP or source-version cryptographic hash |
| mirrored-rules-pdf | [Third-party-hosted copy of apparent Sweet Bonanza rules](https://yesplay.bet/assets/documents/pragmatic-play-Sweet-Bonanza-rules.pdf), PDF page 2 | Text labels theoretical RTP 96.51%, minimum RTP 96.48%, medium-volatility explanatory text | **UNAUTHENTICATED mirror**; original publisher's document version, operator configuration, jurisdiction, integrity and reuse rights have NOT been verified |

The word "Pragmatic" in the third-party filename does **not** mean the PDF has been authenticated by the manufacturer. It is research context only. Do not import it as \`sourceType: official\` in Stage 43.

## 3. Reconciliation of TEN legacy facts

| Field | Current source data | Observations | Automated research status |
|---|---|---|---|
| providerId | pragmatic-play | Internal provider registry key, not a first-party identifier | needs-source |
| providerName | Pragmatic Play | Publisher identifies its game in the 2019 announcement | matching-research-lead |
| rtp | 96.48 | Unauthenticated PDF distinguishes *theoretical* 96.51 and *minimum* 96.48 | configuration-ambiguous |
| volatility | high | Manufacturer announcement: high; unauthenticated PDF: medium | conflicting-research-leads |
| reels | 6 | 2019 announcement: 6×5 | matching-research-lead |
| paylines | null | Neither source proves a fixed number; pay-anywhere is a separate mechanism | needs-source |
| paylineType | pays-anywhere | Official game page describes matching anywhere; mapping is internal | matching-research-lead |
| releaseYear | 2019 | Manufacturer announced original game 25 June 2019 | matching-research-lead |
| maxWinMultiplier | **21100** | Manufacturer launch says **21175** | candidate-discrepancy |
| hitFrequency | medium | No authoritative numerical hit-frequency methodology found | needs-source |

These statuses are **NOT** \`verified\`. We cannot conclude that 96.48 is the universal/default RTP, that the unverified PDF describes exactly the 2019 edition, or that a 21,175× maximum applies to every operator and play configuration. The record must remain legacy-unverified.

## 4. What changed

- \`research/evidence-pilots/sweet-bonanza-original-434.json\`: explicit source URLs, source categories, observed dates, revision-unspecified status, *unapproved* observations and unanswered reviewer questions. No source snapshot bytes or fabricated hashes.
- \`src/lib/evidence-pilot434.mjs\`: pure in-memory research comparison with the exact current fact baseline and existing Stage 43 provenance. Distinguishes candidate matches, discrepancies, conflicts, configurations and missing evidence.
- \`scripts/check-stage434.mjs\`: read-only CLI; prints field findings and refuses stale/rewritten baselines, altered source URLs, injected approvals or research misclassification.
- \`scripts/test-stage434.mjs\`: full coverage of the 10 current fields, 26 negative scenarios, source identity and approval-injection resistance, audit/unchanged-data assertions.
- \`docs/editorial434-sweet-bonanza-brief.md\`: source-aware original writing brief and human decision checklist.

No new static URLs, imported Studio components, Bot or publisher-exposed data source.

## 5. Commands (PowerShell, from repository root)

    git status --short
    git fetch origin
    git switch stage-43-4-source-first-sweet-bonanza-pilot

    npm run test:stage434
    npm run check:evidence-pilot
    npm run test:stage431
    npm run test:stage432
    npm run test:stage433
    npm run test:stage43
    npm run test:integration-contract
    npm run check:entities

    npm run build
    npm run check:seo
    npm run check:display
    npm run check:navigation
    npm run check:catalogue
    npm run check:review-pages
    npm run audit:editorial

Expected new report: **3 source leads**, **10 fact fields**, **4 candidate matches, 1 discrepancy, 1 conflict, 1 configuration ambiguity, 3 missing-source cases**; \`editorialApproved=false\`, \`publicationApproved=false\`, \`autoPublish=false\`, and \`publicExportApproved=false\`. These are **research-only** counters, not real verified claims.

Stage 43's live audit should continue to show 55 unverified claims and 66 blockers. Strict \`npm run check:editorial\` and production build must still fail. Do not invent approval records to make them green.

## 6. Next human research and editorial actions

1. Acquire **official publisher-distributed original rules/maths** with exact version, configuration and date, not just a mirrored PDF. Preserve genuinely obtained source bytes and recorded SHA-256 privately according to rights.
2. Resolve the reported **21,100× versus 21,175×** caps, including stake basis, version and regulatory variants.
3. Verify the cause of **high versus medium** volatility descriptions; do not normalize them as identical.
4. Verify actual selectable/default RTP settings and whether **96.48% is merely a minimum** for a rules revision.
5. Independently map the stable provider ID and review unsupported hit-frequency; leave null/withheld until verified.
6. Review *original* localized overview, title, FAQs, game mechanics and responsible-gambling copy. Do not copy the publisher's or competitor's prose into a first-party review.
7. Identify a real human editor, confirm rights, bind each claim to valid source/revision and review decision. Existing \`src/content/provenance/games/sweet-bonanza.json\` must not be changed by a research lead alone.
8. Keep the author/rating methodology and final global publication/indexing gates separate. Do not enable the final review for a technically valid dossier.

This does not complete Stage 43. Further human evidence and content review are necessary before an actual approved-content pilot or Stage 44–45 published-catalogue export can proceed.
