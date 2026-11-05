# Stage 44.1 — Game navigation contracts

The initial graph is:

    /en/games/sweet-bonanza/ -> /en/games/the-big-dog-house/
    /en/games/the-big-dog-house/ -> /en/games/sweet-bonanza/

These are manually curated cross-navigation relationships, NOT source-confirmed similarity, endorsements or quality scores. Both pages are still under editorial verification.

## Target eligibility

1. Must be an existing Game with stable ID and slug in the same data used to generate page templates.
2. A matching publishedRoutes record of type game must exist, with route exactly /en/games/{slug}/.
3. A manual relation resolves to stable ID first or an unambiguous old slug. Never guess on an ambiguous ID/slug.
4. Self-links, duplicates, imports with no generated URL, unavailable locale routes and unrecognized targets are excluded.
5. At most six manually referenced destinations and six provider destinations per game.
6. Provider group is available only when the providerId claim for BOTH games has status verified and no reviewer/evidence blocker, and the stable source IDs agree. It does not mean a provider profile is approved.
7. Never infer casino game availability, provider pages, article routes, affiliate links, editorial ratings or verified similarity.

The resolver is based on actual game IDs and the generated URL manifest, not UI source-provided release flags.

## Component API

game-context.njk receives the current pagination game and gameNavigation44 global resolver. It outputs an optional H2, curated and provider lists as crawlable HTML anchors, a review-status notice and a link to the real game catalogue. It does not need JavaScript; hidden when no links. Responsive grid: 1 col small screens, 2 at >=640px, 3 at >=1000px. Focus visibility is explicit.

gameCatalog44 receives current games and Stage 43.3 reviewed field projections. It populates only allowed provider/volatility facets. When none exists, selectors are disabled and described; the title search is still usable. Filters are UX query parameters, not indexable landing routes.

## Editorial integrity and future design

Generated page does not imply approved content. Stage 43 production release remains globally blocked. A future approved provider profile requires a reviewed localized editorial and release mapping; one registry ID does not create an indexable page. Game references currently use legacy slugs; migrate to stable IDs before multilingual mass publishing. Stage 45 analytics may record internal_link_click events without reading personal user data until privacy design is approved.

No actual fact source, provenance document, rating methodology, commercial approval or Stage 38 publisher has been altered.
