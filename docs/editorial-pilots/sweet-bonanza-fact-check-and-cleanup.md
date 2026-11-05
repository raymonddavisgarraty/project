# Sweet Bonanza pilot: primary-source reconciliation and content cleanup

Status: **editorial review**, not published or legally approved. The single-editor SEO Platform keeps its three-step Draft/Review/Published workflow, while Stage 43's factual and author checks remain in place.

## Checked manufacturer pages (5 November 2026)

- Pragmatic Play's 25 June 2019 announcement: https://www.pragmaticplay.com/en/news/pragmatic-play-launches-sweet-bonanza/ — describes the original Sweet Bonanza release, its 6×5 layout, tumbles, four or more scatters, and the producer's announcement of **up to 21,175×** potential maximum. Announcement date is not proof of every operator's rollout date or exact current rules edition.
- Pragmatic Play's original game page: https://www.pragmaticplay.com/en/games/sweet-bonanza-slot/ — describes 8–12+ matching symbols, 4–6 scatters and ten in-game free spins, plus multiplier values of 2×–100×. These are developer-published product descriptions, **not** a certified game maths file for an individual operator.

## Claims to withhold until edition-specific review

| Field | Historical project value | What is now supported | Publication treatment |
|---|---|---|---|
| Provider | Pragmatic Play | Publisher self-identification from official pages | May be described with attribution after editorial review |
| Grid/reels | 6 (6×5) | Producer 2019 announcement | May be described with attribution after review |
| Mechanics | Pays anywhere and tumbles | Publisher current product page | May be described with attribution after review |
| RTP | 96.48% | Not stated on the inspected producer product/announcement pages; other operator versions may differ | **Withhold precise number** |
| Maximum win | 21,100× | Producer announced up to 21,175×; source project disagrees | **Withhold universal multiplier**; check operator edition and stake basis |
| Volatility | High | 2019 marketing announcement says high; earlier unauthenticated rules lead conflicts | **Withhold definitive player-facing score** |
| Hit frequency | Medium | No reproducible authoritative basis | **Withhold** |
| Editorial rating | 4.7/5 | No approved rating methodology | **Removed from pilot copy** |
| Affiliate ID | pragplay | No market or channel permission | **Removed from pilot copy** |
| Similar-game claim | The Big Dog House | No editorial relation review | **Removed from pilot's curated links** |

## Code changes

- Keep raw historical JSON and Stage 43.4 research baseline unchanged; they are **not** verified facts. Changing them here would rewrite audit history without resolving the conflicting sources.
- Remove unsupported rating, affiliateId and pilot-related similar-game link from `src/content/locales/en/games/sweet-bonanza.js`. Other games and casinos are not modified.
- Add nullable-rating display guards in the full game template, hero, card and CTA panel so an information-only article need not invent a star rating. The full review is still blocked by Stage 43, and no publication state is changed.
- Adjust the real-fixture navigation/identity tests for the removed proposed relationship; retain independent synthetic navigation coverage.

## Editor release checklist (not automatic)

1. Confirm the original edition against developer rules / game help and record observation date.
2. Independently review each factual sentence and original English prose; do not reuse competitor article text.
3. Keep RTP/max win/volatility/hit frequency omitted until the appropriate game maths/configuration is verified.
4. Confirm source usage and market-specific information/legal restrictions before any live indexation.
5. When the content and associated release scope are reviewed, update the actual Stage 43 provenance and Stage 42 publication scope in a separate controlled release; do not fake approvals.

Until then: `Review` status, `noindex`, zero sitemap URLs, zero external Published Catalogue records. The optional `EDITORIAL_PREVIEW=1` mode is strictly for localhost and must not be deployed.

