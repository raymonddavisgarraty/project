import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildGameNavigation44 } from "../src/lib/game-navigation44.mjs";
import { buildGameCatalog44 } from "../src/lib/game-catalog44.mjs";
import games from "../src/_data/games.js";
import routes from "../src/_data/publishedRoutes.js";
import editorialFields433 from "../src/_data/editorialFields433.js";
import editorialDisplay432 from "../src/_data/editorialDisplay432.js";
import audit from "../src/lib/editorial-audit433.js";
import navigation from "../src/_data/gameNavigation44.js";
import catalogue from "../src/_data/gameCatalog44.js";
import { inspectBreadcrumb } from "./check-stage44.mjs";

const game = (id, slug = id, relatedGames = [], provider = "provider-a") => ({
  id, slug, title: "Title: " + id, relatedGames,
  globalFacts: { id, slug, providerId: provider },
});
const a = game("game-a","one",["two","two","one","missing","/en/providers/not-published/"]);
const b = game("game-b","two",["one"]);
const c = game("game-c","three",[],"provider-a");
const foreign = game("game-foreign","foreign",[],"provider-b");
const all = [a,b,c,foreign];
const route = g => ({ type: "game", entityId: g.id, path: "/en/games/" + g.slug + "/" });
const build = (options = {}) => buildGameNavigation44({
  games: all, publishedRoutes: all.map(route), ...options,
});
const basic = build();
assert.equal(basic.routeCount,4);
assert.deepEqual(basic.forGame(a).curated.map(t => t.id), ["game-b"]);
assert.equal(basic.forGame(a).curated[0].url, "/en/games/two/");
assert.equal(basic.forGame(a).curated[0].reviewStatus, "editorial-verification-pending");
assert.equal(basic.forGame(a).fromProvider.length, 0);
assert.deepEqual(basic.forGame(b).curated.map(t => t.id), ["game-a"]);
assert.deepEqual(basic.forGame(c).curated, []);
assert.deepEqual(basic.forGame(JSON.parse(JSON.stringify(a))).curated.map(t => t.id), ["game-b"]);
assert.deepEqual(basic.forGame({ ...a, slug: "wrong" }).curated, []);
assert.deepEqual(basic.forGame({ ...a, globalFacts: { id: "fake", slug: "one" } }).curated, []);
assert.equal(basic.forGame(a).curated[0].rating, undefined);
assert.equal(basic.forGame(a).curated[0].provider, undefined);
assert.equal(basic.forGame(a).curated[0].affiliateId, undefined);

const verifiedAudit = {
  schemaVersion: 1, autoApprove: false, autoPublish: false,
  items: all.map(g => ({ type:"game", id:g.id,
    claims:[{field:"providerId", status:"verified", codes:[]}] })),
};
const providerNav = build({audit:verifiedAudit});
assert.deepEqual(providerNav.forGame(a).curated.map(t => t.id), ["game-b"]);
assert.deepEqual(providerNav.forGame(a).fromProvider.map(t => t.id), ["game-c"]);
assert.equal(providerNav.forGame(a).fromProvider.some(t => t.id === "game-foreign"),false);
assert.equal(providerNav.forGame(c).fromProvider.length,2);
assert.deepEqual(build({audit:{...verifiedAudit,autoApprove:true}}).forGame(a).fromProvider,[]);
assert.deepEqual(build({audit:{...verifiedAudit,items:verifiedAudit.items.slice(1)}}).forGame(a).fromProvider,[]);
assert.deepEqual(build({audit:{...verifiedAudit,items:[
  ...verifiedAudit.items,verifiedAudit.items[0]
]}}).forGame(a).fromProvider,[]);
const missingTargetRoute = build({
  publishedRoutes:all.filter(g=>g.id!=="game-b").map(route),
});
assert.deepEqual(missingTargetRoute.forGame(a).curated,[]);
const unbuiltForeign = build({
  publishedRoutes:[...all.map(route),
    {type:"provider",entityId:"provider-a",path:"/en/providers/provider-a/"},
    {type:"game",entityId:"unknown",path:"/en/games/unknown/"}],
  audit:verifiedAudit,
});
assert(!unbuiltForeign.forGame(a).curated.some(t=>t.url.includes("provider")));
const wrongLocale = build({
  publishedRoutes:all.map(g=>g.id==="game-b"?
    {type:"game",entityId:g.id,path:"/de/games/two/"}:route(g)),
});
assert.deepEqual(wrongLocale.forGame(a).curated,[]);
assert.throws(() => buildGameNavigation44({
  games:[a,a],publishedRoutes:[route(a)],
}),/Duplicate/);
assert.throws(() => buildGameNavigation44({
  games:[a],publishedRoutes:[route(a),route(a)],
}),/Ambiguous built game route/);
assert.throws(() => buildGameNavigation44({games:undefined,publishedRoutes:{}}),/arrays/);

const pendingCatalog = buildGameCatalog44({
  games:all,editorialFields:{gameRows:()=>[]},
});
assert.equal(pendingCatalog.providers.length,0);
assert.equal(pendingCatalog.volatilities.length,0);
const reviewedCatalog = buildGameCatalog44({
  games:all,
  editorialFields:{gameRows:()=>[
    {field:"providerName",value:"Pragmatic Play",reviewStatus:"claim-verified"},
    {field:"volatility",value:"High",reviewStatus:"claim-verified"},
    {field:"rtp",value:"96.48%",reviewStatus:"claim-verified"},
    {field:"providerName",value:"Unsafe Provider",reviewStatus:"unverified"},
  ]},
});
assert.deepEqual(reviewedCatalog.providers,[{value:"pragmatic play",label:"Pragmatic Play"}]);
assert.deepEqual(reviewedCatalog.volatilities,[{value:"high",label:"High"}]);

// Integration against the actual current Stage 43 audit and existing EN pages.
assert.equal(audit.productionReleaseAllowed,false);
assert.equal(games.length,2);
assert.equal(navigation.routeCount,2);
for (const g of games) {
  const related = navigation.forGame(g);
  assert.equal(related.curated.length,1,"Real editorial cross-reference missing: "+g.id);
  assert.equal(related.curated[0].id === g.id,false);
  assert.equal(related.fromProvider.length,0,"Unverified provider association leaked");
  assert.equal(related.curated[0].reviewStatus,"editorial-verification-pending");
}
assert.equal(catalogue.providers.length,0);
assert.equal(catalogue.volatilities.length,0);
assert(games.every(g=>editorialFields433.gameRows(g).length===0));
assert(games.every(g=>editorialDisplay432.game(g)===false));

const detail = readFileSync("src/en/games/game.njk","utf8");
const card = readFileSync("src/_includes/components/game-grid-card/game-grid-card.njk","utf8");
const context = readFileSync("src/_includes/components/game-context/game-context.njk","utf8");
const styles = readFileSync("src/assets/css/main.css","utf8");
const search = readFileSync("src/en/games/index.njk","utf8");
assert(detail.includes('include "components/game-context/game-context.njk"'));
assert(detail.indexOf('include "components/game-context/game-context.njk"') >
  detail.lastIndexOf("{% endif %}"));
assert(context.includes('data-game-context-curated'));
assert(context.includes('data-game-context-provider'));
assert(context.includes('Facts awaiting editorial review'));
assert(context.includes('They are not ratings, recommendations'));
assert(!context.includes('game.rating'));
assert(!context.includes('game.rtp'));
assert(!context.includes('/en/providers/'));
assert(styles.includes("components/game-context.css"));
assert(card.includes("editorialFields433.gameFieldVerified(game, 'providerName')"));
assert(card.includes("editorialFields433.gameFieldVerified(game, 'volatility')"));
assert(card.includes('data-game-rating=""'));
assert(search.includes("gameCatalog44.providers"));
assert(search.includes("gameCatalog44.volatilities"));
assert(search.includes("disabled aria-describedby"));
assert(readFileSync("src/assets/css/pages/games-search.css","utf8").includes('[data-game-card][hidden]'));
// Regression: Eleventy pagination must calculate each page's current breadcrumb
// in the item template, not cache the first item's name in computed frontmatter.
const gameTemplate = readFileSync("src/en/games/game.njk", "utf8");
const casinoTemplate = readFileSync("src/en/casinos/casino.njk", "utf8");
assert(gameTemplate.includes("label: game.hero.title"));
assert(casinoTemplate.includes("label: casino.title"));
assert(!/^\s{2}breadcrumbs:\s*$/m.test(gameTemplate.split("---")[1]));
assert(!/^\s{2}breadcrumbs:\s*$/m.test(casinoTemplate.split("---")[1]));

const sampleCrumb = label =>
  '<nav class="breadcrumbs" aria-label="Breadcrumb">' +
  '<ol><li><span aria-current="page">' + label + '</span></li></ol></nav>';
const breadcrumbErrors = [];
inspectBreadcrumb(sampleCrumb("The Big Dog House"), "the-big-dog-house", "The Big Dog House", breadcrumbErrors);
inspectBreadcrumb(sampleCrumb("RoyalSpin Casino"), "royalspin-casino", "RoyalSpin Casino", breadcrumbErrors);
assert.deepEqual(breadcrumbErrors, []);
inspectBreadcrumb(sampleCrumb("Sweet Bonanza"), "the-big-dog-house", "The Big Dog House", breadcrumbErrors);
assert(breadcrumbErrors.some(error => error.includes("breadcrumb mismatch")));
breadcrumbErrors.length = 0;
inspectBreadcrumb('<nav aria-label="Breadcrumb"></nav>', "the-big-dog-house", "The Big Dog House", breadcrumbErrors);
assert(breadcrumbErrors.some(error => error.includes("missing current-page breadcrumb")));

// Layout regression: explanatory notes must not push Sort by down at
// desktop widths; the result count must align vertically with the buttons.
const gamesCss = readFileSync("src/assets/css/pages/games-search.css", "utf8");
const ruleBlocks = selector => gamesCss.split(selector + " {")
  .slice(1).map(chunk => chunk.split("}")[0]);
const panelRules = ruleBlocks(".games-search__panel");
assert.equal(panelRules.length, 3, "Expected mobile/tablet/desktop panel rules");
assert.match(panelRules[0], /align-items:\s*start\s*;/);
assert.match(panelRules[0], /grid-template-columns:\s*minmax\(0,\s*1fr\)/);
assert.match(panelRules[1], /repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
assert.match(panelRules[2], /minmax\(0,\s*1\.4fr\)\s+repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
assert(!panelRules.some(rule => /align-items:\s*end\s*;/.test(rule)));
const actionsRules = ruleBlocks(".games-search__actions");
assert.equal(actionsRules.length, 3, "Expected mobile/tablet/desktop action rules");
assert.match(actionsRules[0], /align-items:\s*center\s*;/);
assert.match(actionsRules[0], /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+auto\s*;/);
assert.match(actionsRules[1], /align-items:\s*center\s*;/);
const countRules = ruleBlocks(".games-search__count");
assert.equal(countRules.length, 2, "Expected mobile and tablet count rules");
assert.match(countRules[0], /display:\s*inline-flex\s*;/);
assert.match(countRules[0], /align-items:\s*center\s*;/);
assert.match(countRules[0], /grid-column:\s*1\s*\/\s*-1\s*;/);
assert.match(countRules[1], /min-height:\s*52px\s*;/);
assert.match(countRules[1], /white-space:\s*nowrap\s*;/);
const catalogueMarkup = readFileSync("src/en/games/index.njk", "utf8");
assert.match(catalogueMarkup, /class="games-search__count"[^>]*role="status"[^>]*aria-live="polite"/);
assert.match(catalogueMarkup, /data-games-count>[\s\S]*games\.length/);

console.log("Stage 44.1 tests OK (real-route links, safe navigation, verified provider gating, catalog facets, accessibility and existing data).");
