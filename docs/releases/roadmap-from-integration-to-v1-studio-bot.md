# SEO Platform v1.0 → Content Intelligence Studio → Telegram Bot

**Planning checkpoint:** 2026-11-05  
**Status:** DEVELOPMENT PLAN, not a release decision.  
**Canonical architecture:** [three-product ADR](../architecture-checkpoint/adr-three-product-published-catalogue.md), [outbound catalogue RFC](../integration/published-catalogue-contract-v1.draft.md), [v1.0 acceptance](seo-platform-v1-acceptance.md).

## Current verified position

- Integration PR #23 proposes all previous development changes from main through Stage 43.5, Editorial Workbench Stage 44.4 and Stage 45.1–45.5. Windows verified exact integrated runtime head `9af77e7` with `npm run verify:integration` (build and 16 additional checks, all green).
- Subsequent `d806e33` changed only `.gitignore`/integration docs: owner-private `data/editorial/` must not be tracked. These changes did not edit runtime logic. Integrated PR is still **draft** and **not merged to main**.
- Site generates 11 output templates; nine pages are checked by SEO validator. Sitemap currently holds **zero approved routes** and all preview pages are **noindex**.
- Existing Stage 43 audit still reports editorial blockers (66 tasks / 55 unverified claims at the last recorded audit). These are NOT approved content and need human source/rights review.
- `docs/integration/studio-platform-contract-v1.md` plus `scripts/integration/contract-v1.mjs` implement a **read-only, EN game candidate validation/preview**; there is NO general Studio intake adapter and NO live Studio.
- `docs/integration/published-catalogue-contract-v1.draft.md` is a **draft outbound specification**, not a public JSON exporter, API or Telegram feed. Generated `publishedRoutes` are development URLs, **not independently published approvals**.
- No tracked GitHub Actions workflows exist at this integration checkpoint. External hosting settings, policies and deployments were not audited.

## Six remaining acceptance gates before calling the Platform v1.0 technically complete

These are **outcome gates**, not an estimate of calendar time and not six arbitrary new architecture stages. Work may overlap, but a later gate cannot falsely grant approval to an earlier gate.

### G1. Baseline consolidation and code safety (currently in review)

- Review complete 169-file integration diff, production guards, secrets/private paths, dependency alerts, browser QA and any actual hosting/deployment integration.
- Accept a verified development baseline into `main` with explicit controlled merge process. Do not confuse merging code with publishing the site.
- Preserve private local `data/editorial/`; never reset/clean owner files, copy them into Git or deploy them.
- **Done when:** reviewed main is at a known version with a reproducible green integration suite and an explicit no-deployment status.

### G2. Stable identity + revision-bound publication authority

- Give Game / Casino / Provider / Article / Category and future Offer stable typed IDs distinct from localized slugs.
- Separate generated QA routes from independently approved, locale/market/revision-bound publish decisions, canonical URLs, allowed fields, and linked approved entities.
- **Critical design issue:** Stage 42 indexability currently depends on a **global** Stage 43 audit with `productionReleaseAllowed=true`. A single approved pilot cannot be published while unrelated unapproved preview claims trigger global blockers. Design and test an **approved release-scope projection** that excludes all pending material, without waiving any actual claim, rights or review check. Do not simply switch audit flags, loosen `indexability42` or remove previews from audit without a separately verified release manifest.
- **Done when:** negative tests prove unknown/revoked/changed revisions, mismatched locale, unreviewed relationships and unsafe market states cannot become indexable or exported.

### G3. One real original, human-reviewed EN content pilot

- Select a narrowly scoped game or information page, gather first-party/edition-specific sources, verify every displayed numerical or qualitative claim and preservation rights, create original editorial copy and explicit revision-bound human approval.
- Check legal/information availability for the intended audience; casino/bonus promotional permissions are separate and initially empty.
- Establish valid same-locale internal links only to independently eligible pages, or omit them if not approved.
- **Done when:** one genuinely approved revision exists, its evidence and decisions are auditable, and unrelated 66-task preview backlog cannot appear in release outputs. If original source evidence cannot be obtained lawfully, this gate remains open; **synthetic tests are not a substitute**.

### G4. One versioned, read-only published catalogue for website and future Bot

- Implement **Platform → public JSON snapshot v1**, separate from **Studio → pending research candidate**. Stable IDs, canonical approved URLs, locale/market scope, releaseId, revision hashes, generatedAt, allowlisted fields, approved relationships, revocations/tombstones, expiry and version semantics.
- Derive HTML indexation and catalogue from the **same approved release authority**. Reject unknown schemas, missing or stale review decisions, invalid audience scopes, private evidence, unreviewed facts, affiliate destinations and ghost links.
- Test empty/fail-closed current state, isolated **synthetic approved-release fixtures** (not a real publication), a genuine reviewed pilot when G3 is complete, deterministic export, consumer compatibility, integrity and revocation/rollback.
- Default information-only catalogue excludes all commercial offers. Future offer feed requires **separate explicit market + web/telegram channel approvals**; Telegram language is not a jurisdiction proof.
- **Done when:** a consumer can read one documented stable versioned public snapshot that shares exact approved publication decisions with static HTML, and test fixtures prove rejection cases.

### G5. Production, technical SEO and safe operations

- Configure actual HTTPS domain/host and CDN caching; test CSP, cache invalidation/revocation, 404/redirects, robots/sitemap/canonicals/hreflang, privacy-consented measurement, availability/uptime, error logs and backup/rollback.
- Run real browser measurements without extensions across homepage, game/casino catalogues and an approved detail page. Do not infer field CWV from localhost Lighthouse 99–100.
- Audit development dependencies; `npm audit --omit=dev` previously reported 0 production dependency advisories while local `npm ci` reported 5 high-severity dev-only advisories.
- Keep legal, audience and content release decisions separate from technical deploy readiness.
- **Done when:** reproducible controlled rollout and rollback, privacy/legal sign-off for selected audience, observability, and indexable pages only where separately approved.

### G6. Final acceptance + two-direction handoff

- Run complete technical, editorial, SEO, UX, privacy, security, locale and release checks against frozen schemas and commit hashes.
- Deliver integration handoff package: model and field mappings, inbound Studio candidate schema/fixtures/rejection cases, outbound published catalogue schema/fixtures/rejection cases, identities, revisions, approvals, canonical URLs, redaction/market policy, data refresh, revocation, and consumer test harness.
- Distinguish **Platform technically ready** from **public launch authorized**; no claim of public release if G3/G5 rights or deployment criteria remain unfulfilled.
- **Done when:** the owner has an accepted reproducible v1.0 handoff that a new chat/repository can use without reconstructing old decisions.

## After G6: two independent applications, two workstreams

**Stage 46 — Content Intelligence Studio** (new chat and separate repository): internal research intake, source capture/normalization, evidence and contradiction management, editorial briefs/queues and versioned **pending** candidate exports into Platform. Never modify live pages, approvals, commercial policy or publication directly. Editorial Workbench may inform Studio UI but remains private and read-only at this stage.

**Telegram Bot MVP** (separate chat and repository, no dependency on Studio finishing): consume **only** Platform's stable approved published catalogue. MVP: game search, filter by verified provider, related approved games, newest approved catalogue items, concise summaries and canonical site links. Offer/bonus/freespin and affiliate URLs remain disabled until independent expiry, terms, market, advertising and **Telegram channel** approvals exist. Revoked or absent records must not return stale links. The Bot is a reader, not a second editorial CMS.

**When to begin:** both can be planned once G4's contract is tested, but under the owner-agreed sequence implementation starts **after SEO Platform v1.0 (G6)**. Telegram requires a stable *nonempty approved* feed for a meaningful live launch; Studio can develop against synthetic pending-only contracts without live Bot content. No calendar date is implied; external editorial evidence and legal approvals determine the critical path.

## Immediate next action

Finish G1 review of PR #23; do not automatically merge it or change production publication flags. Then prioritize G2 release authority and G4 contract validation, while G3 real editorial source verification proceeds as human-controlled work. This prevents further UI-only stages delaying the Studio/Bot boundary.
