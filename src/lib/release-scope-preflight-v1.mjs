// Gate G2 — read-only planning of a narrowly reviewed release.
// NEVER a production grant, sitemap allowlist or public export.
const ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HASH=/^[a-f0-9]{64}$/;
const UTC=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const PAGE=new Set(["game","casino"]);
const CANDIDATE_FIELDS=new Set(["type","id","path","locale","revisionSha256","authorId","rights","review","relatedEntityIds"]);
const REVIEW_FIELDS=new Set(["status","reviewerId","reviewedAt"]);
const RIGHTS_FIELDS=new Set(["globalInformationRights","legalStatus","commercialApproved"]);
const isRecord=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const strictFields=(o,fields)=>isRecord(o)&&Object.keys(o).every(k=>fields.has(k))&&[...fields].every(k=>Object.hasOwn(o,k));
const timestamp=(s,now)=>typeof s==="string"&&UTC.test(s)&&Number.isFinite(Date.parse(s))&&
  new Date(s).toISOString().slice(0,19)===s.slice(0,19)&&Date.parse(s)<=now;
const key=(type,id)=>type+":"+id;
const validPath=(type,slug,path)=>path==="/en/"+(type==="game"?"games":"casinos")+"/"+slug+"/";

export function preflightReleaseScopeV1({
  generatedRoutes=[],entities={games:[],casinos:[]},audit=null,
  decisions=[],measuredRevisionHashes={},globalInformationApproved=false,
  now=Date.now(),
}={}) {
  if(!Array.isArray(generatedRoutes)||!isRecord(entities)||
     !Array.isArray(entities.games)||!Array.isArray(entities.casinos)||
     !Array.isArray(decisions)||!isRecord(measuredRevisionHashes)||
     !Number.isFinite(now))throw new Error("G2: malformed release-scope input");
  const errors=[],staged=[],generated=new Map(),objects=new Map(),reviews=new Map(),seen=new Set();
  for(const e of entities.games){
    if(!ID.test(e?.id||"")||!ID.test(e?.slug||"")||objects.has(key("game",e.id)))
      errors.push("invalid or duplicate game identity");
    else objects.set(key("game",e.id),e);
  }
  for(const e of entities.casinos){
    if(!ID.test(e?.id||"")||!ID.test(e?.slug||"")||objects.has(key("casino",e.id)))
      errors.push("invalid or duplicate casino identity");
    else objects.set(key("casino",e.id),e);
  }
  for(const r of generatedRoutes){
    if(typeof r?.path!=="string"||generated.has(r.path)){
      errors.push("invalid or duplicate generated route");continue;
    }
    generated.set(r.path,r);
  }
  if(audit?.schemaVersion!==1||audit?.autoApprove!==false||audit?.autoPublish!==false||
     !Array.isArray(audit?.items))errors.push("untrusted or incomplete editorial audit");
  else for(const a of audit.items){
    if(typeof a?.type!=="string"||typeof a?.id!=="string"||reviews.has(key(a.type,a.id)))
      errors.push("duplicate or invalid editorial audit entry");
    else reviews.set(key(a.type,a.id),a);
  }
  for(const d of decisions){
    if(!strictFields(d,CANDIDATE_FIELDS)){
      errors.push("unknown or missing release decision field");continue;
    }
    const id=key(d.type,d.id);
    if(seen.has(id)||!PAGE.has(d.type)||!ID.test(d.id||"")){
      errors.push("duplicate or invalid release identity");continue;
    }
    seen.add(id);
    const entity=objects.get(id),route=generated.get(d.path);
    if(!entity||!validPath(d.type,entity.slug,d.path)||
       route?.type!==d.type||route.entityId!==d.id||d.locale!=="en"){
      errors.push(id+": missing entity/route or wrong locale");continue;
    }
    // Existing Stage 43 casino provenance is keyed by slug. Do not allow an
    // ID/slug migration without independently reviewed provenance mapping.
    if(d.type==="casino"&&entity.id!==entity.slug){
      errors.push(id+": legacy casino provenance ID migration unresolved");continue;
    }
    const check=reviews.get(id),author=reviews.get(key("author",d.authorId));
    if(check?.releaseReady!==true||!Array.isArray(check.blockers)||check.blockers.length!==0||
       !Array.isArray(check.claims)||check.claims.some(c=>!["verified","not-claimed"].includes(c?.status))){
      errors.push(id+": entity claims not independently verified");continue;
    }
    if(!ID.test(d.authorId||"")||entity.author!==d.authorId||
       author?.releaseReady!==true||!Array.isArray(author.blockers)||author.blockers.length!==0){
      errors.push(id+": author identity/review not verified");continue;
    }
    if(d.type==="game"&&entity.globalFacts?.sourceStatus!=="editorially-verified"){
      errors.push(id+": source status is not editorially verified");continue;
    }
    if(!strictFields(d.review,REVIEW_FIELDS)||d.review.status!=="approved"||
       !ID.test(d.review.reviewerId||"")||!timestamp(d.review.reviewedAt,now)){
      errors.push(id+": missing or invalid independent human review");continue;
    }
    if(!strictFields(d.rights,RIGHTS_FIELDS)||globalInformationApproved!==true||
       d.rights.globalInformationRights!==true||d.rights.legalStatus!=="approved"||
       d.rights.commercialApproved!==false){
      errors.push(id+": public information rights/market scope not approved");continue;
    }
    if(!HASH.test(d.revisionSha256||"")||measuredRevisionHashes[d.path]!==d.revisionSha256){
      errors.push(id+": content revision hash not independently matched");continue;
    }
    // No live relations until both source and target have independently
    // approved stable IDs, matching locale/scope, routes and revisions.
    if(!Array.isArray(d.relatedEntityIds)||d.relatedEntityIds.length!==0||
       (d.type==="game"&&Array.isArray(entity.relatedGames)&&entity.relatedGames.length!==0)){
      errors.push(id+": release-scope relations not yet independently approved");continue;
    }
    staged.push(Object.freeze({type:d.type,id:d.id,path:d.path,revisionSha256:d.revisionSha256}));
  }
  const eligible=errors.length===0?staged:[];
  return Object.freeze({
    schemaVersion:1,kind:"release-scope-preflight-only",ok:errors.length===0,
    eligibleProposals:Object.freeze(eligible),errors:Object.freeze(errors),
    publicExportApproved:false,indexabilityApproved:false,
    publicationApproved:false,autoPublish:false,
    note:"A preflight proposal is NOT a signed release, publishing permission, sitemap allowlist or public catalogue."
  });
}
