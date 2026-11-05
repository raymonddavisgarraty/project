# Stage 45.2 — Accessible catalogue fallback and motion-safe browsing

**Status:** Local patch against the previously provided Stage 45.1 + Stage 44.4 working copy. This is public-site UX hardening, **not** an editorial approval or production release.

## Scope

1. **No JavaScript:** Both Games and Casinos catalogues remain fully server-rendered and browseable. The JS-only search/filter panel is hidden via a `<noscript>` stylesheet; visitors receive an explicit explanation instead of nonfunctional search controls. The existing Stage 45.1 no-JS header remains unchanged.
2. **Homepage banners:** Automatic rotation pauses when the user requests reduced motion, tabs away from the page, hovers over the banner, or focuses its controls. Manual Previous/Next and pagination dots continue to work. If the user's motion preference changes while the page is open, the timer responds immediately.
3. **Game carousel:** Arrow scrolling changes from `smooth` to `auto` when reduced motion is requested.
4. **Accurate control label:** The Games button now says **Highlight a random game** instead of implying that it navigates to a random page.
5. **Editorial boundary:** No game facts, casino data, provenance, ratings, source approvals, publish gates, market settings, partner links, routes or Editorial Workbench functionality were altered.

## Files in the patch

- `package.json` — adds `test:stage452` only.
- `src/_includes/layouts/base.njk` — includes the additional no-JS stylesheet.
- `src/assets/css/components/no-js-catalogs.css` — CSS loaded only without JS.
- `src/en/games/index.njk` — fallback note and honest random-button text.
- `src/en/casinos/index.njk` — fallback note.
- `src/assets/js/components/home-banners.js` — motion-safe autoplay, manual navigation remains available.
- `src/assets/js/components/game-rail.js` — reduced-motion scrolling.
- `scripts/test-stage452.mjs` — regression test for no-JS markup and banner timing/interaction.

## Installation (VS Code on Windows)

Copy the ZIP contents into the repository root **preserving folder paths**; this updates only the listed files. Keep `data/editorial/`, `.git/`, your local ZIP backups, and the Workbench. If you previously edited any listed files yourself, compare before replacing.

In the VS Code terminal:

```powershell
npm run build
npm run test:stage451
npm run test:stage452
npm run check:seo
npm run check:navigation
npm run check:display
npm run check:catalogue
```

Then run `npm run dev` and open the local site at `/en/`, `/en/games/` and `/en/casinos/`.

### Manual visual QA

- In browser DevTools, disable JavaScript and reload Games/Casinos. All cards should remain visible; search/filter inputs should disappear; a note should explain this. Main navigation should still work.
- With JavaScript on, text search, reset and filters should work as before.
- Enable **Reduce motion** in OS/browser. Homepage banner must remain on its current slide until you press Next, Previous or a dot.
- Turn off Reduce motion: carousel may rotate every 5 seconds when the tab is visible and no pointer/focus is within it.
- Move focus onto a banner control with Tab, or switch to another tab. Autoplay must stop until focus leaves or the tab becomes visible.
- Games **Highlight a random game** should move focus to a visible game link; it does not navigate automatically.

## Validation performed on the local project copy

- Eleventy build: PASS (11 written outputs; 0 approved indexable sitemap routes).
- Stage 45.1 and Stage 45.2 tests: PASS.
- Stage 41.2, 42.3, 43, 43.4, 44.1, 44.2, 44.3 and Studio contract unit tests: PASS.
- `check:seo`, `check:navigation`, `check:display`, `check:catalogue`, `check:review-pages`: PASS.
- Physical browser/keyboard testing on the owner's Windows machine: **PENDING**.

The existing Stage 43 publication gate remains blocked: no source approvals were added, and the sitemap intentionally has zero indexable URLs.

## Next on Stage 45 roadmap

Measure actual Core Web Vitals, audit keyboard and screen-reader behavior in real browsers, then plan privacy-reviewed analytics and operational monitoring. Do not claim release readiness until editorial evidence and market/production gates are resolved.
