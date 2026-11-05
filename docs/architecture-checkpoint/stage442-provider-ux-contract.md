# Stage 44.2 — UX implementation and provider design contract

## Catalogues / responsive constraints

Both EN catalogues use the same layout breakpoints for control panels:
- Under 620px: one column, controls and disabled facet messages stack.
- 620–899px: two filter columns.
- 900px and wider: four start-aligned controls across the row. Disabled-facet explanations expand *below* the select without pushing neighboring fields down.
- Action rows align labels and counters vertically. Games use their own counter row under 620px to avoid two-button overflow. Casinos can keep Reset + counter together when space permits.
- Search/count reset state remains accessible before and after JavaScript initialization; no JS only affects live filtering.
- Cards: games have an additional narrow-phone breakpoint; casino cards max two columns for readability.

Controls with no source-reviewed values MUST be disabled and accompanied by short explanations. Do not allow UX filters to imply that a casino has crypto payments, fast withdrawals or a known editor score when those fields remain unverified.

## Shared catalogue controller contract

The shared controller accepts page-specific selectors and the only approved data keys. It does not write original facts or call any remote API. Filtering uses already-rendered cards; sorting is Title A–Z only. State is saved as a query string for UI convenience. It does not generate SEO landings or update canonical/hreflang.

URL inputs are untrusted: allow only options actually present and enabled in the rendered select; ignore malicious/old rating, RTP and withdrawal flags. Source values remain controlled by the Stage 43.3 allowlist.

No client-side code should modify editorial evidence, publication state, ratings or offers.

## Offline provider profile contract

Prototype sections:
1. Heading and canonical entity identity (only after registry/primary-source review).
2. Original localized provider overview, its limits and source citations.
3. Source-verified Game→Provider relations mapped to actual EN game routes.
4. Claim-level evidence dates and review decisions.
5. Context-specific market/access restrictions, data corrections and revision history.

Fallback: show no fabricated facts, ratings, game counts or "top provider" claim. In the blueprint model each candidate has route:null, previewOnly:true, productionReleaseAllowed:false. The offline HTML file is a design reference, not a deployable page.

Future public provider profiles require explicit content release and jurisdiction clearance. Merely adding an ID to providers.json or matching a scraped game record is insufficient. If the project later uses this model for other verticals (e.g. software vendors), keep the separation between registry identity, evidence, editorial copy and release policy.

## Quality checks

test:stage442 exercises real current data, synthetic verified/unverified facets, a DOM-like test harness for both search controllers, invalid query parameters, no-results/reset and no-JS assumptions, and fail-closed provider design.

check:catalogue reads final Eleventy HTML and validates both live counters, correct script order, accessible controls, empty/unverified casino filters, and the continued absence of public provider routes.

Browser-based responsive visual QA remains necessary, particularly at 200% zoom.
