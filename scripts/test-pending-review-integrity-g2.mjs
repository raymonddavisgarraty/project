import assert from "node:assert/strict";
import {canonicalJsonG2,fingerprintPendingPayloadG2,inspectReviewRequestG2} from "../src/lib/pending-review-integrity-g2.mjs";
const sha="a".repeat(64);
const payload={
  contractVersion:1,kind:"seo-platform-pending-review-payload",
  entityType:"game",entityId:"synthetic-game",locale:"en",
  canonicalPath:"/en/games/synthetic-game/",marketScope:"unresolved",
  publicContent:{title:"Synthetic example only",summary:"Not published",facts:{rtp:null,reels:5}},
  evidenceDigests:[{sourceId:"test-source",sha256:sha,status:"pending-verification"}],
  relatedEntityIds:[]
};
const digest=fingerprintPendingPayloadG2(payload);
assert.match(digest,/^[a-f0-9]{64}$/);
const reversed={...payload,publicContent:{facts:{reels:5,rtp:null},summary:"Not published",title:"Synthetic example only"}};
assert.equal(fingerprintPendingPayloadG2(reversed),digest,"object key order must be stable");
assert.equal(canonicalJsonG2({b:2,a:1}),canonicalJsonG2({a:1,b:2}));
assert.notEqual(fingerprintPendingPayloadG2({...payload,publicContent:{...payload.publicContent,summary:"Changed"}}),digest);
const manifest={
  contractVersion:1,kind:"seo-platform-pending-review-request",
  requestId:"synthetic-pilot-request",createdAt:"2026-11-05T10:00:00Z",
  sampleOnly:true,status:"pending-independent-review",
  items:[{entityType:"game",entityId:"synthetic-game",locale:"en",
    canonicalPath:"/en/games/synthetic-game/",payloadSha256:digest,
    status:"pending-independent-review"}],
  editorialApproved:false,rightsApproved:false,indexabilityApproved:false,
  publicationApproved:false,publicExportApproved:false,autoPublish:false
};
const input={manifest,payloads:[payload],now:Date.parse("2026-11-05T12:00:00Z")};
const good=inspectReviewRequestG2(input);
assert.equal(good.ok,true,good.errors.join("; "));
assert.equal(good.checked,1);
for(const key of ["editorialApproved","rightsApproved","indexabilityApproved",
  "publicationApproved","publicExportApproved","autoPublish"])
  assert.equal(good[key],false,key+" must remain denied");
const copy=o=>structuredClone(o);
const changes=[
 ["manifest grants publication",(m,p)=>m.publicationApproved=true],
 ["manifest grants indexation",(m,p)=>m.indexabilityApproved=true],
 ["manifest grants public export",(m,p)=>m.publicExportApproved=true],
 ["manifest grants editorial approval",(m,p)=>m.editorialApproved=true],
 ["manifest grants source rights",(m,p)=>m.rightsApproved=true],
 ["manifest grants auto publish",(m,p)=>m.autoPublish=true],
 ["approved status",(m,p)=>m.status="approved"],
 ["future creation",(m,p)=>m.createdAt="2099-01-01T00:00:00Z"],
 ["unknown contract",(m,p)=>m.contractVersion=2],
 ["extra approval injected",(m,p)=>m.reviewerApproval=true],
 ["wrong locale",(m,p)=>m.items[0].locale="de"],
 ["wrong ID",(m,p)=>m.items[0].entityId="other"],
 ["wrong route",(m,p)=>m.items[0].canonicalPath="/en/games/other/"],
 ["wrong digest",(m,p)=>m.items[0].payloadSha256="b".repeat(64)],
 ["payload changed",(m,p)=>p[0].publicContent.summary="Changed text"],
 ["payload invents rights",(m,p)=>p[0].rightsApproved=true],
 ["evidence marked verified",(m,p)=>p[0].evidenceDigests[0].status="verified"],
 ["unknown evidence",(m,p)=>p[0].evidenceDigests[0].sourceId="bad/id"],
 ["hidden related link",(m,p)=>p[0].relatedEntityIds=["other-game"]],
 ["market approved by caller",(m,p)=>p[0].marketScope="global-approved"],
 ["duplicate record",(m,p)=>{m.items.push({...m.items[0]});p.push({...p[0]});}],
 ["manifest publishes item",(m,p)=>m.items[0].status="published"],
 ["wrong content type",(m,p)=>p[0].publicContent.title=null],
 ["invalid fact number",(m,p)=>p[0].publicContent.facts.rtp=Infinity],
];
for(const [label,mutate] of changes){
  const m=copy(manifest),p=copy([payload]);mutate(m,p);
  const result=inspectReviewRequestG2({manifest:m,payloads:p,now:input.now});
  assert.equal(result.ok,false,label+" incorrectly passed");
  assert(result.errors.length,label+" has no diagnostic");
  assert.equal(result.publicExportApproved,false,label+" exposed a public feed");
}
assert.throws(()=>canonicalJsonG2({bad:undefined}),/unsupported JSON/);
assert.throws(()=>canonicalJsonG2({bad:NaN}),/noncanonical number/);
assert.throws(()=>canonicalJsonG2({bad:-0}),/noncanonical number/);
assert.throws(()=>canonicalJsonG2(new Date()),/unsupported JSON object prototype/);
assert.throws(()=>canonicalJsonG2(JSON.parse('{"__proto__":"evil"}')),/unsafe object key/);
const cyclic={};cyclic.self=cyclic;
assert.throws(()=>canonicalJsonG2(cyclic),/cyclic/);
assert.equal(inspectReviewRequestG2({manifest:{},payloads:[]}).ok,false);
console.log("G2.2 pending review integrity tests OK ("+changes.length+
  " rejection cases, deterministic SHA-256, no approval/export).");
