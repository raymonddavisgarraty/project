// Published Catalogue v1 — offline consumer shape only.
// This code does not issue publication approval, write files, or expose an API.
// The actual live indexability42 allowlist must be independently reviewed.
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SHA = /^[a-f0-9]{64}$/;
const TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const exact = (x,keys) => x!==null && typeof x==="object" && !Array.isArray(x) &&
  Object.keys(x).length===keys.length && keys.every(k=>Object.hasOwn(x,k));
const STATUS = ["type","id","status","contentSha256","reviewedBy","reviewedAt","informationRightsApproved"];
const names=()=>({games:[],providers:[],casinos:[],articles:[],categories:[],offers:[]});
function validOrigin(raw) {
  if(typeof raw!=="string")return null;
  try {
    const u=new URL(raw);
    if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash||u.pathname!=="/"||
       u.origin!==raw||u.hostname==="localhost"||u.hostname.endsWith(".local"))return null;
    return u.origin;
  }catch{return null;}
}
function safeCopy(v,max) {
  return typeof v==="string" && v.trim().length>0 && v.length<=max &&
    !/[<>]/.test(v) ? v.trim():null;
}
// Node Date#toISOString() always includes milliseconds; contract timestamps
// use whole seconds. Compare normalized whole-second UTC, never raw ISO strings.
const date=v=>typeof v==="string" && TIME.test(v) &&
  Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,19)+"Z"===v;

export function previewPublishedCatalogueV1({
  indexability, states=[], games=[], casinos=[], revisionHashes={},
  siteOrigin=null, generatedAt="2026-11-05T00:00:00Z", revoked=[],
}={}) {
  const errors=[],entries=[], tombstones=[], entities=names();
  if(!Array.isArray(states)||!Array.isArray(games)||!Array.isArray(casinos)||
     !Array.isArray(revoked)||revisionHashes===null||typeof revisionHashes!=="object"||
     Array.isArray(revisionHashes)||
     !date(generatedAt)) errors.push("Invalid catalogue inputs");
  const allowed=indexability?.routes;
  if(!Array.isArray(allowed) || !Number.isInteger(indexability?.approvedRouteCount) ||
     indexability.approvedRouteCount!==allowed.length ||
     typeof indexability.allows!=="function")errors.push("Missing trusted indexability projection");
  const stateMap=new Map(),sources=new Map(),revocations=new Set();
  if(Array.isArray(states))for(const s of states){
    if(!s||!["game","casino"].includes(s.type)||!ID.test(s.id||"")||
       !["draft","review","published","archived"].includes(s.status)||
       !exact(s,s.status==="published"?STATUS:["type","id","status"])){
      errors.push("Malformed status record");continue;
    }
    const key=s.type+":"+s.id;
    if(stateMap.has(key))errors.push("Duplicate status identity");
    else stateMap.set(key,s);
  }
  for(const [type,records] of [["game",games],["casino",casinos]]){
    if(!Array.isArray(records))continue;
    for(const e of records) {
      if(!ID.test(e?.id||"")||!ID.test(e?.slug||"")){errors.push("Invalid entity identity");continue;}
      const key=type+":"+e.id;
      if(sources.has(key))errors.push("Duplicate entity identity");
      else sources.set(key,e);
    }
  }
  if(Array.isArray(revoked))for(const entry of revoked){
    if(!exact(entry,["type","id"])||!["game","casino"].includes(entry.type)||
      !ID.test(entry.id||"")){errors.push("Malformed revocation");continue;}
    const key=entry.type+":"+entry.id;
    if(revocations.has(key))errors.push("Duplicate revocation");
    else revocations.add(key);
  }
  const origin=validOrigin(siteOrigin);
  if(Array.isArray(allowed)&&allowed.some(r=>r?.type==="game"||r?.type==="casino")&&!origin)
    errors.push("HTTPS canonical site origin is required for any candidate");
  const paths=new Set(),keys=new Set();
  if(Array.isArray(allowed))for(const route of allowed){
    if(!route||typeof route.path!=="string"||paths.has(route.path)||
       !(typeof indexability?.allows==="function" && indexability.allows(route.path))){errors.push("Invalid or duplicate approved route");continue;}
    paths.add(route.path);
    if(!["game","casino"].includes(route.type))continue;
    const key=route.type+":"+route.entityId, e=sources.get(key), status=stateMap.get(key);
    if(keys.has(key)){errors.push("Duplicate approved entity route");continue;}
    keys.add(key);
    if(!e||!status||status.status!=="published"||
       !ID.test(route.entityId||"")||
       route.path!=="/en/"+(route.type==="game"?"games":"casinos")+"/"+e.slug+"/"||
       !SHA.test(status.contentSha256||"")||
       revisionHashes?.[route.path]!==status.contentSha256||
       status.informationRightsApproved!==true||
       !ID.test(status.reviewedBy||"")||!date(status.reviewedAt)||
       (route.type==="game" && (e.globalFacts?.id!==e.id||
         e.globalFacts?.sourceStatus!=="editorially-verified"))) {
      errors.push("Approved route is not bound to a reviewed published revision: "+key);
      continue;
    }
    if(revocations.has(key)) {
      tombstones.push({type:route.type,id:route.entityId,locale:"en"});
      continue;
    }
    const title=safeCopy(e.title,140),summary=safeCopy(e.description,600);
    if(!title||!summary||!origin){errors.push("Missing safe published copy or canonical origin: "+key);continue;}
    entries.push({type:route.type,id:route.entityId,locale:"en",
      canonicalUrl:origin+route.path,title,summary,contentRevision:status.contentSha256});
  }
  if(errors.length===0)for(const r of entries.sort((a,b)=>(a.type+":"+a.id).localeCompare(b.type+":"+b.id,"en")))
    entities[r.type==="game"?"games":"casinos"].push(r);
  if(errors.length) tombstones.length=0;
  return Object.freeze({
    contractVersion:1,kind:"seo-platform-published-catalogue-v1-preview",
    releaseId:"not-released",generatedAt,locale:"en",
    scope:{channel:"public-info",marketCodes:[]},
    entities,tombstones,previewOnly:true,publicationApproved:false,publicExportApproved:false,
    ok:errors.length===0,errors,
    note:"Offline schema rehearsal only. Never expose as a real Published Catalogue or bot feed.",
  });
}
