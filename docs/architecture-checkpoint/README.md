# Architecture checkpoint v1 — IA, entity graph, UX wireframes

**Status:** design proposal for review, not implementation approval or production release.

**Code baseline inspected:** `main` at `8c7252fbce1659b16bfbd31d50e2ffcb62cd3432`, plus the separate proposed Stage 41.2 branch. The pending Stage 41.2 PR is **not merged**.

Inputs:
- SEO Platform Master Development Brief v1.0 (2026-10-29)
- Product, UX, Information Architecture & Studio Integration Blueprint v1.0 (2026-10-29)
- Existing Eleventy/Nunjucks/HTML/CSS/Vanilla JS code and Stage 34–40 editorial pipeline

## Outputs

1. [01 — Current state, site map, URL policy, entity graph](01-ia-entities-links.md)
2. [02 — UX component contracts and readiness acceptance criteria](02-ux-component-contracts.md)
3. [03 — Future Studio export contract boundaries](03-studio-interface-boundaries.md)
4. [Prototype: home](prototypes/home.html), [catalogue](prototypes/games-catalog.html), [game detail](prototypes/game-detail.html): independent adaptive HTML/CSS wireframes; **not** templates, not published data, not functional filters.

These prototypes intentionally live in `docs/`, which Eleventy currently does not copy into `_site`.

## Workflow

- Review IA and UX decisions **before** Stage 42–44 implementation.
- Resolve open decisions in the document; do not infer approvals from descriptions or prototypes.
- Keep the public `src/` directory unchanged in this checkpoint.
- Once accepted, implement Stage 42 technical SEO, Stage 43 content quality, then Stage 44 pilot UI using shared Nunjucks components.
- Do not introduce React/Vue/Next/Astro/Tailwind/Bootstrap or runtime public dependence on Studio.

## How to inspect prototypes

Open the HTML files directly in a browser, resize the viewport to 375/768/1280 px, use the Tab key, and check with JavaScript disabled (there is no JavaScript). These are **static layout models**: there is no live search, filter, scoring, affiliate offer, or publication action.

Check that `npm run build` and Stage 38–40 tests still pass before merging documentation into `main`. The checklist does not certify editorial truth or legal market approvals.
