import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {validateStudioCandidateV1,toStage33PreviewV1} from "./contract-v1.mjs";
import {qualityReport} from "../importer/quality33.mjs";
import {loadRegistries,propose36} from "../importer/registry36.mjs";

const fixturePath="tests/fixtures/integration/studio-game-candidate.pending.v1.json";
const sample=JSON.parse(readFileSync(fixturePath,"utf8"));
const snapshot=readFileSync("tests/fixtures/integration/synthetic-source-snapshot.txt");
const cloned=()=>structuredClone(sample);
const fixedNow={now:"2026-10-30T00:00:00Z"};

assert.equal(createHash("sha256").update(snapshot).digest("hex"),sample.sourceSnapshots[0].sha256,
  "Fixture snapshot hash must refer to the actual synthetic fixture bytes");
const schema=JSON.parse(readFileSync("schemas/integration/game-candidate.v1.schema.json","utf8"));
assert.equal(schema.$schema,"https://json-schema.org/draft/2020-12/schema");
assert.equal(schema.properties.contractVersion.const,1);
assert.equal(schema.properties.autoPublish.const,false);
assert.equal(schema.properties.publicationApproved.const,false);
assert.deepEqual(Object.keys(sample).sort(),schema.required.slice().sort());

assert.deepEqual(validateStudioCandidateV1(sample,fixedNow),{valid:true,errors:[]});
const preview=toStage33PreviewV1(sample,fixedNow);
assert.equal(preview.schemaVersion,2);
assert.equal(preview.status,"pending-review");
assert.equal(preview.autoPublish,false);
assert.equal(preview.contractContext.stage34ImportCompatible,false);
assert.equal(preview.contractContext.relationsAreOnlyProposals,true);
assert(!("editorialBrief" in preview));
assert(!("relatedEntityCandidates" in preview));
assert(!("approved" in preview));
assert(!("publicationApproved" in preview));
preview.facts.title="Mutated ONLY in-memory";
assert.equal(sample.proposedFacts.title,"Synthetic Demo Game (Not for Publication)");

const normal=toStage33PreviewV1(sample,fixedNow);
const quality=qualityReport(normal,{today:"2026-10-30"});
assert.equal(quality.status,"ready-for-editorial-review");
assert.equal(quality.autoPublish,false);
const proposal=propose36(normal,await loadRegistries());
assert.equal(proposal.provider.status,"matched");
assert.equal(proposal.provider.id,"pragmatic-play");
assert.equal(proposal.reviewRequired,true);
assert.equal(proposal.autoPublish,false);
assert.deepEqual(proposal.issues,[]);

// Mutations below only change in-memory clones; no user/project file is written.
const cases=[
 ["autoPublish true",p=>p.autoPublish=true],
 ["publicationApproved true",p=>p.publicationApproved=true],
 ["approval injection",p=>p.approval={status:"approved"}],
 ["wrong contract version",p=>p.contractVersion=2],
 ["unknown kind",p=>p.kind="published-article"],
 ["unsupported casino type",p=>p.entityType="casino"],
 ["unsupported locale",p=>p.locale="de"],
 ["approved overall status",p=>p.status="approved"],
 ["missing facts title",p=>delete p.proposedFacts.title],
 ["missing required title source",p=>p.claims=p.claims.filter(c=>c.field!=="title")],
 ["contradicting claim",p=>p.claims[2].value=6],
 ["claim marked verified",p=>p.claims[0].verificationStatus="verified"],
 ["claim added twice",p=>p.claims.push({...p.claims[0]})],
 ["missing evidence reference",p=>p.claims[0].sourceIds=["nonexistent"]],
 ["duplicate source ID",p=>p.sourceSnapshots.push({...p.sourceSnapshots[0]})],
 ["invalid SHA-256",p=>p.sourceSnapshots[0].sha256="0"],
 ["http source",p=>p.sourceSnapshots[0].url="http://example.org/demo"],
 ["private source",p=>p.sourceSnapshots[0].url="https://127.0.0.1/demo"],
 ["future source",p=>p.sourceSnapshots[0].observedAt="2099-01-01T00:00:00Z"],
 ["future createdAt",p=>p.createdAt="2099-01-01T00:00:00Z"],
 ["non-sample placeholder",p=>p.sampleOnly=false],
 ["invalid release",p=>p.proposedFacts.releaseDate="2026-02-31"],
 ["out-of-range RTP",p=>p.proposedFacts.rtp=110],
 ["unknown taxonomy",p=>p.proposedFacts.features=["Fake-ID"]],
 ["wrong relation approval",p=>p.relatedEntityCandidates[0].status="approved"],
 ["self-relation",p=>p.relatedEntityCandidates[0].targetEntityId=p.entityId],
 ["duplicate relation",p=>p.relatedEntityCandidates.push({...p.relatedEntityCandidates[0]})],
 ["unauthorized affiliate ID",p=>p.affiliateId="partner"],
 ["unreviewed editor decision",p=>p.reviewer="Editor"],
 ["empty source list",p=>p.sourceSnapshots=[]],
];
for(const [label,change] of cases){
  const mutated=cloned();change(mutated);
  const report=validateStudioCandidateV1(mutated,fixedNow);
  assert.equal(report.valid,false,label+" must be rejected");
  assert(report.errors.length>0,label+" needs an actionable diagnostic");
  assert.throws(()=>toStage33PreviewV1(mutated,fixedNow),/rejected/,label);
}
assert.equal(validateStudioCandidateV1(null,fixedNow).valid,false);
assert.equal(validateStudioCandidateV1([],fixedNow).valid,false);
assert.equal(validateStudioCandidateV1({...sample,entityId:"bad/id"},fixedNow).valid,false);
assert.equal(validateStudioCandidateV1({...sample,revision:0},fixedNow).valid,false);

// Stage 34 is host-specific: no external Studio source may claim to be
// a direct latestcasinobonuses.bet candidate. A separate reviewed adapter
// is required before the contract can pass to the manual approval pipeline.
const stage34=readFileSync("scripts/importer/review34.mjs","utf8");
assert(stage34.includes("latestcasinobonuses.bet"));
assert.equal(new URL(sample.sourceSnapshots[0].url).hostname,"example.org");
assert.equal(sample.publicationApproved,false);
assert.equal(sample.autoPublish,false);

console.log("Stage 42 Studio contract v1 tests OK (schema alignment, real snapshot hash, Stage 33/36 preview, "+cases.length+" rejection cases, zero publishing).");
