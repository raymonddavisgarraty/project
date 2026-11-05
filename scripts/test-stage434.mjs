import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assessEvidencePilot434} from "../src/lib/evidence-pilot434.mjs";
import {checkEvidencePilot434} from "./check-stage434.mjs";
import {auditCurrentRepository43} from "./editorial43.mjs";

const dossier=JSON.parse(readFileSync("research/evidence-pilots/sweet-bonanza-original-434.json","utf8"));
const facts=JSON.parse(readFileSync("src/content/games/sweet-bonanza.json","utf8"));
const provenance=JSON.parse(readFileSync("src/content/provenance/games/sweet-bonanza.json","utf8"));
const before=[JSON.stringify(dossier),JSON.stringify(facts),JSON.stringify(provenance)];
const assess=(d=dossier,changes={})=>assessEvidencePilot434({dossier:d,facts,provenance,now:"2026-11-02",...changes});
const real=assess();
assert.equal(real.ok,true,real.errors.join("; "));
assert.deepEqual(real.counts,{matches:4,discrepancies:1,conflicts:1,configurationAmbiguities:1,missingSources:3});
assert.equal(real.sourceLeadCount,3);
assert.equal(real.rows.length,10);
const row=field=>real.rows.find(x=>x.field===field);
assert.equal(row("maxWinMultiplier").status,"candidate-discrepancy");
assert.deepEqual(row("maxWinMultiplier").candidateValues,[21175]);
assert.equal(row("maxWinMultiplier").baselineValue,21100);
assert.equal(row("volatility").status,"conflicting-research-leads");
assert.deepEqual(row("volatility").candidateValues,["high","medium"]);
assert.equal(row("rtp").status,"configuration-ambiguous");
assert.deepEqual(row("rtp").candidateValues,[96.51,96.48]);
assert.equal(row("hitFrequency").status,"needs-source");
assert.equal(row("providerId").status,"needs-source");
assert(real.rows.every(x=>x.approved===false));
for(const f of ["editorialApproved","publicationApproved","publicExportApproved","autoPublish","provenanceModified"])
  assert.equal(real[f],false);
assert.deepEqual(before,[JSON.stringify(dossier),JSON.stringify(facts),JSON.stringify(provenance)]);
assert.equal(checkEvidencePilot434().ok,true);

const cases=[
 ["editorial approved",p=>p.editorialApproved=true],
 ["publication approved",p=>p.publicationApproved=true],
 ["auto publish",p=>p.autoPublish=true],
 ["research promoted",p=>p.status="verified"],
 ["unsupported schema",p=>p.schemaVersion=2],
 ["wrong game",p=>p.gameId="another-game"],
 ["wrong edition",p=>p.edition="sweet-bonanza-1000"],
 ["unknown root field",p=>p.affiliateUrl="https://example.org"],
 ["future research date",p=>p.observedOn="2099-01-01"],
 ["source hijack",p=>p.sources[0].url="https://evil.example.org"],
 ["source domain impersonation",p=>p.sources[0].url="https://www.pragmaticplay.com.evil.org/news"],
 ["fake source approval",p=>p.sources[0].reviewStatus="approved"],
 ["fake rights",p=>p.sources[0].rightsStatus="approved"],
 ["fake snapshot",p=>p.sources[0].snapshotSha256="a".repeat(64)],
 ["mirror impersonates primary",p=>p.sources[2].sourceType="first-party-announcement"],
 ["duplicate source",p=>p.sources[2].sourceId=p.sources[0].sourceId],
 ["future source publication date",p=>p.sources[0].publishedOn="2099-01-01"],
 ["unknown evidence source",p=>p.observations[0].sourceId="unlisted"],
 ["duplicate observation",p=>p.observations.push({...p.observations[0]})],
 ["unsupported observation field",p=>p.observations[0].field="affiliateId"],
 ["injected verified claim",p=>p.observations[0].approved=true],
 ["missing candidate",p=>p.observations[0].candidateValue=null],
 ["missing research notes",p=>p.observations[0].note=""],
 ["no outstanding questions",p=>p.questions=[]],
 ["missing caveat",p=>p.disclaimer="Now published"],
 ["baseline fact tamper",p=>p.baselineFacts.maxWinMultiplier=21175],
];
for(const [label,mutate] of cases){
  const candidate=structuredClone(dossier);mutate(candidate);
  const result=assess(candidate);
  assert.equal(result.ok,false,label);
  assert(result.errors.length,label+" must have diagnostics");
  assert.equal(result.publicationApproved,false,label+" must never approve a publication");
}
const editedProv=structuredClone(provenance);
editedProv.fields.reels.status="verified";
assert.equal(assess(dossier,{provenance:editedProv}).ok,false);
assert.equal(assess(dossier,{facts:{...facts,rtp:96.51}}).ok,false);
const audit=auditCurrentRepository43();
assert.equal(audit.productionReleaseAllowed,false);
assert(audit.counts.unverified>0&&audit.counts.blockers>0);
assert.equal(facts.maxWinMultiplier,21100);
assert.equal(facts.rtp,96.48);
assert.equal(facts.sourceStatus,"legacy-unverified");
console.log("Stage 43.4 tests OK (3 sources, 10 fields, "+cases.length+
  " negative cases, unchanged provenance, no approval or publication).");
