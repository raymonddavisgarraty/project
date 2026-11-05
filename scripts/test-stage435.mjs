import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync,mkdtempSync,rmSync,symlinkSync} from "node:fs";
import {join} from "node:path";
import {tmpdir} from "node:os";
import {createHash} from "node:crypto";
import {validateSourceManifest435} from "../src/lib/source-snapshot435.mjs";
import {inspectSnapshotBundle435,parseManifestArg435} from "./check-stage435.mjs";
import {auditCurrentRepository43} from "./editorial43.mjs";

const now="2026-11-02T16:00:00Z";
const manifest=JSON.parse(readFileSync("tests/fixtures/stage435/evidence-bundle.synthetic.json","utf8"));
const dossier=JSON.parse(readFileSync("research/evidence-pilots/sweet-bonanza-original-434.json","utf8"));
const actualSource=readFileSync("tests/fixtures/stage435/synthetic-snapshot.txt");
const factsBefore=readFileSync("src/content/games/sweet-bonanza.json","utf8");
const provenanceBefore=readFileSync("src/content/provenance/games/sweet-bonanza.json","utf8");
const sampleBefore=JSON.stringify(manifest);
const schema=JSON.parse(readFileSync("schemas/editorial/source-snapshot435.v1.schema.json","utf8"));
assert.equal(schema.$schema,"https://json-schema.org/draft/2020-12/schema");
assert.deepEqual([...schema.required].sort(),Object.keys(manifest).sort());
assert.equal(schema.properties.publicationApproved.const,false);
assert.equal(schema.properties.editorialApproved.const,false);
assert.equal(schema.properties.autoPublish.const,false);
assert.equal(schema.properties.status.const,"pending-source-review");
assert.equal(schema.properties.snapshotRecords.items.properties.authenticityStatus.const,"unverified");

const clone=()=>structuredClone(manifest);
const check=(m=manifest,changes={})=>validateSourceManifest435(m,{dossier,now,...changes});
const valid=check();
assert.equal(valid.ok,true,valid.errors.join("; "));
assert.equal(valid.claimLeadCount,0);
assert.equal(valid.sampleOnly,true);
assert.equal(valid.sourceRecords.length,1);
assert.equal(valid.approved,false);
assert.equal(valid.editorialApproved,false);
assert.equal(valid.publicationApproved,false);
assert.equal(valid.autoPublish,false);
assert.equal(valid.publicExportApproved,false);
assert.equal(manifest.snapshotRecords[0].byteLength,actualSource.length);
assert.equal(createHash("sha256").update(actualSource).digest("hex"),
  manifest.snapshotRecords[0].sha256,"Hash MUST refer to real canonical bytes");
assert.equal(actualSource.includes(13),false,"LF byte fixture must remain LF on Windows");
const realCheck=inspectSnapshotBundle435({now});
assert.equal(realCheck.ok,true,realCheck.errors.join("; "));
assert.equal(realCheck.sourceFilesChecked,1);
assert.equal(realCheck.byteIntegrityVerified,true);
for(const k of ["sourceAuthenticityVerified","editionVerified","rightsApproved",
 "editorialApproved","publicationApproved","autoPublish","publicExportApproved"])
  assert.equal(realCheck[k],false,"Integrity must NOT grant "+k);
assert(realCheck.note.includes("NOT source authorship"));
assert.equal(parseManifestArg435([]).includes("stage435"),true);
assert.equal(parseManifestArg435(["--manifest=hello"]),"hello");
assert.throws(()=>parseManifestArg435(["--approve"]),/Usage/);
assert.throws(()=>parseManifestArg435(["--manifest=a","--publish"]),/Usage/);
assert.equal(sampleBefore,JSON.stringify(manifest),"Validator must not mutate manifest");

// All mutations in these tests are IN MEMORY and do not alter any source.
const bad=[
 ["false content approval",m=>m.editorialApproved=true],
 ["false publication approval",m=>m.publicationApproved=true],
 ["auto-publish injection",m=>m.autoPublish=true],
 ["claimed source review",m=>m.snapshotRecords[0].reviewStatus="approved"],
 ["claimed authenticity",m=>m.snapshotRecords[0].authenticityStatus="verified"],
 ["claimed rights",m=>m.snapshotRecords[0].rightsStatus="approved"],
 ["unsupported version",m=>m.schemaVersion=2],
 ["source bundle wrong kind",m=>m.kind="approved-publication"],
 ["unexpected key",m=>m.telegramOffer="bonus"],
 ["bad entity identity",m=>m.entityId="other-game"],
 ["bad edition",m=>m.edition="sweet-bonanza-1000"],
 ["missing source ID",m=>m.snapshotRecords[0].sourceId=""],
 ["spoofed URL",m=>m.snapshotRecords[0].sourceUrl="https://www.pragmaticplay.com.evil.org/foo"],
 ["fake official source",m=>m.snapshotRecords[0].sourceType="first-party-announcement"],
 ["duplicate source record",m=>m.snapshotRecords.push({...m.snapshotRecords[0]})],
 ["absolute filename",m=>m.snapshotRecords[0].fileName="/tmp/a.txt"],
 ["relative traversal",m=>m.snapshotRecords[0].fileName="../a.txt"],
 ["Windows path traversal",m=>m.snapshotRecords[0].fileName="..\\secret.txt"],
 ["unsupported executable",m=>m.snapshotRecords[0].fileName="capture.exe"],
 ["extension and mime mismatch",m=>m.snapshotRecords[0].mimeType="application/pdf"],
 ["bad SHA-256",m=>m.snapshotRecords[0].sha256="bad"],
 ["wrong byte count",m=>m.snapshotRecords[0].byteLength=0],
 ["oversized declared file",m=>m.snapshotRecords[0].byteLength=9*1024*1024],
 ["future observation",m=>m.snapshotRecords[0].observedAt="2099-01-01T00:00:00Z"],
 ["source timestamp after manifest",m=>m.snapshotRecords[0].observedAt="2026-10-31T00:00:00Z"],
 ["future bundle creation",m=>m.createdAt="2099-01-01T00:00:00Z"],
 ["sample claims game facts",m=>m.claimLeads=[{field:"rtp",sourceId:"synthetic-fixture",candidateValue:96.48,qualifier:"fake",status:"candidate-only"}]],
 ["not sample but synthetic source",m=>m.sampleOnly=false],
 ["empty bundle",m=>m.snapshotRecords=[]],
 ["invented documentRevision",m=>m.snapshotRecords[0].documentRevision=""],
];
for(const [label,mutate] of bad){
  const changed=clone();mutate(changed);
  const result=check(changed);
  assert.equal(result.ok,false,label+" wrongly passed");
  assert(result.errors.length,label+" missing diagnostic");
  assert.equal(result.publicationApproved,false,label+" promoted publication");
}

// Real-source metadata is a candidate — structural correctness alone does
// NOT assert the bytes were actually captured from the claimed URL.
const candidate=clone();
candidate.sampleOnly=false;
candidate.snapshotRecords[0].sourceId="pragmatic-2019-launch";
candidate.snapshotRecords[0].sourceUrl=dossier.sources[0].url;
candidate.snapshotRecords[0].sourceType=dossier.sources[0].sourceType;
candidate.claimLeads=[{
  field:"maxWinMultiplier",sourceId:"pragmatic-2019-launch",candidateValue:21175,
  qualifier:"producer-announced-maximum",status:"candidate-only"
}];
const candidateReport=check(candidate);
assert.equal(candidateReport.ok,true,candidateReport.errors.join("; "));
assert.equal(candidateReport.approved,false);
assert.equal(candidateReport.claimLeadCount,1);
candidate.claimLeads[0].candidateValue=21100;
assert.equal(check(candidate).ok,false,"Claim value mismatch to research lead must fail");
candidate.claimLeads[0].candidateValue=21175;
candidate.claimLeads[0].status="verified";
assert.equal(check(candidate).ok,false,"No claim leads may claim verified status");

// Real byte tests, in a temporary directory; nothing inside site/project is
// created or mutated.
const root=mkdtempSync(join(tmpdir(),"stage435-"));
try{
  const localManifest=join(root,"manifest.json"),localSnap=join(root,"synthetic-snapshot.txt");
  writeFileSync(localManifest,JSON.stringify(manifest)+"\n");
  writeFileSync(localSnap,actualSource);
  assert.equal(inspectSnapshotBundle435({manifestFile:localManifest,now}).ok,true);
  writeFileSync(localSnap,Buffer.concat([actualSource,Buffer.from("TAMPER")]));
  let changed=inspectSnapshotBundle435({manifestFile:localManifest,now});
  assert.equal(changed.ok,false);
  assert(changed.errors.some(e=>e.includes("byte count")));
  writeFileSync(localSnap,Buffer.from(actualSource.toString("utf8").replaceAll("\n","\r\n")));
  changed=inspectSnapshotBundle435({manifestFile:localManifest,now});
  assert.equal(changed.ok,false,"Windows CRLF normalization must break the checksum");
  writeFileSync(localSnap,actualSource);
  const wrongHash=clone();wrongHash.snapshotRecords[0].sha256="a".repeat(64);
  writeFileSync(localManifest,JSON.stringify(wrongHash));
  changed=inspectSnapshotBundle435({manifestFile:localManifest,now});
  assert.equal(changed.ok,false);
  assert(changed.errors.some(e=>e.includes("SHA-256 mismatch")));
  writeFileSync(localManifest,JSON.stringify(manifest));
  rmSync(localSnap);
  try{
    symlinkSync("some-other-file",localSnap,"file");
    const symlink=inspectSnapshotBundle435({manifestFile:localManifest,now});
    assert.equal(symlink.ok,false);
    assert(symlink.errors.some(e=>e.includes("symlink forbidden")));
  }catch(e){
    // Windows symlink privilege can be absent. Only skip creation errors.
    if(!["EPERM","EACCES","ENOSYS"].includes(e.code))throw e;
  }
}finally{rmSync(root,{recursive:true,force:true});}
const audit=auditCurrentRepository43();
assert.equal(audit.productionReleaseAllowed,false);
assert.equal(readFileSync("src/content/games/sweet-bonanza.json","utf8"),factsBefore);
assert.equal(readFileSync("src/content/provenance/games/sweet-bonanza.json","utf8"),provenanceBefore);
console.log("Stage 43.5 tests OK (real-byte LF/SHA-256, "+bad.length+
  " negative manifest cases, source identity binding, no authenticity, rights or publication approval).");
