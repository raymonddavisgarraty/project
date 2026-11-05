// G2.2 — Deterministic integrity fingerprints for OFFLINE pending review requests.
// Never verifies source authenticity, editorial approval, market rights or publication.
import { createHash } from "node:crypto";

const ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA=/^[a-f0-9]{64}$/;
const UTC=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const VALID_TYPES=new Set(["game","casino"]);
const isObject=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const keysExactly=(v,keys)=>isObject(v)&&Object.keys(v).length===keys.length&&
  keys.every(k=>Object.hasOwn(v,k));
const RESULT_FLAGS=Object.freeze({
  editorialApproved:false,rightsApproved:false,indexabilityApproved:false,
  publicationApproved:false,publicExportApproved:false,autoPublish:false,
});
const isTimestamp=(v,now)=>typeof v==="string"&&UTC.test(v)&&Number.isFinite(Date.parse(v))&&
  new Date(v).toISOString().slice(0,19)===v.slice(0,19)&&Date.parse(v)<=now;
const pathMatches=(type,path)=>
  typeof path==="string"&&new RegExp("^/en/"+(type==="game"?"games":"casinos")+
    "/[a-z0-9]+(?:-[a-z0-9]+)*/$").test(path);

// Deterministic JSON for Node.js input. This is NOT a cross-language RFC 8785
// implementation; consumers must not recompute these hashes using arbitrary JSON encoders.
export function canonicalJsonG2(value){
  const seen=new Set();
  function encode(v){
    if(v===null)return "null";
    if(typeof v==="string"||typeof v==="boolean")return JSON.stringify(v);
    if(typeof v==="number"){
      if(!Number.isFinite(v)||Object.is(v,-0))throw new Error("noncanonical number");
      return JSON.stringify(v);
    }
    if(typeof v!=="object")throw new Error("unsupported JSON value");
    if(seen.has(v))throw new Error("cyclic/shared JSON reference");
    if(!Array.isArray(v)&&Object.getPrototypeOf(v)!==Object.prototype&&
       Object.getPrototypeOf(v)!==null)throw new Error("unsupported JSON object prototype");
    seen.add(v);
    let s;
    if(Array.isArray(v)){
      if(v.length>2000)throw new Error("array too large");
      s="["+v.map(encode).join(",")+"]";
    }else{
      const keys=Object.keys(v).sort();
      if(keys.length>1000)throw new Error("object too large");
      if(keys.some(k=>["__proto__","prototype","constructor"].includes(k)))
        throw new Error("unsafe object key");
      s="{"+keys.map(k=>JSON.stringify(k)+":"+encode(v[k])).join(",")+"}";
    }
    seen.delete(v);
    return s;
  }
  const s=encode(value);
  if(Buffer.byteLength(s,"utf8")>512*1024)throw new Error("payload too large");
  return s;
}

function inspectPayload(payload){
  const errors=[];
  if(!keysExactly(payload,["contractVersion","kind","entityType","entityId",
    "locale","canonicalPath","publicContent","evidenceDigests","relatedEntityIds","marketScope"])){
    return ["invalid review payload fields"];
  }
  if(payload.contractVersion!==1||payload.kind!=="seo-platform-pending-review-payload"||
     !VALID_TYPES.has(payload.entityType)||!ID.test(payload.entityId||"")||
     payload.locale!=="en"||!pathMatches(payload.entityType,payload.canonicalPath)||
     payload.marketScope!=="unresolved")errors.push("invalid identity, locale, route or pending scope");
  if(!keysExactly(payload.publicContent,["title","summary","facts"])||
     typeof payload.publicContent.title!=="string"||
     payload.publicContent.title.trim().length===0||
     typeof payload.publicContent.summary!=="string"||
     !isObject(payload.publicContent.facts)){
    errors.push("invalid content fields");
  }
  if(!Array.isArray(payload.evidenceDigests)||payload.evidenceDigests.length<1||
     payload.evidenceDigests.length>20){
    errors.push("evidence digest metadata required");
  }else{
    const ids=new Set();
    for(const e of payload.evidenceDigests){
      if(!keysExactly(e,["sourceId","sha256","status"])||
         !ID.test(e.sourceId||"")||!SHA.test(e.sha256||"")||
         e.status!=="pending-verification"||ids.has(e.sourceId))
        errors.push("invalid/duplicate unapproved evidence digest");
      else ids.add(e.sourceId);
    }
  }
  if(!Array.isArray(payload.relatedEntityIds)||payload.relatedEntityIds.length!==0)
    errors.push("relations must remain unapproved in this version");
  try{canonicalJsonG2(payload);}catch(e){errors.push("noncanonical JSON: "+e.message);}
  return errors;
}

export function fingerprintPendingPayloadG2(payload){
  const errors=inspectPayload(payload);
  if(errors.length)throw new Error("G2 pending payload rejected: "+errors.join("; "));
  return createHash("sha256").update(canonicalJsonG2(payload),"utf8").digest("hex");
}

// The request manifest is always PENDING. Its integrity can be checked,
// but neither a matching fingerprint nor a user-supplied 'approval' is trusted.
export function inspectReviewRequestG2({manifest,payloads=[],now=Date.now()}={}){
  const errors=[],seen=new Set();
  if(!Number.isFinite(now))throw new Error("Invalid comparison time");
  if(!keysExactly(manifest,["contractVersion","kind","requestId","createdAt",
    "sampleOnly","status","items","editorialApproved","rightsApproved",
    "indexabilityApproved","publicationApproved","publicExportApproved","autoPublish"])){
    return Object.freeze({ok:false,checked:0,errors:["invalid manifest fields"],...RESULT_FLAGS});
  }
  if(manifest.contractVersion!==1||manifest.kind!=="seo-platform-pending-review-request"||
     !ID.test(manifest.requestId||"")||!isTimestamp(manifest.createdAt,now)||
     typeof manifest.sampleOnly!=="boolean"||manifest.status!=="pending-independent-review")
    errors.push("invalid pending manifest identity or timestamp");
  for(const flag of Object.keys(RESULT_FLAGS))if(manifest[flag]!==false)
    errors.push("manifest cannot grant "+flag);
  if(!Array.isArray(payloads)||!Array.isArray(manifest.items)||
     manifest.items.length<1||manifest.items.length>50||payloads.length!==manifest.items.length)
    errors.push("exactly 1..50 matching manifest items and payloads required");
  else{
    for(let i=0;i<manifest.items.length;i++){
      const item=manifest.items[i],payload=payloads[i];
      if(!keysExactly(item,["entityType","entityId","locale","canonicalPath",
        "payloadSha256","status"])||item.status!=="pending-independent-review"){
        errors.push("invalid/published manifest item "+i);continue;
      }
      const key=item.entityType+":"+item.entityId;
      if(seen.has(key)){errors.push("duplicate identity "+key);continue;}
      seen.add(key);
      if(item.entityType!==payload?.entityType||item.entityId!==payload?.entityId||
         item.locale!==payload?.locale||item.canonicalPath!==payload?.canonicalPath||
         !SHA.test(item.payloadSha256||"")){
        errors.push("identity/path/hash mismatch for item "+i);continue;
      }
      try{
        if(fingerprintPendingPayloadG2(payload)!==item.payloadSha256)
          errors.push("changed payload revision: "+key);
      }catch(e){errors.push("invalid payload "+key+": "+e.message);}
    }
  }
  return Object.freeze({
    contractVersion:1,kind:"offline-pending-review-integrity-only",
    ok:errors.length===0,checked:seen.size,
    errors:Object.freeze(errors),
    ...RESULT_FLAGS,
    note:"Matches SHA-256 of proposed JSON content only; no source authenticity, human approval or publication rights."
  });
}
