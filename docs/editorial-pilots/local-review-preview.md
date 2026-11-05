# Optional local content preview — Sweet Bonanza

The actual source text in `src/content/locales/en/games/sweet-bonanza.js` is still awaiting factual, author, rights and edition-specific review. The ordinary site correctly displays a neutral pending-verification shell. This change lets the owner *read that unapproved draft locally* without switching on live publication.

## PowerShell

Run in the isolated test checkout after switching to this branch:

    npm run test:local-editorial-preview
    npm run verify:integration
    $env:EDITORIAL_PREVIEW = '1'
    npm run dev

Visit `http://localhost:8080/en/games/sweet-bonanza/` and scroll below the verification status to **Local editorial preview — UNVERIFIED DRAFT**. Stop the server with Ctrl+C, then disable the preview before subsequent builds:

    Remove-Item Env:EDITORIAL_PREVIEW -ErrorAction SilentlyContinue

## Important boundaries

- `EDITORIAL_PREVIEW` is OFF by default; it has to be exactly `1`. It is **also OFF for NODE_ENV=production or SITE_ENV=production**, even when requested.
- Requires Sweet Bonanza to remain `review` and an exact expected game ID. Does not authorize unrelated games/casinos.
- The preview copies only source text from the first-party-informed editorial draft: heading, descriptions, feature bullets, FAQ and two developer research links. Ratings, affiliate IDs, unverified numerical global facts, source snapshots and commercial actions are never passed to the template.
- Existing Stage 43 page guards, noindex/sitemap zero routes, public catalogue and commercial policies are unchanged. The preview is NOT a trusted independently verified review and should not be publicly deployed.
- Build outputs created while `EDITORIAL_PREVIEW=1` do contain the flagged draft in static HTML. Never upload this `_site` output to public hosting. Rebuild without the flag when finished.
- Authentic edition-specific game rules, claims, real editorial provenance and market rights remain necessary before approving any actual public content.

