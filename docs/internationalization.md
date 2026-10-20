# Internationalization architecture — Stage 25

## Technical languages

- `en`: active, existing content under `/en/`
- `de`: planned, no public German pages yet
- `es`: planned, no public Spanish pages yet

`src/_data/locales.js` is the technical locale registry. `src/_data/markets.js` is a separate jurisdiction-review registry. A locale does not confer legal approval to publish gambling recommendations.

## Publication gates

Before enabling any new market, confirm: (1) local legal review for the exact content and business model, (2) keyword/intent research, (3) independently prepared localized content, (4) internal links only to published locale-specific URLs, (5) correct canonical/hreflang, and (6) editorial review.

## Hreflang contract

`layouts/base.njk` accepts an optional `alternatePages` array:

```yaml
alternatePages:
  - lang: en
    url: /en/games/example/
    published: true
  - lang: de
    url: /de/games/example/
    published: true
```

Only provide entries for **real, published, canonical** versions. Include self and all published alternates on **every** version to ensure reciprocal tags. Never synthesize `hreflang` from the configured language list. Use absolute canonical URLs via `site.url`, which **must be changed from `https://example.com` before production**. Do not enable `x-default` until a real neutral fallback page exists.

## Next implementation stage

Move shared technical facts to language-independent content records, keep editorial copy in locale-specific records, and implement locale-aware Eleventy pagination for **approved, populated** translations. Current game and casino templates remain English-only to avoid breaking existing pages.

## Important limitations

This stage adds the locale registry, jurisdiction gates and conditional head support only. It does not translate pages, authorize gambling promotion, create `/de/` or `/es/` routes, or add automated market research. Existing header/footer links intentionally remain English until localized routes exist.
