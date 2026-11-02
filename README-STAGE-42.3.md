# Stage 42.3 — Stable entity IDs and internal relation integrity

**Status:** draft technical checkpoint stacked on Stage 42.2 (#14) and cross-platform integration fixture correction (#15). **This is not a content publication, verified game-to-provider assertion, Studio/Bot application or public JSON feed.**

## Why

SEO Platform's three-product architecture requires stable entity keys independent from localized URLs. The current two game records already have explicit IDs; casino records previously used URL slugs implicitly as IDs. The route builder even silently fell back from a missing casino.id to casino.slug.

These are risks for future URL migrations, cross-product integration, relation integrity and the later approved published catalogue.

## Changes and compatibility boundary

- \`src/_data/casinos.js\`: add immutable \`id\` fields for both existing **fictional legacy casino listings**. IDs equal current slugs, so NO URL, actual claims, ratings, bonuses, editorial provenance or template content change. These IDs identify records, **not proof the casino is real or legally available**.
- \`src/lib/routes42.js\`: require an explicit syntactically valid casino ID and slug. No silent slug-as-ID fallback; reject duplicate casino IDs. Generated route \`entityId\` now comes from the declared ID.
- \`src/lib/entity-graph423.mjs\`: Platform-internal **read-only identity checker**, not a generator of published content. Enforces stable IDs and unique slugs, matching game facts identity, real generated paths and ID-only Game→Game editorial references. Validates each game provider ID against the registry as a *registry match only*, **never as a source-verified game/provider relationship**.
- \`scripts/check-stage423.mjs\`: read-only CLI; no files modified, no new routes or feed; reports missing routes, ambiguous slugs, duplicate IDs, legacy slug-only relations, unknown registered provider IDs and identity mismatches.
- \`scripts/test-stage423.mjs\`: real-data audit plus synthetic tests with **different ID and slug** and 17 negative fixtures (unknown/duplicate relations, invalid IDs, wrong routes, missing/duplicate casino ID and legacy slug alias).
- No changes to Stage 34–40 import/publish, Stage 43 audit/approval, Stage 42.2 indexability, or inbound Studio contract.

## Critical remaining migration constraint

Stage 43 casino provenance currently keys by \`casino.slug\` instead of \`casino.id\` in \`src/lib/editorial43.mjs\` and \`scripts/editorial43.mjs\`. The existing casino IDs deliberately equal their present slugs, so the current evidence lookup is unchanged. A later migration must update all provenance, audit and approval bindings atomically **before changing the slug independently of the ID**.

Also \`gameNavigation44\` supports a legacy slug fallback for relatedGames. Stage 42.3 does **not** change that runtime component, to preserve existing navigation; it adds a strict internal audit that requires future authored relations to use IDs. A reviewed migration later can remove legacy fallback without breaking navigation. The 2 current game relations already use strings equal to their stable IDs.

Current \`publishedRoutes\` remains a **generated development route manifest**, not an approved public catalogue or sitemap. Stage 42.2 still keeps all content pages noindex and sitemap empty while human release permissions are absent.

## PowerShell

From the repository root after reviewing untracked files:

    git status --short
    git fetch origin
    git switch stage-42-3-stable-entity-ids-and-relations

    npm run test:stage423
    npm run check:entities
    npm run test:integration-contract
    npm run check:integration-contract
    npm run test:stage422
    npm run test:stage42
    npm run test:stage43
    npm run test:stage44
    npm run test:stage443

    npm run build
    npm run check:seo
    npm run check:navigation
    npm run check:catalogue
    npm run check:review-pages
    npm run audit:editorial

Expected: two valid game and casino identities each; six provider registry identities; 2 internally consistent, **unapproved** editorial navigation relations; 0 approved public exported entities; Stage 42.2 sitemap still has zero URLs; editorial release remains false with the same unverified claims/blockers.

## Next stage

Stage 43 genuine evidence review starts with a **small, source-first content pilot**. Collect primary first-party game information and preserve exact URLs, timestamps and source version. Create drafts/review proposals, not verified claims, until an accountable editor approves. Release rights, author/rating methodology, markets and publication permissions are separate. The subsequent Stage 44–45 content/export tests must use independently approved, revision-bound data, not the raw generated route manifest.
