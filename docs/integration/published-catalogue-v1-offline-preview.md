# Published Catalogue v1 — minimal offline shape (NOT a public feed)

This is the first consumer-facing data *shape* for the future SEO Platform → Telegram Bot boundary. It is deliberately much smaller than the former review-approval architecture. It does not publish, export to `_site`, start a server, generate URLs from arbitrary slugs, or create bot offers.

## Today

`npm run check:published-catalogue` reads the actual Stage 42 `indexability42` allowlist, editorial status registry and current game/casino data. It should return **zero approved routes and zero catalogue candidates**, even though the Eleventy development build generates four detail-page routes. `npm run test:published-catalogue` checks an isolated synthetic one-game publication flow and negative cases. Neither grants a live authorization.

## Information-only v1 fields

Version, locale, generation time and a fixed `releaseId: not-released`, plus typed entity arrays. Each preview record has `type`, stable `id`, `locale`, `canonicalUrl`, `title`, `summary`, and exact `contentRevision`. All relationship arrays, providers, articles, categories and offers currently remain empty. No ratings, bonuses, casino conditions, affiliate URLs, internal provenance, reviewer identities, or private notes cross this boundary. The `marketCodes` array is empty: this is NOT evidence of country availability.

## Eligibility

Potential records must appear in the existing Stage 42 approved route projection **and** in a `published` workflow state with identical revision SHA-256 and information-rights flag. The site-origin for a candidate must be an explicit HTTPS origin. A revoked item is omitted and a minimal tombstone is generated in preview. Unknown or malformed input causes the entire candidate set to be withheld.

The output is always `kind: seo-platform-published-catalogue-v1-preview`, `previewOnly: true`, `publicationApproved: false`, `publicExportApproved: false`, regardless of a synthetic approved route. This makes it **impossible to mistake test data for an authorized public feed by following this module's flags**. No public file is written.

## Before a real v1 JSON becomes available

1. Complete an original EN content review and confirm edition-specific facts and applicable information/market rights. The historical Sweet Bonanza data remains unverified.
2. Resolve the current Stage 43 global release gate for a genuinely approved, scoped release without exposing unrelated Draft/Review items. Do not trust a status field alone.
3. Share the same approved release decisions with indexable HTML and the catalogue. Assign real release ID, market eligibility, revocation/rollback and a controlled HTTPS deployment. Only then introduce a public static JSON URL and Bot access.

The Bot must never read this offline rehearsal as a released catalogue. The existing Studio inbound pending-candidate schema is a different direction and remains separate.


## 2026-11-05 timestamp regression fix

Whole-second UTC timestamps (e.g. `2026-11-05T12:00:00Z`) are canonical in the contract; JavaScript's `Date#toISOString()` appends `.000Z`. The validator compares normalized whole-second UTC to prevent false rejection of valid records. Negative tests reject impossible days and millisecond-bearing strings. This change does not modify public-release permissions.
