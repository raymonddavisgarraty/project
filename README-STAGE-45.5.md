# Stage 45.5 — Lighthouse analysis and logo accessible name

**Status:** draft, nonpublishing. Based on Stage 45.4. Lighthouse 13.5.0 on Nov 5, 2026.

Both uploaded Lighthouse JSON reports target **http://localhost:8080/en/games/**, not the homepage.

| Category / lab metric | Mobile | Desktop |
|---|---:|---:|
| Performance | 100 | 100 |
| Accessibility | 100 | 100 |
| Best Practices | 96 | 96 |
| SEO | 66 | 66 |
| FCP | 1.4 s | 0.3 s |
| LCP | 1.5 s | 0.4 s |
| CLS | 0 | 0 |
| TBT | 0 ms | 0 ms |

**Do not mistake local synthetic scores for real-user Core Web Vitals.**

## Findings and decisions

1. Lighthouse reported roughly 793 KiB unused JavaScript, but all four entries in that audit were `chrome-extension://` resources, not site JavaScript. Among them is VeePN. Do **not** rewrite site JS on that basis.
2. The Eleventy `/.11ty/reload-client.js` and lack of production cache headers are development environment effects, not evidence of deployed-site performance.
3. Lighthouse found roughly 60–61 KiB unused CSS in the single 73,439-byte CSS bundle on **/en/games/**. This is route-specific and worth tracking as the website grows, but the current lab Performance score is already 100. Reassess CSS splitting on controlled cross-route tests; no broad CSS refactor in this patch.
4. The Best Practices deduction is an `inspector-issues` report of a **Content security policy** issue. The reports do not identify its origin. Recheck using a clean Chrome Guest profile without extensions before attributing it to site code.
5. SEO 66 is predominantly the intentionally blocked indexability of unapproved editorial content (`noindex` and current robots policy). Do **not** bypass release gates for a better score.
6. The experimental Lighthouse audit `label-content-name-mismatch` identifies the logo link. Its visible brand text was overridden by `aria-label="{{ site.name }} home"`; the decorative `R` monogram is now `aria-hidden="true"`, and the native link derives its accessible name from the visible brand. Visual styling and linking are unchanged.

## Acceptance in VS Code

```powershell
npm run build
npm run test:stage455
npm run test:stage454
npm run test:stage453
npm run test:stage452
npm run check:seo
npm run check:display
```

Retest **/en/games/** in a Chrome **Guest profile** with extensions disabled, inspect the logo's computed accessible name and CSP issues in DevTools. Also measure **/en/**, **/en/casinos/** and one detail page in matching conditions. Do not claim accessibility compliance from this one fix or from 100-point lab score.

No content approvals, release/indexability decisions, private editorial data, commercial links, analytics or Content Intelligence Studio changes.
