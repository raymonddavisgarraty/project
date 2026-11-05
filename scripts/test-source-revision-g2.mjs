import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { requiredSourcePathsG2, snapshotSourceRevisionG2, inspectSourceRevisionG2 }
  from "../src/lib/source-revision-g2.mjs";

const data = {entityType:"game", entityId:"synthetic-game", slug:"synthetic-game", authorId:"review-team"};
const paths = requiredSourcePathsG2(data);
assert.equal(paths.length, 9);
const root = mkdtempSync(join(tmpdir(), "g2-source-"));
try {
  for(const path of paths) {
    const file=join(root,path);mkdirSync(dirname(file), {recursive:true});
    writeFileSync(file, "synthetic fixture for "+path+"\n");
  }
  const snapshot = snapshotSourceRevisionG2({root,...data});
  assert.equal(snapshot.status,"pending-independent-review");
  assert.match(snapshot.fingerprint,/^[a-f0-9]{64}$/);
  const valid = inspectSourceRevisionG2({root, manifest:snapshot});
  assert.equal(valid.ok,true,valid.errors.join("; "));
  assert.equal(valid.checked,9);
  for(const name of ["sourceAuthenticityVerified","rightsApproved","editorialApproved",
    "indexabilityApproved","publicationApproved","publicExportApproved","autoPublish"]) {
    assert.equal(valid[name],false,name);
    assert.equal(snapshot[name],false,name);
  }
  const clone=()=>structuredClone(snapshot);
  const cases=[
    ["claimed approval",m=>m.editorialApproved=true],
    ["rights claim",m=>m.rightsApproved=true],
    ["export claim",m=>m.publicExportApproved=true],
    ["auto publish claim",m=>m.autoPublish=true],
    ["index claim",m=>m.indexabilityApproved=true],
    ["authenticity claim",m=>m.sourceAuthenticityVerified=true],
    ["publication claim",m=>m.publicationApproved=true],
    ["added unknown field",m=>m.affiliateUrl="https://example.org/"],
    ["wrong version",m=>m.schemaVersion=2],
    ["marked approved",m=>m.status="approved"],
    ["locale differs",m=>m.locale="de"],
    ["entity differs",m=>m.entityId="other-game"],
    ["untrusted fingerprint",m=>m.fingerprint="b".repeat(64)],
    ["invalid fingerprint",m=>m.fingerprint="bad"],
    ["wrong hash",m=>m.files[0].sha256="b".repeat(64)],
    ["wrong byte count",m=>m.files[0].byteLength=3],
    ["missing file",m=>m.files.pop()],
    ["duplicated file",m=>m.files.push({...m.files[0]})],
    ["path traversal",m=>m.files[0].path="../out.txt"],
    ["reordered file",m=>m.files.reverse()],
    ["extra file key",m=>m.files[0].approved=true],
    ["wrong author ID",m=>m.authorId="other-team"],
  ];
  for(const [name,change] of cases) {
    const m=clone();change(m);
    const result=inspectSourceRevisionG2({root,manifest:m});
    assert.equal(result.ok,false,name);
    assert(result.errors.length,name);
    assert.equal(result.publicExportApproved,false,name);
  }
  const file = join(root,paths[0]),initial=readFileSync(file);
  writeFileSync(file, Buffer.concat([initial,Buffer.from("ALTERED")]));
  assert.equal(inspectSourceRevisionG2({root,manifest:snapshot}).ok,false,"modified source must fail");
  writeFileSync(file,initial);
  assert.equal(inspectSourceRevisionG2({root,manifest:snapshot}).ok,true);
  assert.throws(()=>requiredSourcePathsG2({...data,entityId:"../secret"}),/Unsupported/);
  assert.throws(()=>requiredSourcePathsG2({...data,entityType:"casino",entityId:"other"}),/migration/);
  assert.throws(()=>snapshotSourceRevisionG2({...data,root:join(root,"missing")}));
  const casino={entityType:"casino", entityId:"sample-casino", slug:"sample-casino", authorId:"review-team"};
  assert.equal(requiredSourcePathsG2(casino).length,7);
  console.log("G2.3 source revision tests OK ("+cases.length+" manifest rejections, byte drift, no export).");
}finally{rmSync(root,{recursive:true,force:true});}
