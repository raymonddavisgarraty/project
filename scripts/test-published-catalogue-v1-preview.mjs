import assert from "node:assert/strict";
import {previewPublishedCatalogueV1} from "../src/lib/published-catalogue-v1-preview.mjs";
import {createIndexability42} from "../src/lib/indexability42.mjs";
import liveIndexability from "../src/_data/indexability42.js";
import liveGames from "../src/_data/games.js";
import liveCasinos from "../src/_data/casinos.js";
import states from "../src/content/publication-state.en.json" with {type:"json"};

const now=Date.parse("2026-11-05T12:00:00Z");
const generatedAt="2026-11-05T12:00:00Z";
const empty=previewPublishedCatalogueV1({indexability:liveIndexability,
  states:states.items,games:liveGames,casinos:liveCasinos,generatedAt});
assert.equal(empty.ok,true,empty.errors.join("; "));
assert.equal(empty.entities.games.length,0);
assert.equal(empty.entities.casinos.length,0);
assert.equal(empty.publicExportApproved,false);
assert.equal(empty.publicationApproved,false);
assert.equal(empty.previewOnly,true);
assert.equal(empty.scope.marketCodes.length,0);
const sha="a".repeat(64),path="/en/games/sample-game/";
const game={id:"sample-game",slug:"sample-game",title:"Sample Game",
  description:"Original synthetic information only",
  globalFacts:{id:"sample-game",slug:"sample-game",sourceStatus:"editorially-verified"},
  rating:4.9,affiliateId:"hidden",bonus:"hidden",editorialNotes:"never exported"};
const route={type:"game",entityId:game.id,path};
const audit={schemaVersion:1,productionReleaseAllowed:true,autoApprove:false,
  autoPublish:false,counts:{blockers:0},
  items:[{type:"game",id:game.id,releaseReady:true,blockers:[]}]};
const approval={path,type:"game",entityId:game.id,status:"approved-for-indexing",
  locale:"en",globalInformationRights:true,contentSha256:sha,
  review:{status:"approved",reviewerId:"synthetic-editor",reviewedAt:"2026-11-05T10:00:00Z"}};
const idx=createIndexability42({routes:[route],audit,approvals:[approval],
  revisionHashes:{[path]:sha},informationApproved:true,now});
assert.equal(idx.approvedRouteCount,1);
const state={type:"game",id:game.id,status:"published",
  contentSha256:sha,reviewedBy:"synthetic-editor",reviewedAt:"2026-11-05T10:00:00Z",
  informationRightsApproved:true};
const base={indexability:idx,states:[state],games:[game],casinos:[],
  revisionHashes:{[path]:sha},siteOrigin:"https://example.org",generatedAt};
const good=previewPublishedCatalogueV1(base);
assert.equal(good.ok,true,good.errors.join("; "));
assert.equal(good.entities.games.length,1);
assert.deepEqual(good.entities.games[0],{type:"game",id:"sample-game",locale:"en",
  canonicalUrl:"https://example.org/en/games/sample-game/",
  title:game.title,summary:game.description,contentRevision:sha});
for(const token of ["hidden","affiliateId","editorialNotes","rating","synthetic-editor"])
  assert(!JSON.stringify(good.entities).includes(token),"Private unapproved field: "+token);
const clone=()=>({
  ...base,indexability:idx,
  states:structuredClone(base.states),
  games:structuredClone(base.games),
  casinos:structuredClone(base.casinos),
  revisionHashes:{...base.revisionHashes},
});
const bad=[
 ["no HTTPS origin",o=>o.siteOrigin="http://example.org"],
 ["local origin",o=>o.siteOrigin="https://localhost"],
 ["missing origin",o=>o.siteOrigin=null],
 ["mismatch revision",o=>o.revisionHashes[path]="b".repeat(64)],
 ["null revision map",o=>o.revisionHashes=null],
 ["invalid authority callback",o=>o.indexability={routes:[route],approvedRouteCount:1,allows:"untrusted"}],
 ["no published status",o=>o.states[0].status="review"],
 ["no rights",o=>o.states[0].informationRightsApproved=false],
 ["missing content sha",o=>o.states[0].contentSha256=null],
 ["reviewer absent",o=>o.states[0].reviewedBy=null],
 ["wrong state entity",o=>o.states[0].id="other"],
 ["wrong game identity",o=>o.games[0].slug="wrong"],
 ["game source unverified",o=>o.games[0].globalFacts.sourceStatus="legacy-unverified"],
 ["unsafe title",o=>o.games[0].title="<script>"],
 ["unsafe summary",o=>o.games[0].description="<b>promo</b>"],
 ["duplicate status",o=>o.states.push({...o.states[0]})],
 ["extra state field",o=>o.states[0].affiliateUrl="https://bad.example"],
 ["duplicated source",o=>o.games.push({...o.games[0]})],
 ["bad generatedAt",o=>o.generatedAt="invalid"],
 ["revocation duplicate",o=>o.revoked=[{type:"game",id:game.id},{type:"game",id:game.id}]],
];
for(const [name,change] of bad){
  const o=clone();change(o);
  const r=previewPublishedCatalogueV1(o);
  assert.equal(r.ok,false,name);
  assert.equal(r.entities.games.length,0,name+" must not leak a candidate");
  assert.equal(r.publicExportApproved,false,name);
}
const revoked=previewPublishedCatalogueV1({...base,revoked:[{type:"game",id:game.id}]});
assert.equal(revoked.ok,true);
assert.equal(revoked.entities.games.length,0);
assert.deepEqual(revoked.tombstones,[{type:"game",id:game.id,locale:"en"}]);
const wrongAuthority=previewPublishedCatalogueV1({...base,indexability:{
  routes:[route],approvedRouteCount:1,allows:()=>false}});
assert.equal(wrongAuthority.ok,false);
assert.equal(wrongAuthority.entities.games.length,0);
console.log("Published Catalogue v1 offline preview tests OK ("+bad.length+
  " rejection cases, zero live records, allowlisted synthetic item, revocation; no public feed).");
