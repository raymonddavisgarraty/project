# Stage 44.4 — Private Editorial Workbench

**Scope:** a read-only, local-first HTML dashboard for the existing Stage 43 audit and Stage 43.1 remediation queue. Not a new public route, not a release or content approval, and not a replacement for Stage 43.5 source integrity work.

## Why

The project already has a machine-readable editorial audit and prioritized task queue, but their CLI output is not convenient for day-to-day source research. This component provides an accessible offline view with entity navigation, priority filters, full-text task search and required human action for every audit blocker.

## Use (Windows PowerShell, project root)

```powershell
node scripts/test-editorial-workbench444.mjs
node scripts/editorial-workbench444.mjs
```

The second command prints the exact HTML report path (inside `data/editorial/reports/stage431/`). Open it in a browser, for example by copying the path from the output into File Explorer. The file is local, self-contained and can be viewed without an HTTP server or running Eleventy. It is created with exclusive `wx`: an existing report is **never overwritten**. If you run twice within one second, the second invocation refuses and you can rerun after the system clock advances.

## Files added

- `src/lib/editorial-workbench444.mjs` — pure HTML renderer, with strict audit/queue consistency checks and escaping for all dynamic strings.
- `scripts/editorial-workbench444.mjs` — opt-in create-only private exporter. Writes inside the **existing gitignored** `data/editorial/reports/stage431/` folder.
- `scripts/test-editorial-workbench444.mjs` — safety and output tests.

No files are modified or deleted. No `package.json`, `.gitignore`, templates, public assets, approval statuses, provenance, or published content are changed.

## Safety and editorial limits

- **No pending fact values, unapproved rating, bonus, affiliate data or unapproved source URLs** are included.
- Includes only audit identities and blocker codes, priority and required human review action.
- HTML escapes untrusted strings and uses a restrictive local-file CSP; no external scripts or fonts.
- `data/editorial/reports/stage431/` was already ignored by Git at Stage 43.1. Do not copy the HTML into `src/`, `_site/` or a public Git branch.
- `npm run check:editorial` and production builds must still reject all unapproved content. This dashboard cannot change those checks.
- Human source authenticity, evidence rights, edition, exact claims, market restrictions and editorial approval are still separate actions.

## Next meaningful step

Use the dashboard to work through **P0** issues one entity at a time. For the Sweet Bonanza pilot, resolve version-specific RTP / maximum-win discrepancies using authenticated publisher evidence, without treating research notes as a verified game rulebook. Then continue with original English editorial copy and explicit revision-bound review.
