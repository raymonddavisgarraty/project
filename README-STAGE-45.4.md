# Stage 45.4 — Consolidate CSS delivery

**Draft; nonpublishing.** Stacked on Stage 45.3. No additional dependencies.

## Baseline and change

`src/assets/css/main.css` contained 43 relative CSS `@import` directives. These can lead to extra stylesheet fetches and prolong the browser's render-blocking dependency chain. All 46 CSS source files occupy about 76 KB raw. These numbers are an asset inventory, NOT Lighthouse or Core Web Vitals measurements.

Source modules remain editable independently. Eleventy `eleventy.after` generates `_site/assets/css/site-bundle.css` using the original import order. Public pages now link to this single bundle. The original `main.css` remains authoring input; both `<noscript>` fallback stylesheets remain in place. No new dependencies or edits to private editorial data, release gates, indexed URLs, or commercial content.

The minimal builder rejects circular imports, unsupported or remote imports, parent traversal, and relative CSS `url()` calls that would need rebasing. Do not edit the generated file. Future CSS syntaxes that the builder does not support will require extending its parser or switching to a maintained CSS build system.

## Validation

```powershell
npm run build
npm run test:stage454
npm run test:stage453
npm run test:stage452
npm run test:stage451
npm run test:editorial-workbench
npm run check:seo
npm run check:navigation
npm run check:display
```

Then launch `npm run dev` and inspect `/en/`, `/en/games/`, `/en/casinos/` in browser DevTools > Network with disabled cache. A JS-enabled page should fetch `site-bundle.css`, not the original 43 imports. Test desktop/mobile, light/dark and keyboard navigation. Check fallback styles with JavaScript disabled. Measure real Lighthouse metrics under matched conditions before claiming LCP/CLS/INP improvements.

The earlier `npm audit --omit=dev` outcome was 0 production dependency vulnerabilities; audit of development-only dependency advisories is tracked separately.
