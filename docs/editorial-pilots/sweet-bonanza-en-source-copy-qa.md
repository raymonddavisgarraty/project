# Sweet Bonanza original — live-source draft for editorial QA

Updated `src/content/locales/en/games/sweet-bonanza.js` with original English informational copy using first-party Pragmatic Play leads. The product module is now more careful about mechanics, official game edition, game-specific free-spins (not promotional offers) and the distinction between long-run theoretical RTP and a particular operator configuration.

Primary first-party research references:
- https://www.pragmaticplay.com/en/news/pragmatic-play-launches-sweet-bonanza/ — publisher's 25 June 2019 launch announcement, 6×5 grid/tumbling, four+ scatters and advertised 21,175× maximum.
- https://www.pragmaticplay.com/en/games/sweet-bonanza-slot/ — original game's product description (8–12+ matching symbols, ten free spins, bonus multipliers 2×–100×).

IMPORTANT: The manufacturer pages are first-party leads, but have NOT yet been accepted as edition-specific source snapshots for every claim or as legal publication authorization. The current legacy `src/content/games/sweet-bonanza.json` still contains unverified 96.48%, high volatility, 21,100× and hit frequency. These historical values were not rewritten or fabricated. Similarly, legacy rating and affiliate identifier remain in the module as unapproved internal data for compatibility and are not shown while Stage 43 release gate is false. Do not claim a fully fact-checked article yet.

The original information copy is in the source file, but **the current public/QA review page still intentionally displays the generic verification preview**. This module is rendered only after the existing Stage 43 full-review gate (which is still closed), and the publication workflow remains `review`. All routes stay `noindex`; sitemap and exported catalogues remain empty. Do not shortcut the gate just to see the copy in the browser.

## Verify

`npm run test:pilot-copy` checks the live source text and default-deny status. `npm run check:content-workflow` expects 3 draft and 1 review. `npm run verify:integration` must remain green. This PR does not modify any Nunjucks templates, production gates, raw facts, provenance records or private editorial files.

**Next editorial work:** inspect the actual original game rules/manual and market/rights applicability, resolve or omit all numerical disputes, review the draft prose and legacy rating/affiliates, and update the source-of-truth facts/provenance in a separately reviewed publication PR. Publication and public catalogue both remain disabled until then.
