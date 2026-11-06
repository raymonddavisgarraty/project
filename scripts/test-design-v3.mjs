import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {buildRoutes42} from "../src/lib/routes42.js";
import {createIndexability42} from "../src/lib/indexability42.mjs";
import search from "../src/_data/gameSearchIndex.js";

const read=f=>readFileSync(f,"utf8");
const games=Array.from({length:29},(_,i)=>({id:"game-"+(i+1),
 slug:"game-"+(i+1),globalFacts:{id:"game-"+(i+1),sourceStatus:"legacy-unverified"}}));
const casinos=Array.from({length:13},(_,i)=>({id:"casino-"+(i+1),slug:"casino-"+(i+1)}));
const routes=buildRoutes42({games,casinos});
for(const target of ["/en/games/","/en/games/page/2/","/en/games/page/3/",
 "/en/casinos/","/en/casinos/page/2/"])
 assert(routes.some(r=>r.path===target),"Missing crawlable catalogue page "+target);
assert.equal(routes.filter(r=>r.type==="games-index-page").length,2);
assert.equal(routes.filter(r=>r.type==="casinos-index-page").length,1);
const deepRoutes=buildRoutes42({games:Array.from({length:120},(_,i)=>({
 id:"deep-"+(i+1),slug:"deep-"+(i+1),
 globalFacts:{id:"deep-"+(i+1),sourceStatus:"legacy-unverified"}
}))});
assert(deepRoutes.some(r=>r.path==="/en/games/page/10/"),"Page 10 must be a crawlable route");
assert.equal(createIndexability42({routes:deepRoutes}).approvedRouteCount,0);

const idx=createIndexability42({routes,audit:null,approvals:[],informationApproved:false});
assert.equal(idx.approvedRouteCount,0,"Generated catalogue routes are never automatically indexable");
assert(idx.routes.length===0);
const index=read("src/en/games/index.njk");
const casinoIndex=read("src/en/casinos/index.njk");
for(const [name,code,alias] of [["game",index,"pageGames"],["casino",casinoIndex,"pageCasinos"]]){
 assert(code.includes("pagination:"),name+" template must use SSR pagination");
 assert(code.includes("size: 12"),name+" page size must be bounded");
 assert(code.includes("alias: "+alias),name+" must iterate paginated entities");
 assert(code.includes("pagination.href.next"),"Must provide real HTML next page link");
 assert(code.includes('aria-current="page"'),"Active page link requires accessible state");
 assert(code.includes("eleventyComputed:"),"Canonical should be computed for each page");
}
const header=read("src/_includes/components/site-header/site-header.njk");
assert(header.includes('class="site-header__logo" href="/en/"'));
for(const route of ["/en/","/en/games/","/en/casinos/"])
 assert(header.includes('href="'+route+'"'));
assert(header.includes("data-theme-toggle"));
const base=read("src/_includes/layouts/base.njk");
assert(base.includes('data-theme="dark"'));
const review=read("src/_includes/components/local-editorial-pilot/local-editorial-pilot.njk");
assert(review.includes('data-local-editorial-draft="sweet-bonanza"'));
for(const id of ["overview","stats","demo","features","media","video","analysis","faq"])
 assert(review.includes('id="'+id+'"'),"Missing prototype section "+id);
assert(review.includes("UNVERIFIED DRAFT"));
assert(!review.includes("<iframe"),"Only an authorized game client may be embedded");
const globals=read("src/assets/js/pages/global-game-search-v3.js");
assert(globals.includes('fetch("/en/games/search-index.json"'));
assert(globals.includes("document.createElement"));
assert(globals.includes("link.textContent = entry.title"));
assert(!globals.includes("innerHTML"),"Search suggestions must be text only");
const indexTemplate=read("src/en/games/search-index.njk");
assert(indexTemplate.includes("gameSearchIndex | dump | safe"));
assert(search.every(x=>Object.keys(x).sort().join(",")==="provider,title,url,volatility"));
assert(search.every(x=>!Object.hasOwn(x,"affiliateId")&&!Object.hasOwn(x,"rating")));
if(existsSync("_site/en/games/index.html")){
 const html=read("_site/en/games/index.html");
 assert(html.includes('data-games-grid'),"Server-rendered catalogue grid absent");
 assert(html.includes("search-index.json") || html.includes("global-game-search-v3.js"));
 assert(html.includes('name="robots" content="noindex, follow"'));
}
console.log("ReviewHub prototype v3 QA OK (responsive header, numbered preview, 12-item SSR pagination, global name search, no publication).");
