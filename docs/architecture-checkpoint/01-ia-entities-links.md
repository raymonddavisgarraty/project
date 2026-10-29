# Checkpoint 01 — Site map, entity model, internal linking

**Status:** proposed architecture, not deployed. **Baseline:** repository `main` 8c7252f; Stage 41.2 PR tracked separately. Supersedes no existing schema.

## 1. Verified implementation inventory (29 October 2026)

Eleventy emits seven EN URLs based on `src/en/`:

| Existing route | Source |
| --- | --- |
| `/en/` | `src/en/index.njk` |
| `/en/games/` | `src/en/games/index.njk` |
| `/en/games/sweet-bonanza/` | `src/en/games/game.njk` |
| `/en/games/the-big-dog-house/` | `src/en/games/game.njk` |
| `/en/casinos/` | `src/en/casinos/index.njk` |
| `/en/casinos/royalspin-casino/` | `src/en/casinos/casino.njk` |
| `/en/casinos/luckynova-casino/` | `src/en/casinos/casino.njk` |

- Two global game records `src/content/games/*.json` have `sourceStatus: legacy-unverified`. They **are rendered publicly today**; that does not imply their RTP, release year, ratings, etc. are independently confirmed. Stage 43 must audit them.
- Game editorial files are `src/content/locales/en/games/*.js`; existing `relatedGames` strings identify game slugs, but no related-games panel currently consumes them. Global `providerId` is available; provider pages are not.
- `src/content/registries/providers.json` contains provider registry records. `verified:true` currently means registry identity matching, **not** that a public provider profile has a reviewed editorial text or a generated route.
- Casino source data in `src/_data/casinos.js` have licenses, bonuses, ratings, payment facts and affiliate IDs without per-claim review. Do not interpret their presence as verification.
- `src/_includes/components/game-rail/game-rail.njk` currently advertises Pragmatic Play but iterates every game (no provider filter): must be made truthful, not scaled as-is.
- Current catalogue search/sort is client-side enhancement with server-rendered cards; no HTML pagination at scale.
- The site links to planned /en/providers/, /en/articles/, /en/bonuses/ etc. in `main`. The separate Stage 41.2 PR removes many of these placeholders. Do not reintroduce them.
- Stage 38 alone provides **explicit** publication and immutable review/hash checks. Stage 39/40 quality/triage `ready` is not publication approval.

## 2. URL inventory and release gates

| Route pattern | State | Decision and gate |
| --- | --- | --- |
| `/en/` | Live build | Information hub; navigation only to generated routes |
| `/en/games/` | Live build | Index with SSR cards; paginated after catalogue threshold |
| `/en/games/{game-slug}/` | Live build | Exact published game slug, no empty generated pages |
| `/en/casinos/` | Live build | Existing content must pass Stage 43 evidence audit |
| `/en/casinos/{casino-slug}/` | Live build | Existing content; independent legal and editorial QA needed |
| `/en/providers/` | **Planned** | Publish only when at least one approved profile exists and listing has value |
| `/en/providers/{provider-slug}/` | **Planned** | Verified provider identity **plus** reviewed localized editorial and real games |
| `/en/articles/` | **Planned** | Only with approved guides/articles |
| `/en/articles/{article-slug}/` | **Planned** | Independent user intent, source-backed editorial text |
| `/en/compare/games/{comparison-slug}/` | **Planned** | Explicitly curated pair and evidence; generated slug is an opaque stored key, not split on `-vs-` |
| `/en/compare/casinos/{comparison-slug}/` | **Planned** | Approval for each comparison and market scope |
| `/en/bonuses/` | **On hold** | Product/legal/offer freshness approvals required |
| `/en/methodology/`, `/en/editorial-policy/` | **Planned** | Real documented policy and verifiable implementation |
| `/en/about/`, `/en/contact/` | **Planned** | Factual organization/contact content |
| `/en/authors/{verified-author-slug}/` | **Planned** | Real verified identity; not generated from placeholder author IDs |
| `/en/games/{curated-topic}/` | **Conditional** | Curated topic with separate search intent and unique body; reserve path names to prevent collision with game slugs |
| `/de/*`, `/es/*` | **Not approved** | Localized editorial + market/legal approval + generated route + reciprocal hreflang |

**Important URL rule:** avoid `/en/games/{provider-slug}/` because it collides with the existing `/en/games/{game-slug}/` namespace. Use `/en/providers/{provider-slug}/` for provider profiles. Curated game-category routes must use an explicit reserved slug registry and collision checks. Do not auto-publish every provider/theme/filter combination.

### Canonical and facets (Stage 42)

- For each published static page, generate one HTTPS absolute self-canonical based on verified `SITE_URL`.
- Catalogue `?provider=`, `?volatility=`, `?sort=` states are UX filtering, **not** new SEO landings. Canonical policy and crawl suppression to be implemented and tested in Stage 42, including special handling of facets vs independently curated topic pages.
- `/en/games/page/2/` and subsequent pagination URLs are **proposed only** after a threshold; each page must have distinct SSR entries and real `<a href>` next/previous routes. Never canonically collapse contentful pagination into page 1 by default.
- Only real, published and reciprocal locale alternates may enter hreflang. No empty translation shells.

## 3. Canonical entity model (incremental migration; not a forced rewrite)

| Entity | Stable key and present implementation | Proposed additions / constraints |
| --- | --- | --- |
| `Game` | `id`, `slug`, `providerId`, facts JSON; separate `locales/en/games/*.js` | `themeIds[]`, `featureIds[]` after evidence; optional `conceptIds[]`; status projection per locale, not guessed from file name |
| `Provider` | Registry `providers.json`: `id`, `name`, `aliases`, `verified` | Separate verified provider identity and locale-specific **editorial profile**; public URL only after approval |
| `Casino` | `src/_data/casinos.js`, `slug`, commercial and review fields | Introduce immutable `id`, claim-level source/evidence, localized editorial and jurisdiction fields in later migration; do not invent associations |
| `Article` | **Not implemented** | `id`, `slug`, `locale`, `intent`, `conceptIds[]`, `linkedEntityIds[]`, source/review metadata |
| `Category/Concept` | Theme/feature registries have stable IDs | Use concept registry IDs for internal classification; not every concept gets a public route |
| `Source/Claim` | `src/content/provenance/games/*.json`, Stage 34–38 reviews | Field/value, evidence URL + observation date, conflict state, reviewer decision, expiry if volatile |
| `EditorialContent` | EN game module with `seo`, `hero`, `sections`, `faq` | `entityId`, `locale`, `reviewStatus`, `reviewedAt`, author identity, source/claim bindings |
| `Comparison` | **Not implemented** | Explicit ordered entity pair ID, curated SEO slug and differential commentary; no programmatic combinatorial pages |
| `CommercialOffer` | Stage 41.2 proposed deny-by-default resolver | Separate approvals for entity, offer, market, jurisdiction and visible audience scope |

**Migration invariant:** `Game.id` is stable even if its locale-specific URL slug eventually changes. Today `id` often equals `slug`; don't assume permanent identity equivalence. Use an explicit `entityType + entityId + locale → approved URL` mapping after migration. Historical slugs require deliberate redirects rather than implicit alias pages.

The locale's content release status and a fact's verification status are **orthogonal**. A page can be technically generated while some legacy facts remain unverified. Stage 43 should prevent representing those as checked, without silently deleting pages.

## 4. Entity relationship graph

```text
Game   --developed_by--> Provider  (providerId, registry-confirmed)
Game   --curated_related_to--> Game (editorial ID/slug, no self)
Game   --explained_by--> Article   (approved concept/topic mapping)
Provider --has_game--> Game        (inverse of developed_by; target has real route)
Casino --offers_game--> Game       (ONLY verified availability assertion + territory/time)
Article --explains--> Game/Provider/Concept (editor-approved mapping)
Game/Casino --included_in--> Comparison (explicit selected pairs)
Category/Concept --tags--> Game/Article (registry IDs, evidence where relevant)
```

No `Casino offers Game` edge may be derived from mere provider membership, casino game count, scraped casino lists, or marketing descriptions. Absence of evidence means omit the edge.

## 5. Publication-aware link resolver contract

**Proposed input** (at build time, not Studio runtime):

```text
target = {
  type: 'game' | 'provider' | 'casino' | 'article' | 'comparison',
  id: stableEntityId,
  locale: 'en',
  released: true,
  editorialApproved: true,
  audiencePermitted: true,
  url: '/en/.../'
}
```

These are **logical projection fields**, not a declaration that the current JS schema has them. The resolver must build this projection only from approved, actual publish records and a generated route manifest. It must not accept external `published:true` claims as authority.

**Eligibility:** correct locale; approved and released editorial page; rights/territory display permission; generated unique canonical URL; destination not blocked or withdrawn. For existing legacy pages, label the reviewed/unverified facts accurately and avoid verified endorsements; Stage 43 will determine whether public pages should remain indexable.

Priority of link choice:
1. Direct breadcrumb and catalogue navigation to a real parent route.
2. Hand-curated editorial `relatedGames` IDs (max 6, deduplicated, no current game; only eligible targets).
3. More from provider: exact `providerId` match, max 6, exclude current game.
4. Related guides: matching approved `conceptIds`, max 4; do not invent links if articles do not exist.
5. Automated similar games **only after** taxonomy and relevance scoring are audited; overlap of verified mechanisms/theme/volatility and editorial override, max 6. No random fallback cards.
6. Casino associations only from separately verified evidence for the relevant audience.

Rules: deterministic ordering, no duplicate cards within a section, descriptive anchor text, native `<a href>` in Eleventy output, no links to stale aliases or pending candidates, no self-links, no orphan published detail pages, no fabricated CTA. If zero eligible candidates, omit the block; if one or two, show the genuine set instead of filling to 3–6.

### Example: currently available dataset

Two EN game pages are generated. Both share `providerId=pragmatic-play`; each editorial module names the other in `relatedGames`. Therefore a prototype **may display a related-game route** for the other title, but cannot display a clickable provider profile or published guide before those pages exist. Themes/features are absent from these two global facts: do not claim a verified thematic similarity score. Display a fact's verification caveat until Stage 43.

## 6. Validation and tests to introduce during Stage 42/44

1. The emitted route manifest contains unique canonical `(locale, route)` pairs; no slug collision between generated games and curated topics.
2. Every internal navigational `href` in built HTML resolves to a generated index route or known static asset; 404 count = 0.
3. Links to unpublished or withdrawn entities = 0; no unapproved `/de/`, `/es/`, provider, article or bonus routes.
4. Every emitted detail page has a parent listing path, accessible breadcrumb, and at least one inbound crawlable HTML link from an index/hub.
5. A game may not recommend itself; per-section links are unique; related targets must share locale and pass release eligibility.
6. More-from-provider only matches stable `providerId` (not similar provider name).
7. Casino→game edges require reviewed availability evidence, date and jurisdiction.
8. No inferred rating, RTP, or bonus display without appropriate provenance and review.
9. All published locale alternates must be real reciprocal URLs.
10. No auto-publishing through Studio, import or recommendation generation; Stage 38 manual approval/hash protections unchanged.

## 7. Open decisions (do not block this design proposal)

- Real production domain, brand, launch GEO and whether info-only or affiliate-first; all commercial gates stay closed pending approval.
- Whether existing casinos remain in the first release pending their substantial claim audit.
- Actual author identity, ratings methodology and standards for the terms “tested”, “best”, “trusted”.
- Keyword research and editorial choice of which provider pages or curated topics deserve indexable URLs.
- Per-page pagination threshold (proposed initial target: 24 SSR cards; benchmark on devices and crawl).
- Legal policy for jurisdiction-sensitive information visible on globally accessible EN pages.
- Whether each author profile is publicly verifiable before a link is shown.

## 8. Mapping to development stages

- **Stage 41.2 PR:** production URL and commercial gate; no new content types.
- **Checkpoint:** approve route naming, stable IDs, graph, resolver eligibility, 3 wireframes and MVP priority.
- **Stage 42:** generated URL manifest, canonical, sitemap/robots/404/broken-link checks, breadcrumb validation, crawlable pagination plan and facets policy.
- **Stage 43:** audit legacy game facts and casino claims, provenance and verified editorial ratings.
- **Stage 44:** limited content pilot and reusable Nunjucks cards/related blocks using approved entity relationships.
- **Stage 45:** privacy-reviewed analytics of search, filters and navigation; performance/a11y checks.
- **Stage 46:** separate Studio export with no publication authority.

References: user-supplied Master Development Brief v1 and Product/UX Blueprint v1, `docs/internationalization.md`, GitHub source inspection. See also https://developers.google.com/search/docs/crawling-indexing/links-crawlable and https://developers.google.com/crawling/docs/faceted-navigation.
