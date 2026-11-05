import assert from "node:assert/strict";
import {preflightReleaseScopeV1} from "../src/lib/release-scope-preflight-v1.mjs";
import liveRoutes from "../src/_data/publishedRoutes.js";
import liveAudit from "../src/lib/editorial-audit433.js";
import games from "../src/_data/games.js";
import casinos from "../src/_data/casinos.js";
const sha="a".repeat(64);
const game={id:"demo-game",slug:"demo-game",author:"reviewer-team",globalFacts:{sourceStatus:"editorially-verified"},relatedGames:[]};
const route={type:"game",path:"/en/games/demo-game/",entityId:"demo-game"};
const audit={schemaVersion:1,productionReleaseAllowed:false,autoApprove:false,autoPublish:false,items:[
  {type:"game",id:"demo-game",releaseReady:true,blockers:[],claims:[{status:"verified"}]},
  {type:"author",id:"reviewer-team",releaseReady:true,blockers:[]},
  {type:"game",id:"unrelated-unverified",releaseReady:false,blockers:[{field:"rtp"}],claims:[{status:"unverified"}]}
]};
const decision={type:"game",id:"demo-game",path:route.path,locale:"en",revisionSha256:sha,
  authorId:"reviewer-team",rights:{globalInformationRights:true,legalStatus:"approved",commercialApproved:false},
  review:{status:"approved",reviewerId:"human-reviewer",reviewedAt:"2026-10-30T10:00:00Z"},
  relatedEntityIds:[]};
const input={generatedRoutes:[route],entities:{games:[game],casinos:[]},
  audit,decisions:[decision],measuredRevisionHashes:{[route.path]:sha},
  globalInformationApproved:true,now:Date.parse("2026-11-05T12:00:00Z")};
const ok=preflightReleaseScopeV1(input);
assert.equal(ok.ok,true);
assert.equal(ok.eligibleProposals.length,1);
for(const flag of ["publicExportApproved","indexabilityApproved","publicationApproved","autoPublish"])
  assert.equal(ok[flag],false,"Preflight cannot authorize "+flag);
assert.equal(preflightReleaseScopeV1({...input,decisions:[],globalInformationApproved:false}).eligibleProposals.length,0);

const cases=[
 ["no global rights",{globalInformationApproved:false}],
 ["no measured hash",{measuredRevisionHashes:{}}],
 ["tampered revision",{decisions:[{...decision,revisionSha256:"b".repeat(64)}]}],
 ["wrong locale",{decisions:[{...decision,locale:"de"}]}],
 ["wrong path",{decisions:[{...decision,path:"/en/games/unknown/"}]}],
 ["wrong stable ID",{decisions:[{...decision,id:"other"}]}],
 ["injected affiliate",{decisions:[{...decision,affiliateUrl:"https://example.org"}]}],
 ["commerce injected",{decisions:[{...decision,rights:{...decision.rights,commercialApproved:true}}]}],
 ["unreviewed rights",{decisions:[{...decision,rights:{...decision.rights,legalStatus:"pending"}}]}],
 ["unreviewed decision",{decisions:[{...decision,review:{...decision.review,status:"pending"}}]}],
 ["future review",{decisions:[{...decision,review:{...decision.review,reviewedAt:"2099-01-01T00:00:00Z"}}]}],
 ["unverified author",{audit:{...audit,items:audit.items.filter(a=>a.type!=="author")}}],
 ["unverified source",{entities:{games:[{...game,globalFacts:{sourceStatus:"legacy-unverified"}}],casinos:[]}}],
 ["unverified claim",{audit:{...audit,items:audit.items.map(a=>a.id==="demo-game"?{...a,claims:[{status:"unverified"}]}:a)}}],
 ["duplicate decision",{decisions:[decision,decision]}],
 ["duplicate route",{generatedRoutes:[route,route]}],
 ["auto-approval injected",{audit:{...audit,autoApprove:true}}],
 ["unreviewed relation",{decisions:[{...decision,relatedEntityIds:["other-game"]}]}],
 ["legacy relation",{entities:{games:[{...game,relatedGames:["other-game"]}],casinos:[]}}],
 ["wrong author",{decisions:[{...decision,authorId:"someone-else"}]}]
];
for(const [label,delta] of cases){
  const rejected=preflightReleaseScopeV1({...input,...delta});
  assert.equal(rejected.ok,false,label);
  assert.deepEqual(rejected.eligibleProposals,[],label);
  assert(rejected.errors.length,label);
}
assert.throws(()=>preflightReleaseScopeV1({...input,decisions:{}}),/malformed/);
const live=preflightReleaseScopeV1({
  generatedRoutes:liveRoutes,entities:{games,casinos},audit:liveAudit,
  decisions:[],measuredRevisionHashes:{},globalInformationApproved:false
});
assert.equal(live.ok,true,live.errors.join("; "));
assert.deepEqual(live.eligibleProposals,[]);
assert.equal(live.publicExportApproved,false);
console.log("G2 preflight tests OK (synthetic scoped review, "+cases.length+" rejection cases, real-site zero candidates, no publication).");
