# Stage 28 — Bulk Importer Foundation

## Scope
Safe, separate research importer. **Does not change Eleventy templates, published game JSON, or existing npm scripts.** Node 20+ required. No extra packages.

## Installation
Copy `scripts/importer/` and `tests/fixtures/` to the repository root, retaining folders. Optionally create `src/content/import-candidates/games/`. Do not replace package.json.

## Commands (PowerShell)
```powershell
node scripts/importer/test.mjs
node scripts/importer/run.mjs --fixture tests/fixtures/sample-game.html
npm run check:games
npm run check:provenance
npm run build
```

Optional real-source **manual test only** (first review site terms, robots.txt, permissions, access restrictions and jurisdiction; no bypass):
```powershell
node scripts/importer/run.mjs --url https://SOURCE-ALLOWED-URL/slots/example/ --allow-network
node scripts/importer/run.mjs --sitemap https://SOURCE-ALLOWED-URL/sitemap.xml --allow-network --max 5
```

## Design limitations
- Generic HTML/JSON-LD extraction supports **title and publisher** only. RTP, volatility, paylines etc remain null until a reviewed site-specific adapter exists. Never invent values.
- Sitemap discovery is same-origin, max 25 per invocation, 1.5-second delay; nested sitemap indexes are not traversed. No automated robots/ToS verification: operator must verify before network requests.
- No automatic publishing, translation, SEO content, providerId resolution or conflict promotion.
- Candidate files are immutable by fingerprint (`wx`); duplicates are not overwritten.
- The network client rejects HTTP, credentials, redirects and oversized responses, but is **not hardened against SSRF**. Use only explicitly approved public hostnames; do not run on untrusted URLs or production infrastructure.
- Source metadata is research evidence, not legal permission to reproduce text/images.

## Next stage
Site-specific adapter, field-level evidence, provider registry, source conflict queue, robots and URL allowlist, automated regression fixtures, review workflow.
