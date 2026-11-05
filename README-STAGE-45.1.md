# Stage 45.1 — Primary navigation and editorially safe homepage (v1 UX release readiness)

**Status:** local development patch. This is a focused UX/SEO correction, NOT a production launch or editorial approval. Based on local Stage 43.4 + Stage 44.4 Editorial Workbench files.

## Why

- With JavaScript disabled, the mobile menu was invisible (`display: none`), so key sections were inaccessible. The Games/Casinos menus were buttons wrapping only one useful link each.
- The `EN` button looked interactive but the DE/ES markets are not active.
- Home page title and headings advertised `Best Online Casinos` and provider rankings, while the audit reports pending/unverified ratings and rankings.

## Changes

1. Main header links **Home / Games / Casinos** are ordinary semantic anchors, accessible without JS and crawlable.
2. Mobile JS menu retains its toggle and Escape-key closing (focus returns to the menu button). When JS is **off**, a dedicated `<noscript>` stylesheet keeps primary navigation visible without changing the normal layout.
3. Language display becomes a non-interactive EN indicator until a reviewed translation is actually released. Dark/light switch behavior is untouched.
4. Home page title, description, casino section heading and editorial explanation no longer imply approved rankings, ratings or recommendations.
5. No source facts, provider claims, approval status, locale routes, partner links, importer, publication permissions, Git history or Workbench files changed.

## Install into the existing folder

Copy the files from the patch ZIP into the project root, keeping directory paths. The archive contains **only changed files**; do not delete your untracked `data/editorial/` or `.git` folder. When prompted, replace the corresponding tracked files. Nothing runs automatically.

In the VS Code terminal from the project root:

```powershell
npm run build
npm run test:stage451
npm run check:seo
npm run check:navigation
npm run check:display
```

Other unit suites are recommended before merging, but these checks are sufficient to validate this focused change initially.

## Visual QA

- `http://localhost:8080/en/` — main title/casino section no longer claims a best ranking.
- At 375px and 1280px widths, check the header, Home/Games/Casinos, menu toggle, dark theme, and Escape close.
- Browser DevTools > Command Menu > Disable JavaScript > Reload at 375px: Home, Games and Casinos must remain visible and clickable; no mobile menu toggle should appear.
- EN is a label, not a button. No new DE/ES pages are advertised.
- Local preview still shows `noindex`; production publication remains blocked by Stage 42.2/43.

## Known remaining work

Stage 43 remains blocked on evidence and human editorial approval. Stage 43.5 is a separate draft PR and has NOT been silently merged into this patch. Stage 45 analytics, consent/privacy review, performance baselines, and release checklist are later tasks; none are declared complete here. Editorial Workbench v0.1 remains available separately.
