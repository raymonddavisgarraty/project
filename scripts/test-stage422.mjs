import assert from "node:assert/strict";
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,dirname} from "node:path";
import {createIndexability42} from "../src/lib/indexability42.mjs";
import liveIndexability from "../src/_data/indexability42.js";
import liveRoutes from "../src/_data/publishedRoutes.js";
import liveAudit from "../src/lib/editorial-audit433.js";
import {auditSeo42} from "./seo42.mjs";

// The real repository contains only unverified game/casino records and
// does not yet have market or human-indexation approval, so NONE may be
// indexed in the development sitemap.
assert.equal(liveAudit.productionReleaseAllowed,false);
assert.equal(liveIndexability.generatedRouteCount,liveRoutes.length);
assert.equal(liveIndexability.approvedRouteCount,0);
assert.deepEqual(liveIndexability.routes,[]);
assert(liveRoutes.every(route=>liveIndexability.allows(route.path)===false));
assert.equal(liveIndexability.allows("/en/"),false);
assert.equal(liveIndexability.allows("https://example.org/en/"),false);

const game={path:"/en/games/test-game/",type:"game",entityId:"test-game"};
const home={path:"/en/",type:"home"};
const listed=[home,game];
const goodAudit={
  schemaVersion:1,productionReleaseAllowed:true,autoApprove:false,autoPublish:false,
  counts:{blockers:0},
  items:[{type:"game",id:"test-game",releaseReady:true,blockers:[]}],
};
const hash="a".repeat(64);
const decision={
  path:game.path,type:"game",entityId:game.entityId,locale:"en",
  status:"approved-for-indexing",globalInformationRights:true,
  contentSha256:hash,
  review:{status:"approved",reviewerId:"human-editor",reviewedAt:"2026-10-29T10:00:00Z"},
};
const options={
  routes:listed,audit:goodAudit,approvals:[decision],
  revisionHashes:{[game.path]:hash},
  informationApproved:true,now:Date.parse("2026-10-30T00:00:00Z"),
};
const accepted=createIndexability42(options);
assert.equal(accepted.generatedRouteCount,2);
assert.equal(accepted.approvedRouteCount,1);
assert.deepEqual(accepted.routes,[game]);
assert.equal(accepted.allows(game.path),true);
assert.equal(accepted.allows(home.path),false);
assert.equal(accepted.routes[0].contentSha256,undefined);
assert.equal(accepted.routes[0].review,undefined);

const forbidden=[
 ["missing global information permission",{informationApproved:false}],
 ["missing audit",{audit:null}],
 ["audit has blockers",{audit:{...goodAudit,counts:{blockers:1}}}],
 ["audit not released",{audit:{...goodAudit,productionReleaseAllowed:false}}],
 ["audit auto-approves",{audit:{...goodAudit,autoApprove:true}}],
 ["audit auto-publishes",{audit:{...goodAudit,autoPublish:true}}],
 ["missing claim review",{audit:{...goodAudit,items:[{...goodAudit.items[0],releaseReady:false}]}}],
 ["claim blocker",{audit:{...goodAudit,items:[{...goodAudit.items[0],blockers:[{field:"rtp"}]}]}}],
 ["duplicated audit entity",{audit:{...goodAudit,items:[...goodAudit.items,...goodAudit.items]}}],
 ["missing human decision",{approvals:[]}],
 ["decision is pending",{approvals:[{...decision,status:"pending"}]}],
 ["wrong locale",{approvals:[{...decision,locale:"de"}]}],
 ["wrong entity ID",{approvals:[{...decision,entityId:"wrong"}]}],
 ["wrong entity type",{approvals:[{...decision,type:"casino"}]}],
 ["market approval missing",{approvals:[{...decision,globalInformationRights:false}]}],
 ["reviewer not approved",{approvals:[{...decision,review:{...decision.review,status:"pending"}}]}],
 ["reviewer identity invalid",{approvals:[{...decision,review:{...decision.review,reviewerId:""}}]}],
 ["review occurs in future",{approvals:[{...decision,review:{...decision.review,reviewedAt:"2099-01-01T00:00:00Z"}}]}],
 ["hash mismatch",{revisionHashes:{[game.path]:"b".repeat(64)}}],
 ["missing revision",{revisionHashes:{}}],
 ["invalid revision hash",{approvals:[{...decision,contentSha256:"abc"}]}],
];
for(const [label,change] of forbidden){
  const guarded=createIndexability42({...options,...change});
  assert.equal(guarded.approvedRouteCount,0,label);
  assert(!guarded.allows(game.path),label);
}
assert.throws(()=>createIndexability42({routes:[game,game]}),/Duplicate/);
assert.throws(()=>createIndexability42({routes:[{...game,path:"/de/games/test-game/"}]}),/Invalid/);
assert.throws(()=>createIndexability42({routes:[{...game,path:"/en/games/bad/extra/"}]}),/Invalid/);
assert.throws(()=>createIndexability42({...options,approvals:[decision,decision]}),/Duplicate/);
assert.throws(()=>createIndexability42({...options,approvals:[{...decision,path:"/en/unbuilt/"}]}),/unknown/);
assert.throws(()=>createIndexability42({routes:{}}),/requires/);

// Noindex and sitemap are derived from the same central approved route list.
const layout=readFileSync("src/_includes/layouts/base.njk","utf8");
const sitemap=readFileSync("src/sitemap.njk","utf8");
const config=readFileSync(".eleventy.js","utf8");
const seoRunner=readFileSync("scripts/check-stage42.mjs","utf8");
assert(layout.includes("indexability42.allows(canonical)"));
assert(layout.includes('effectiveRobots = "noindex, follow"'));
assert(sitemap.includes("for route in indexability42.routes"));
assert(!sitemap.includes("for route in publishedRoutes"));
assert(seoRunner.includes("indexableRoutes: indexability42.routes"));
assert(config.includes("indexability42.approvedRouteCount === 0"));
assert(config.includes("assertProductionEditorial43()"));

// Exercise the generated HTML audit with an empty sitemap and genuinely
// unindexable development pages. An unreviewed page may still be linked to
// within QA without being listed as an approved indexable URL.
const root=mkdtempSync(join(tmpdir(),"stage422-"));
const origin="https://reviews.example-site.org";
const routes=[
  {path:"/en/",type:"home"},
  {path:"/en/games/",type:"games-index"},
  {path:"/en/casinos/",type:"casinos-index"},
  game
];
const put=(filename,body)=>{
  const file=join(root,filename.replace(/^\/+/,""));
  mkdirSync(dirname(file),{recursive:true});
  writeFileSync(file,body);
};
const html=(path,links,robots="noindex, follow")=>
  '<!doctype html><html lang="en"><head><title>Test page</title>'+
  '<meta name="description" content="Test only"><meta name="robots" content="'+robots+'">'+
  '<link rel="canonical" href="'+origin+path+'">'+
  '<meta property="og:url" content="'+origin+path+'"></head><body><h1>Test</h1>'+
  links.map(link=>'<a href="'+link+'">Link</a>').join("")+'</body></html>';
const page=(path,links,robots)=>put(path+"index.html",html(path,links,robots));
const emptySitemap='<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>';
try{
  page("/en/",["/en/games/","/en/casinos/"]);
  page("/en/games/",["/en/games/test-game/","/en/"]);
  page("/en/casinos/",["/en/"]);
  page(game.path,["/en/games/"]);
  put("/404.html",html("/404.html",["/en/"]));
  put("/index.html",'<html><head><meta http-equiv="refresh" content="0; url=/en/">'+
    '<meta name="robots" content="noindex, follow">'+
    '<link rel="canonical" href="'+origin+'/en/"></head><body><a href="/en/">English</a></body></html>');
  put("/robots.txt","User-agent: *\nDisallow: /\n");
  put("/sitemap.xml",emptySitemap);
  const current=auditSeo42({outDir:root,siteUrl:origin,routes,indexableRoutes:[],production:false});
  assert.equal(current.ok,true,current.errors.join("; "));
  assert.equal(current.sitemapEntries,0);
  page(game.path,["/en/games/"],"index, follow");
  const exposed=auditSeo42({outDir:root,siteUrl:origin,routes,indexableRoutes:[],production:false});
  assert(exposed.errors.some(e=>e.includes("unapproved generated page must be noindex")));
  page(game.path,["/en/games/"]);
  put("/sitemap.xml",'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+
    "<url><loc>"+origin+game.path+"</loc></url></urlset>");
  const leaked=auditSeo42({outDir:root,siteUrl:origin,routes,indexableRoutes:[],production:false});
  assert(leaked.errors.some(e=>e.includes("Unexpected sitemap URL")));
  put("/sitemap.xml",emptySitemap);
  const prod=auditSeo42({outDir:root,siteUrl:origin,routes,indexableRoutes:[],production:true});
  assert(prod.errors.some(e=>e.includes("Production has no independently approved indexable routes")));
  page(game.path,["/en/games/"],"index, follow");
  put("/sitemap.xml",'<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+
    "<url><loc>"+origin+game.path+"</loc></url></urlset>");
  const approved=auditSeo42({outDir:root,siteUrl:origin,routes,indexableRoutes:[game],production:false});
  assert.equal(approved.ok,true,approved.errors.join("; "));
  assert.equal(approved.sitemapEntries,1);
  page(game.path,["/en/games/"],"noindex, follow");
  const conflict=auditSeo42({outDir:root,siteUrl:origin,routes,indexableRoutes:[game],production:false});
  assert(conflict.errors.some(e=>e.includes("sitemap includes noindex")));
  const unbuilt=auditSeo42({outDir:root,siteUrl:origin,routes,
    indexableRoutes:[{path:"/en/games/not-built/"}],production:false});
  assert(unbuilt.errors.some(e=>e.includes("Indexable URL must be an existing generated route")));
}finally{
  rmSync(root,{recursive:true,force:true});
}
console.log("Stage 42.2 tests OK (noindex defaults, reviewed route gate, empty sitemap, HTML audit, 21 negative approvals).");
