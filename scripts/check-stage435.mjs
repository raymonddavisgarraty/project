// Stage 43.5 — safe, read-only offline bytes+manifest comparison.
// Does not download, create source files, write provenance or publish.
import {readFileSync,lstatSync,realpathSync} from "node:fs";
import {createHash} from "node:crypto";
import {dirname,join,resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {validateSourceManifest435} from "../src/lib/source-snapshot435.mjs";
import {assessEvidencePilot434} from "../src/lib/evidence-pilot434.mjs";

const sampleRoot=resolve("tests/fixtures/stage435");
const privateRoot=resolve("data/editorial/evidence-snapshots");
const samplePath=join(sampleRoot,"evidence-bundle.synthetic.json");

const output=(result)=>({
  schemaVersion:1,kind:"offline-source-integrity-check",
  ok:result.ok===true,
  bundleId:result.bundleId??null,
  sampleOnly:result.sampleOnly??null,
  sourceFilesChecked:result.sourceFilesChecked??0,
  claimLeadsChecked:result.claimLeadCount??0,
  status:"candidate-integrity-review-only",
  byteIntegrityVerified:result.ok===true,
  sourceAuthenticityVerified:false,
  editionVerified:false,
  rightsApproved:false,
  editorialApproved:false,
  publicationApproved:false,
  autoPublish:false,
  publicExportApproved:false,
  errors:result.errors??[],
  note:"SHA-256 verifies captured local bytes, NOT source authorship, edition validity, legal rights or claims."
});
/**
 * Inspect a file without writing or following symlinks. In the CLI, manifests
 * are limited to either a committed synthetic test folder or a gitignored
 * private evidence folder. Callers who pass a custom path are responsible
 * for their own containing-folder policy.
 */
export function inspectSnapshotBundle435({
  manifestFile=samplePath,
  dossierFile="research/evidence-pilots/sweet-bonanza-original-434.json",
  now=new Date().toISOString(),
}={}){
  let manifest,dossier;
  try{
    const stat=lstatSync(manifestFile);
    if(!stat.isFile()||stat.isSymbolicLink()||stat.size>128*1024)
      return output({ok:false,errors:["Manifest must be a regular non-symlink JSON file of at most 128 KiB"]});
    manifest=JSON.parse(readFileSync(manifestFile,"utf8"));
    dossier=JSON.parse(readFileSync(dossierFile,"utf8"));
  }catch(e){
    return output({ok:false,errors:["Manifest or dossier read failed: "+e.message]});
  }
  // Cross-check the research dossier against the actual legacy facts and
  // Stage 43 provenance. A locally rewritten dossier is not evidence.
  let research;
  try {
    const facts=JSON.parse(readFileSync("src/content/games/sweet-bonanza.json","utf8"));
    const provenance=JSON.parse(readFileSync("src/content/provenance/games/sweet-bonanza.json","utf8"));
    research=assessEvidencePilot434({dossier,facts,provenance,now:now.slice(0,10)});
  }catch(e){
    return output({ok:false,errors:["Stage 43.4 source baseline could not be checked: "+e.message]});
  }
  if(!research.ok)
    return output({ok:false,errors:["Stage 43.4 source baseline is stale or modified",...research.errors]});
  const report=validateSourceManifest435(manifest,{dossier,now});
  if(!report.ok)return output({...report,sourceFilesChecked:0});
  const folder=realpathSync(dirname(resolve(manifestFile)));
  const errors=[];
  let count=0;
  for(const record of report.sourceRecords){
    const file=join(folder,record.fileName);
    try{
      const st=lstatSync(file);
      if(!st.isFile()||st.isSymbolicLink())
        throw new Error("not a regular file / symlink forbidden");
      if(dirname(realpathSync(file))!==folder)
        throw new Error("snapshot resolved outside the manifest folder");
      if(st.size!==record.byteLength||st.size>8*1024*1024)
        throw new Error("wrong byte count");
      const bytes=readFileSync(file);
      if(bytes.length!==record.byteLength)
        throw new Error("file byte count changed while reading");
      if(file.endsWith(".pdf")&&bytes.subarray(0,5).toString("latin1")!=="%PDF-")
        throw new Error("PDF signature mismatch");
      const digest=createHash("sha256").update(bytes).digest("hex");
      if(digest!==record.sha256)throw new Error("SHA-256 mismatch");
      count++;
    }catch(e){
      errors.push(record.sourceId+": "+e.message);
    }
  }
  return output({...report,ok:errors.length===0,errors,sourceFilesChecked:count});
}
function allowedManifestPath(path){
  // Explicit CLI only supports one local folder with basename manifest.
  // No recursive browsing, traversal, arbitrary absolute path or symlink root.
  const absolute=resolve(path),folder=dirname(absolute);
  if(folder!==sampleRoot && folder!==privateRoot)
    throw new Error("Manifest must be directly in tests/fixtures/stage435 or data/editorial/evidence-snapshots");
  // A junction/symlink in a *parent* of the checkout may be legitimate
  // (e.g. Windows cloud-backed folders). Reject only the bundle folder
  // itself if it is a symbolic link; individual files are also lstat'd.
  if(lstatSync(folder).isSymbolicLink())
    throw new Error("Snapshot folder itself must not be a symlink");
  return {absolute,sample:folder===sampleRoot};
}
export function parseManifestArg435(args){
  if(args.length===0)return samplePath;
  if(args.length!==1||!args[0].startsWith("--manifest="))
    throw new Error("Usage: node scripts/check-stage435.mjs [--manifest=path]");
  return args[0].slice("--manifest=".length);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  try{
    const {absolute,sample}=allowedManifestPath(parseManifestArg435(process.argv.slice(2)));
    const result=inspectSnapshotBundle435({manifestFile:absolute});
    // Never allow sample files to impersonate real source evidence, or vice versa.
    if(result.sampleOnly!==sample)
      result.errors.push("Sample-vs-private manifest origin mismatch");
    result.ok=result.ok&&result.errors.length===0;
    result.byteIntegrityVerified=result.ok;
    console.log(JSON.stringify(result,null,2));
    if(!result.ok)process.exitCode=1;
  }catch(e){
    console.error("Stage 43.5 rejected:",e.message);
    process.exitCode=1;
  }
}
