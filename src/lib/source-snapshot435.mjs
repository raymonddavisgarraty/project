// Stage 43.5 — inspect a PRIVATE, unapproved source-snapshot manifest.
// This module does not read files, verify source authenticity, approve claims,
// alter provenance, or publish content.
const ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const FILE=/^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:txt|html|pdf)$/;
const SHA=/^[a-f0-9]{64}$/;
const UTC=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const FIELDS=new Set(["providerId","providerName","rtp","volatility","reels",
  "paylines","paylineType","releaseYear","maxWinMultiplier","hitFrequency"]);
const TYPES=new Set(["first-party-announcement","first-party-game-page",
  "unverified-third-party-rulebook-copy","synthetic-test"]);
const MIMES=new Map([["txt","text/plain"],["html","text/html"],["pdf","application/pdf"]]);
const SAMPLE_SOURCE={
  sourceId:"synthetic-fixture",sourceType:"synthetic-test",
  url:"https://example.org/nonreal/source-snapshot-test"
};
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const timestamp=(s,now)=>{
  if(typeof s!=="string"||!UTC.test(s)||!Number.isFinite(Date.parse(s)))return false;
  return new Date(s).toISOString().slice(0,19)===s.slice(0,19) &&
    Date.parse(s)<=Date.parse(now);
};
const strict=(o,allowed,where,errors)=>{
  if(!plain(o)){errors.push(where+" must be a plain record");return false;}
  for(const k of Object.keys(o))if(!allowed.includes(k))
    errors.push(where+" unexpected field "+k);
  for(const k of allowed)if(!Object.hasOwn(o,k))
    errors.push(where+" missing field "+k);
  return true;
};
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/**
 * Validate the proposed manifest against the Stage 43.4 *research* dossier.
 *
 * This can establish that a snapshot is REPORTED as associated with a known URL.
 * It does NOT authenticate who created the file, verify its rights, or approve
 * any game fact. Byte integrity is checked separately by the offline CLI.
 */
export function validateSourceManifest435(manifest,{
  dossier,now=new Date().toISOString(),
}={}){
  const errors=[],sourceById=new Map(),snapshots=new Map(),claimed=new Set();
  if(!plain(dossier)||dossier.schemaVersion!==1||
     dossier.dossierId!=="sweet-bonanza-original-434"||
     dossier.status!=="research-only"||dossier.gameId!=="sweet-bonanza"||
     dossier.edition!=="original-sweet-bonanza-2019"||
     dossier.editorialApproved!==false||dossier.publicationApproved!==false||
     dossier.autoPublish!==false)
    errors.push("Missing or modified Stage 43.4 research dossier");
  if(!timestamp(now,now)) errors.push("Invalid UTC comparison time");
  const required=["schemaVersion","kind","bundleId","entityType","entityId","edition",
    "createdAt","sampleOnly","status","editorialApproved","publicationApproved",
    "autoPublish","snapshotRecords","claimLeads","notes"];
  if(!strict(manifest,required,"manifest",errors))
    return {ok:false,errors,sourceRecords:[],claimLeadCount:0,approved:false,autoPublish:false};
  if(manifest.schemaVersion!==1||manifest.kind!=="research-source-snapshot-bundle"||
     !ID.test(manifest.bundleId||"")||manifest.entityType!=="game"||
     manifest.entityId!=="sweet-bonanza"||
     manifest.edition!=="original-sweet-bonanza-2019"||
     manifest.status!=="pending-source-review"||
     manifest.editorialApproved!==false||manifest.publicationApproved!==false||
     manifest.autoPublish!==false||typeof manifest.sampleOnly!=="boolean")
    errors.push("Invalid source bundle identity or research-only approval flags");
  if(!timestamp(manifest.createdAt,now))
    errors.push("Invalid or future manifest timestamp");
  if(typeof manifest.notes!=="string"||manifest.notes.length<20||
     manifest.notes.length>1200) errors.push("Source bundle needs human-readable limitations");
  if(Array.isArray(dossier?.sources))
    for(const source of dossier.sources)sourceById.set(source.sourceId,source);
  if(!Array.isArray(manifest.snapshotRecords)||manifest.snapshotRecords.length<1||
     manifest.snapshotRecords.length>10) errors.push("Expected 1..10 snapshot records");
  else for(const s of manifest.snapshotRecords){
    const fields=["sourceId","sourceUrl","sourceType","fileName","mimeType",
      "observedAt","byteLength","sha256","documentRevision",
      "authenticityStatus","rightsStatus","reviewStatus"];
    if(!strict(s,fields,"snapshot",errors))continue;
    if(!ID.test(s.sourceId||"")||snapshots.has(s.sourceId))
      errors.push("Missing or duplicate snapshot sourceId");
    else snapshots.set(s.sourceId,s);
    const expected=manifest.sampleOnly?SAMPLE_SOURCE:sourceById.get(s.sourceId);
    if(!expected||s.sourceUrl!==(expected.url)||s.sourceType!==expected.sourceType||
       !TYPES.has(s.sourceType)|| (manifest.sampleOnly!== (s.sourceType==="synthetic-test")))
      errors.push("Unrecognized or misclassified original research source: "+s.sourceId);
    if(!FILE.test(s.fileName||"")||
       MIMES.get(String(s.fileName).split(".").at(-1))!==s.mimeType)
      errors.push("Snapshot file name/type invalid: "+s.sourceId);
    if(!timestamp(s.observedAt,now)||s.observedAt>manifest.createdAt)
      errors.push("Snapshot timestamp invalid or later than bundle: "+s.sourceId);
    if(!Number.isInteger(s.byteLength)||s.byteLength<1||s.byteLength>8*1024*1024||
       typeof s.sha256!=="string"||!SHA.test(s.sha256))
      errors.push("Snapshot byte length or SHA-256 invalid: "+s.sourceId);
    if(s.documentRevision!==null &&
       (typeof s.documentRevision!=="string"||s.documentRevision.length<2||
       s.documentRevision.length>100))
      errors.push("Invalid declared document revision");
    if(s.authenticityStatus!=="unverified"||
       s.rightsStatus!=="pending-review"||
       s.reviewStatus!=="candidate-only")
      errors.push("Snapshot metadata cannot grant authenticity/rights/approval");
  }
  if(!Array.isArray(manifest.claimLeads)||manifest.claimLeads.length>30||
     (!manifest.sampleOnly&&manifest.claimLeads.length===0)||
     (manifest.sampleOnly&&manifest.claimLeads.length!==0))
    errors.push("Real snapshot bundle needs proposed claim leads; synthetic sample cannot claim facts");
  else for(const c of manifest.claimLeads){
    const fields=["field","sourceId","candidateValue","qualifier","status"];
    if(!strict(c,fields,"claimLead",errors))continue;
    const key=c.sourceId+":"+c.field+":"+c.qualifier;
    if(!FIELDS.has(c.field)||!snapshots.has(c.sourceId)||!ID.test(c.qualifier||"")||
       c.status!=="candidate-only"||claimed.has(key))
      errors.push("Invalid/duplicate/nonpending claim lead: "+key);
    else claimed.add(key);
    const original=dossier?.observations?.find(o=>o.sourceId===c.sourceId&&
      o.field===c.field&&o.qualifier===c.qualifier&&same(o.candidateValue,c.candidateValue));
    if(!original)errors.push("Claim lead must match unchanged Stage 43.4 research: "+key);
  }
  return Object.freeze({
    schemaVersion:1,kind:"snapshot-manifest-assessment",
    ok:errors.length===0,errors:Object.freeze(errors),
    bundleId:manifest.bundleId,entityId:manifest.entityId,
    sampleOnly:manifest.sampleOnly,
    sourceRecords:Object.freeze([...snapshots.values()].map(s=>Object.freeze({
      sourceId:s.sourceId,fileName:s.fileName,byteLength:s.byteLength,sha256:s.sha256,
      sourceType:s.sourceType,
      authenticityStatus:"unverified",rightsStatus:"pending-review",
    }))),
    claimLeadCount:claimed.size,
    status:"candidate-integrity-review-only",
    approved:false,editorialApproved:false,publicationApproved:false,
    autoPublish:false,publicExportApproved:false,
    note:"A matching SHA-256 establishes stored-byte integrity, NOT source authenticity, legal rights, edition match or factual verification.",
  });
}
