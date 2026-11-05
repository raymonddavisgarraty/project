# Checkpoint 02 — UX component contracts and adaptive wireframes

**Status:** unapproved design proposal. The three `prototypes/*.html` are visual DOM wireframes, not a new public framework or live pages.

## Three required prototypes

| Prototype | Primary user intent | Desktop | Mobile |
| --- | --- | --- | --- |
| Home | Find a real category or reviewed title | Intro/search, two active category entrances, limited editorial picks, trust/verification explanation | Single-column search and category cards, no overlays |
| Games catalogue | Find the relevant game and compare known facts | Text intro, native list of HTML links, filter/search controls as progressive enhancement, eventually pagination | Stacked controls, readable cards, no sideways clipping |
| Game detail | Assess facts, mechanics and limitations; navigate to a useful second review | Breadcrumbs, H1, evidence caveat, fact table, content TOC, sidebar, related | Sidebar moves after main article, compact facts table, no sticky obstruction |

All prototypes: explicit content limitations, keyboard-visible focus, semantic headings, no hero affiliate CTA, no fake rating or market approval. Desktop and mobile use **the same HTML** with responsive CSS. Content is illustrative but game titles and existing routes refer to real records.

## Component contracts for Stage 44

| Component | P | Inputs | Fallback | Accessibility and mobile | Event (future Stage 45) |
| --- | --- | --- | --- | --- | --- |
| Header/Nav | P0 | `publishedRouteManifest` | Home/Games/Casinos only | Native anchors, visible menu in no-JS mode, focusable links | `nav_click` |
| Breadcrumb | P0 | Approved parent chain | Real parent or omit missing level | `nav[aria-label=Breadcrumb]`, current non-link | `internal_link_click` |
| Search & filters | P0 | Rendered cards, verified categorical fields | Full SSR grid; results with JS disabled | Labels, reset, empty state, keyboard; narrow stacked inputs | `search_submit`, `filter_apply` |
| Fact table | P0 | Verified field/value + source status | “Not verified” / hide field; never `null` or 0 | Native `table`; mobile scroll if needed | optional `source_open` |
| Source/disclosure | P0 | Evidence/observed/reviewed date | “Verification pending” | Inline readable text/`details` | `source_open` |
| TOC | P1 | Real section IDs | Hide if too few sections | Real href fragments; sticky only when it doesn't cover content | `internal_link_click` |
| Related games | P1 | Resolver eligible IDs and URLs | Hide empty section | Native anchors, 1-column mobile, no random filler | `internal_link_click` block=related |
| More from provider | P1 | Stable `providerId` + eligible routes | Hide empty; no dead profile link | Native anchors, no JS-only carousel | `internal_link_click` block=provider |
| Context guides | P1 | Approved articles/concept IDs | Omit until published | Normal in-flow links | `internal_link_click` block=guide |
| FAQ | P1 | Real user questions with checked answers | Hide | Native `details` and `summary` | `faq_expand` |
| Ratings | P1 **gated** | Documented methodology, evidence, approved editorial decision | Hide or use non-rated descriptive comparison | Explain calculation, never infer from import | `methodology_open` |
| Casino offers / demo | P1 **gated** | Stage 41.2 policy + legal/rights approval | No link (informational fallback) | No overlays or misleading buttons | `outbound_offer_click` (permission-gated) |
| Compare tray | P2 | 2–3 eligible game IDs | No component | Escape/focus restore only if modal opened by user | `compare_open` |
| Tooltips | P2 | Explanation + published guide link | Inline definition | Use text/details instead of hover-only | `definition_open` |

P0 = required before content scaling; P1 = piloted with approved content; P2 = defer until measured need.

## Nonfunctional acceptance targets (project QA, not Google ranking guarantees)

- CSS mobile-first, usable at **320 / 375 / 768 / 1280 px** and 200% zoom.
- Keyboard-only use for all links and controls; visible `:focus-visible`; no keyboard traps.
- Provide skip link, unique H1, semantic labels, accessible names, alt text for meaningful images.
- Honor `prefers-reduced-motion`; do not block main content with automatic interstitials.
- Preserve SSR-critical content and crawlable HTML anchors when JS is disabled.
- Track layout shifts, LCP, INP and CLS on real devices/production through Stage 45; avoid publishing arbitrary benchmark scores.
- No 404 links or invented page counts in templates. Navigation must be driven by actual built route inventory.
- Never fill missing structured facts with dummy ratings, bonuses or provider associations.
- Language is not geographic permission; no global gambling offers merely because `en` pages are public.

## Wireframe review checklist

- [ ] User understands what is and isn't verified.
- [ ] A clear route from home → catalogue → game → catalogue exists.
- [ ] No controls imply they work in prototypes; design-only filters are disabled.
- [ ] Game page remains usable without sidebar/JS.
- [ ] True related games use approved IDs and existing URLs.
- [ ] Prototype does not create source data or production pages.
- [ ] Product approves card density, hierarchy and sidebar position before Stage 44.

**Notes:** Provider profile should be the fourth wireframe after these three, per the user's latest directive (Blueprint had proposed a provider profile as one of the initial three). The responsive prototypes intentionally avoid implementing everything in the blueprint at once.
