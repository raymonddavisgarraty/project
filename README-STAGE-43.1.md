# Stage 43.1 — Evidence remediation queue and Sweet Bonanza pilot

Status: separate draft PR stacked on Stage 43. **No facts, editorial ratings, SEO routes, publication statuses or approved provenance are changed.**

## Baseline

The most recent verified Stage 43 PowerShell audit reported 55 unverified claims and 66 blockers across two games, two casinos and one editorial author (29 October 2026). New queue totals are computed from the current Stage 43 audit on every run; 66 is not a fixed threshold.

Source research identified a **potential mismatch** for the original 2019 Sweet Bonanza: current repository maxWinMultiplier = 21100, while Pragmatic Play's 25 June 2019 release announcement says up to 21175 times the original bet. This is **not** an approved correction. The two first-party pages inspected did not establish the exact RTP of 96.48% for each operator configuration.

Official primary source leads:
- https://www.pragmaticplay.com/en/news/pragmatic-play-launches-sweet-bonanza/
- https://www.pragmaticplay.com/en/games/sweet-bonanza-slot/

Do not confuse the original game with Sweet Bonanza 1000, 2500 or POP.

## Files

- src/lib/editorial431.mjs: deterministic, immutable advisory queue from Stage 43's actual blockers; workstream, priority P0/P1/P2 and reviewer next action.
- scripts/run-stage431.mjs: print current queue or filter to a specific entity, export JSON or Markdown only via explicit create-only command.
- research/evidence-leads/sweet-bonanza-original.json: unapproved first-party source candidates and discrepancy; never imported into approved provenance.
- scripts/test-stage431.mjs: priority, scope, research lead separation, duplicate protection, exclusive exports and real-audit coverage tests.
- docs/editorial431-pilot-review.md: field-by-field reviewer worksheet.
- .gitignore: ignores only the new generated report folder, preserving existing local data/editorial content.

P0 includes high-impact game RTP/max-win/release/volatility, operator licensing and bonus terms, ratings/methodology, author identity and all editorial source/approval conflicts. P1/P2 prioritise less urgent facts. Priorities are suggestions, not truth scores.

## Commands for PowerShell (project root, development mode)

    npm run test:stage431
    npm run queue:editorial
    node scripts/run-stage431.mjs --entity=game:sweet-bonanza --markdown
    node scripts/run-stage431.mjs --json

To export an immutable local Markdown worksheet:

    node scripts/run-stage431.mjs --entity=game:sweet-bonanza --markdown --write=sweet-bonanza-pilot-2026-10-29.md

This writes to data/editorial/reports/stage431/ with exclusive create. An existing export is never overwritten. This directory is gitignored; back up your work if needed.

## Regression testing

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

The pre-existing strict editorial check MUST still exit nonzero while evidence gaps remain:

    npm run check:editorial

An explicit production build also remains blocked until genuine field-level evidence and human editorial decisions are entered. Do not bypass by setting approval flags.

## Human pilot workflow

1. Generate the scoped Sweet Bonanza report and inspect the source leads.
2. Review the original edition's official game rules, RTP/maths, operator configuration and applicable jurisdiction.
3. Investigate the 21100 versus 21175 maximum-win discrepancy with first-party rules, including stake-basis differences.
4. Check all facts and English SEO/FAQ text, ratings and hit-frequency assertions.
5. Write research notes with the existing Stage 43 journal (no approval is granted).
6. Submit factual corrections as separate reviewed commits, explicitly documenting source evidence and responsible human reviewer.
7. Rerun audit and release gates only after real verification.

## Acceptance

- New tests pass; queue count reconciles with the current Stage 43 blockers.
- Stable task IDs, no duplicate tasks, deterministic priorities, and scoped selection do not suppress global blockers.
- Research candidates are clearly unapproved; no RTP or conflicting max win is silently replaced.
- Local build + Stage 38–43 remain passing, strict editorial/production gates remain fail-closed.
- No changes to source facts, current page indexability, Stage 38 publishing or any commercial CTA approval.

This stage prepares an actionable remediation workflow. It does NOT complete factual validation or human approval.
