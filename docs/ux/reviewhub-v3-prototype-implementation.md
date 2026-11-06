# ReviewHub v3 — visual rollout from the Sweet Loot prototype

Status: development design PR. Not a content release.

## Visual system

- Shared 70px sticky header on Home, Games, Casinos and detail pages: left wordmark, right real HTML navigation, mobile menu, language indicator and persistent theme pill.
- Prototype dark/light colors, 16px body and 1.65 line height, 22px cards, 12px buttons and subdued blue tags.
- Game page: two-column hero, original cover area, numbered sections, sticky subnav, right-hand table of contents, game-info table, Demo information, screenshot slots, video slot, analysis, FAQ and developer links.
- Existing casino detail and pending-review pages receive the same hero, card and navigation geometry.
- Home and catalogues share the style and responsive layout.

## Catalogues and SEO

Games and Casinos are Eleventy-paginated at 12 cards per real HTML page. Later pages have durable /en/games/page/2/ and /en/casinos/page/2/ URLs, independent canonicals and crawlable previous/next/numbered anchor links. Generated page routes are not automatically indexable. Search of all game titles is an on-demand development name index, not the Published Catalogue: no bonus, rating, affiliate destination or private provenance. Search results render through textContent; more matches can be revealed by a button. Search failure falls back to the ordinary current-page search. The page 10+ route format has a synthetic test.

## Testing in isolated Windows checkout

git -c http.version=HTTP/1.1 -c http.sslBackend=schannel fetch origin feature/prototype-design-system-v3
git switch --detach FETCH_HEAD
npm run verify:integration
npm run test:local-editorial-preview
npm run test:stage42
npm run dev

To view the full redesigned local Sweet Bonanza article instead of the pending-verification shell, stop the server, set EDITORIAL_PREVIEW=1 in PowerShell, then run npm run dev and open http://localhost:8080/en/games/sweet-bonanza/. Clear the flag afterwards; never deploy a preview-enabled _site build.

## Boundaries

Unverified facts remain unapproved; sitemap remains empty. Screenshot and video slots are UI placeholders, not media uploads or licensed assets. The official game page link does not grant an embeddable game client. Actual game media and Demo launch support need a later reviewed media source and authorised provider integration. The user should review mobile and desktop appearance before merging.
