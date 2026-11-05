import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {inspectEntityGraph423} from "../src/lib/entity-graph423.mjs";
import {buildRoutes42} from "../src/lib/routes42.js";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
import routes from "../src/_data/publishedRoutes.js";
import audit from "../src/lib/editorial-audit433.js";
import {checkEntities423} from "./check-stage423.mjs";

const providers=JSON.parse(readFileSync("src/content/registries/providers.json","utf8"));
const real=inspectEntityGraph423({games,casinos,providers,generatedRoutes:routes});
assert.equal(real.ok,true,real.errors.join("; "));
assert.equal(real.counts.games,2);
assert.equal(real.counts.casinos,2);
assert.equal(real.counts.providers,6);
// Sweet Bonanza's unreviewed "similar game" link has been removed.
assert.equal(real.counts.identityRelations,1);
assert.equal(real.publicExportApproved,false);
assert.equal(real.publicationApproved,false);
assert.equal(real.counts.verifiedPublishedEntities,0);
assert.equal(audit.productionReleaseAllowed,false);
assert(casinos.every(c=>c.id===c.slug),"Stage 43 casino provenance still uses slug identity; migration is deferred");
assert.deepEqual(real.entities.filter(x=>x.type==="casino").map(x=>x.id).sort(),
  ["luckynova-casino","royalspin-casino"]);
assert(real.entities.every(e=>e.status==="development-identity-only"&&!e.publicExportApproved));
assert(real.relatedCandidates.every(r=>r.relationStatus==="editorial-navigation-candidate-only" &&
  r.publicRecommendationApproved===false));
assert(real.providerRegistryMatches.every(r=>r.status==="registry-identity-match-only" &&
  r.providerClaimVerified===false));
assert(real.entities.every(e=>routes.some(r=>r.entityId===e.id && r.path===e.generatedPath)));
assert.deepEqual(checkEntities423().errors,[]);

const a={id:"stable-game-a",slug:"display-a",title:"A",globalFacts:{id:"stable-game-a",slug:"display-a",providerId:"provider-1"},relatedGames:["stable-game-b"]};
const b={id:"stable-game-b",slug:"display-b",title:"B",globalFacts:{id:"stable-game-b",slug:"display-b",providerId:"provider-1"},relatedGames:[]};
const casino={id:"stable-casino",slug:"casino-url",title:"C"};
const provider={id:"provider-1",name:"Example identity only",verified:true};
const sample={games:[a,b],casinos:[casino],providers:[provider],
  generatedRoutes:buildRoutes42({games:[a,b],casinos:[casino]})};
const inspect=(changes={})=>inspectEntityGraph423({...sample,...changes});
const good=inspect();
assert.equal(good.ok,true,good.errors.join("; "));
assert.equal(good.counts.identityRelations,1);
assert.deepEqual(good.relatedCandidates.map(x=>x.targetGameId),["stable-game-b"]);
assert(good.entities.some(x=>x.id==="stable-game-a"&&x.slug==="display-a"&&
  x.generatedPath==="/en/games/display-a/"));
assert(good.entities.some(x=>x.id==="stable-casino"&&x.slug==="casino-url" &&
  x.generatedPath==="/en/casinos/casino-url/"));
assert(good.notes.some(x=>x.includes("Stage 43 audit still keys casino provenance by slug")));
assert.equal(good.publicExportApproved,false);
assert.equal(good.relatedCandidates[0].publishedUrl,undefined);
assert.equal(good.relatedCandidates[0].affiliateId,undefined);
assert.equal(good.providerRegistryMatches[0].reviewer,undefined);

const cases=[
 ["missing casino ID",{casinos:[{...casino,id:undefined}]},"missing/invalid"],
 ["bad casino ID",{casinos:[{...casino,id:"bad/id"}]},"missing/invalid"],
 ["duplicate casino ID",{casinos:[casino,{...casino,slug:"other"}]},"duplicate stable ID"],
 ["duplicate casino slug",{casinos:[casino,{...casino,id:"another"}]},"duplicate locale slug"],
 ["duplicate game ID",{games:[a,{...b,id:a.id,globalFacts:{...b.globalFacts,id:a.id}}]},"duplicate stable ID"],
 ["duplicate game slug",{games:[a,{...b,slug:a.slug,globalFacts:{...b.globalFacts,slug:a.slug}}]},"duplicate locale slug"],
 ["game identity mismatch",{games:[{...a,globalFacts:{...a.globalFacts,id:"other"}},b]},"globalFacts identity mismatch"],
 ["legacy game slug relation",{games:[{...a,relatedGames:["display-b"]},b]},"legacy slug-only relation"],
 ["unknown related game",{games:[{...a,relatedGames:["missing-id"]},b]},"unknown related game ID"],
 ["self relation",{games:[{...a,relatedGames:[a.id]},b]},"self/duplicate relation"],
 ["duplicate relation",{games:[{...a,relatedGames:[b.id,b.id]},b]},"self/duplicate relation"],
 ["unknown provider",{games:[{...a,globalFacts:{...a.globalFacts,providerId:"unknown"}},b]},"unknown provider registry ID"],
 ["missing generated route",{generatedRoutes:sample.generatedRoutes.filter(r=>r.entityId!==b.id)},"missing generated route"],
 ["wrong route slug",{generatedRoutes:sample.generatedRoutes.map(r=>r.entityId===a.id?{...r,path:"/en/games/old-display/"}:r)},"wrong localized route"],
 ["unknown generated route",{generatedRoutes:[...sample.generatedRoutes,{path:"/en/games/ghost/",entityId:"ghost",type:"game"}]},"unknown route identity"],
 ["duplicate generated route",{generatedRoutes:[...sample.generatedRoutes,sample.generatedRoutes[3]]},"duplicate/invalid generated path"],
 ["ambiguous legacy alias",{games:[a,{...b,id:"display-a",globalFacts:{...b.globalFacts,id:"display-a"}}],
    generatedRoutes:buildRoutes42({games:[a,{...b,id:"display-a",globalFacts:{...b.globalFacts,id:"display-a"}}],casinos:[casino]})},"ID conflicts with another slug"],
];
for(const [label,changes,expected] of cases){
  const actual=inspect(changes);
  assert.equal(actual.ok,false,label+" unexpectedly passed");
  assert(actual.errors.some(e=>e.includes(expected)),label+" no expected diagnostic: "+actual.errors.join("; "));
  assert.equal(actual.publicExportApproved,false,label+" unexpectedly exported");
}
assert.throws(()=>inspectEntityGraph423({games:{}}),/requires entity and route arrays/);
assert.throws(()=>buildRoutes42({casinos:[{slug:"casino-url"}]}),/explicit stable ID/);
assert.throws(()=>buildRoutes42({casinos:[casino,{...casino,slug:"new-url"}]}),/Duplicate published casino ID/);
assert.throws(()=>buildRoutes42({casinos:[{...casino,id:"BAD"}]}),/explicit stable ID/);
// The production source of truth remains Stage 43, not a successful graph audit.
assert.equal(audit.productionReleaseAllowed,false);
assert.equal(readFileSync("src/_data/indexability42.js","utf8").includes("informationApproved: false"),true);

console.log("Stage 42.3 tests OK (stable Game/Casino IDs, generated routes, ID-only relations, "+cases.length+" negative cases, no public export).");
