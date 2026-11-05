import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import { inspectIndependentReviewG2, reviewStatementBytesG2 } from "../src/lib/independent-review-attestations-g2.mjs";
const subject={contractVersion:1,kind:"seo-platform-release-review-subject",
  requestId:"synthetic-pilot",entityType:"game",entityId:"synthetic-game",locale:"en",
  canonicalPath:"/en/games/synthetic-game/",contentRevisionSha256:"a".repeat(64),
  sourceRevisionSha256:"b".repeat(64),scope:"public-information-review-only"};
const now=Date.parse("2026-11-05T12:00:00Z");
function make(role,id,keyId){
 const {publicKey,privateKey}=generateKeyPairSync("ed25519");
 const statement={contractVersion:1,kind:"seo-platform-g2-review-attestation",
  subject,role,reviewerId:id,keyId,decision:"approved-for-offline-review",
  reviewedAt:"2026-11-05T10:00:00Z"};
 return {key:{keyId,reviewerId:id,role,publicKeyPem:publicKey.export({format:"pem",type:"spki"}),
    active:true,notBefore:"2026-01-01T00:00:00Z",notAfter:"2027-01-01T00:00:00Z"},
  statement,privateKey};
}
const ed=make("editorial","reviewer-one","editorial-key");
const rights=make("rights","reviewer-two","rights-key");
function envelope(r){return {statement:structuredClone(r.statement),
  signature:sign(null,reviewStatementBytesG2(r.statement),r.privateKey).toString("base64url")};}
const input={subject,attestations:[envelope(ed),envelope(rights)],trustedKeys:[ed.key,rights.key],
  revokedKeyIds:[],now};
const accepted=inspectIndependentReviewG2(input);
assert.equal(accepted.ok,true,accepted.errors.join("; "));
assert.equal(accepted.verifiedSignatures,2);
for(const name of ["editorialApproved","rightsApproved","indexabilityApproved","publicationApproved",
  "publicExportApproved","autoPublish"])assert.equal(accepted[name],false,name);
const changes=[
 ["no signature",v=>v.attestations=[]],
 ["single role",v=>v.attestations.pop()],
 ["duplicated role",v=>v.attestations[1].statement.role="editorial"],
 ["duplicated reviewer",v=>v.attestations[1].statement.reviewerId="reviewer-one"],
 ["duplicated key ID",v=>v.attestations[1].statement.keyId="editorial-key"],
 ["unauthorized key",v=>v.trustedKeys.pop()],
 ["revoked key",v=>v.revokedKeyIds=["editorial-key"]],
 ["expired trusted key",v=>v.trustedKeys[0].notAfter="2026-11-01T00:00:00Z"],
 ["not-yet-valid key",v=>v.trustedKeys[0].notBefore="2026-11-06T00:00:00Z"],
 ["disabled trusted key",v=>v.trustedKeys[0].active=false],
 ["wrong trusted reviewer",v=>v.trustedKeys[0].reviewerId="someone-else"],
 ["wrong trusted role",v=>v.trustedKeys[1].role="editorial"],
 ["altered subject digest",v=>v.subject.contentRevisionSha256="c".repeat(64)],
 ["altered source digest",v=>v.subject.sourceRevisionSha256="c".repeat(64)],
 ["changed signed subject",v=>v.attestations[0].statement.subject.entityId="other-game"],
 ["signed decision changed",v=>v.attestations[0].statement.decision="approved-for-publication"],
 ["signature tampered",v=>v.attestations[1].signature="A".repeat(86)],
 ["signature malformed",v=>v.attestations[1].signature="not-base64"],
 ["future review",v=>v.attestations[0].statement.reviewedAt="2099-01-01T00:00:00Z"],
 ["other locale",v=>v.subject.locale="de"],
 ["other route",v=>v.subject.canonicalPath="/de/games/synthetic-game/"],
 ["unsigned affiliate override",v=>v.attestations[0].affiliateUrl="https://example.org"],
 ["signed extra flag",v=>v.attestations[0].statement.publicationApproved=true],
 ["subject extra flag",v=>v.subject.publicationApproved=true],
 ["invalid request",v=>v.subject.requestId="../secret"],
 ["trust store injection",v=>v.trustedKeys[0].privateKey="secret"],
 ["cross-role key swap",v=>{const t=v.attestations[0].statement.keyId;v.attestations[0].statement.keyId=v.attestations[1].statement.keyId;v.attestations[1].statement.keyId=t;}],
 ["duplicate trust IDs",v=>v.trustedKeys.push(structuredClone(v.trustedKeys[0]))],
];
for(const [name,change] of changes){
 const v=structuredClone(input);change(v);
 const result=inspectIndependentReviewG2(v);
 assert.equal(result.ok,false,name+" should fail");
 assert(result.errors.length,name+" diagnostics");
 assert.equal(result.publicExportApproved,false,name+" must not export");
}
assert.equal(inspectIndependentReviewG2({subject,attestations:[],trustedKeys:[]}).ok,false);
console.log("G2.4 signed review attestations tests OK ("+changes.length+
 " negative cases, independent Ed25519 roles, no release).");
