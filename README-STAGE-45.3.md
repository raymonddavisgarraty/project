# Stage 45.3 — Homepage image delivery (performance checkpoint)

**Status:** draft, nonpublishing. Based on Stage 45.2; not a Core Web Vitals pass or a production release.

## Issue and correction

The homepage data referenced `/assets/images/banner-1.webp` and `/assets/images/banner-2.webp`, but the assets live under `/assets/images/banners/`. This prevented their delivery despite successful Eleventy builds.

Both the first and second hero banners, and both sidebar widgets, now use the correct paths. The existing smaller AVIF files are offered using `<picture><source type="image/avif">`, with WebP `<img>` fallback. No new dependencies, content claims, tracking, or source approvals.

- First banner: `loading="eager"` and `fetchpriority="high"` (potential LCP image).
- Hidden second banner and sidebar widgets: `loading="lazy"`, `decoding="async"`.
- Existing `alt`, dimensions, links, and Stage 45.2 motion safeguards are preserved.
- No private editorial content or new publication/indexability is exposed.

## Measured repository asset sizes

| Asset | WebP | AVIF | Reduction in file bytes |
|---|---:|---:|---:|
| banner-1 | 71,434 B | 33,691 B | ~53% |
| banner-2 | 42,186 B | 14,738 B | ~65% |

These are source file sizes, **not Core Web Vitals results**. Browser decoding support, caching and network waterfall determine actual impact. Widgets reuse the same banner URLs and can benefit from caching.

## Acceptance (VS Code terminal)

```powershell
npm run build
npm run test:stage453
npm run test:stage452
npm run test:stage451
npm run check:seo
npm run check:navigation
npm run check:display
```

Visually inspect `http://localhost:8080/en/` with DevTools > Network, cache disabled: confirm banners render on mobile and desktop, AVIF is selected where supported, and a WebP fallback exists. Capture a controlled mobile Lighthouse trace separately before claiming LCP, CLS or INP improvements.

## Not addressed here

The main stylesheet still imports many separate CSS files. Measure the critical-path waterfall before changing CSS delivery. The five high-severity `npm audit` warnings reported on the user's Windows install also require separate dependency triage; avoid indiscriminate `npm audit fix`. Stage 43 editorial and Stage 42.2 noindex gates remain unchanged.
