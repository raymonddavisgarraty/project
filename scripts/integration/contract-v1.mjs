// SEO Platform-owned OFFLINE contract boundary. Not a Studio implementation.
// No network, file-system access, editorial approval or publishing side effects.
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HASH = /^[a-f0-9]{64}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const FIELDS = Object.freeze([
  "title", "providerId", "releaseDate", "rtp", "volatility",
  "maxWinMultiplier", "reels", "paylines", "themes", "features",
]);
const ROOT_FIELDS = [
  "contractVersion", "kind", "packageId", "revision", "createdAt",
  "entityType", "entityId", "locale", "status", "sampleOnly",
  "publicationApproved", "autoPublish", "proposedFacts", "sourceSnapshots",
  "claims", "editorialBrief", "relatedEntityCandidates",
];
const FACT_FIELDS = new Set(FIELDS);
const isObject = x => x !== null && typeof x === "object" && !Array.isArray(x);
const isSlug = x => typeof x === "string" && SLUG.test(x);
const noExtra = (obj, allowed, path, errors) => {
  if (!isObject(obj)) {errors.push(path + ": must be object"); return false;}
  for (const k of Object.keys(obj)) if (!allowed.includes(k)) errors.push(path + ": unexpected field " + k);
  return true;
};
const isDay = x => typeof x === "string" && DATE.test(x) &&
  !Number.isNaN(Date.parse(x + "T00:00:00Z")) &&
  new Date(x + "T00:00:00Z").toISOString().slice(0,10) === x;
const time = x => typeof x === "string" && INSTANT.test(x) &&
  Number.isFinite(Date.parse(x)) && new Date(x).toISOString().slice(0,19) === x.slice(0,19);
const asUrl = x => {
  if (typeof x !== "string" || x.length > 2048) return null;
  let u;
  try {u=new URL(x);} catch {return null;}
  if (u.protocol !== "https:" || u.username || u.password || u.port ||
      u.hash || u.href !== x || !u.hostname.includes(".") ||
      /^localhost$|(?:^|\.)local$|(?:^|\.)invalid$|(?:^|\.)test$/i.test(u.hostname) ||
      /^(?:127\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|0\.|169\.254\.)/.test(u.hostname) ||
      /^\[/.test(u.hostname)) return null;
  return u;
};
function normalizedFacts(f,errors) {
  if (!noExtra(f,FIELDS,"proposedFacts",errors)) return false;
  for (const key of FIELDS) if (!Object.hasOwn(f,key)) errors.push("proposedFacts: missing " + key);
  if (typeof f.title!=="string" || f.title.trim().length<2 || f.title.length>180 ||
      /[<>\u0000-\u001f]/.test(f.title)) errors.push("proposedFacts.title: invalid title");
  if (f.providerId!==null && !isSlug(f.providerId)) errors.push("proposedFacts.providerId: invalid code");
  if (f.releaseDate!==null && !isDay(f.releaseDate)) errors.push("proposedFacts.releaseDate: invalid ISO date");
  if (f.rtp!==null && (typeof f.rtp!=="number" || !Number.isFinite(f.rtp) || f.rtp<0 || f.rtp>100))
    errors.push("proposedFacts.rtp: expected 0..100 or null");
  if (f.volatility!==null && !["low","medium","high","very-high"].includes(f.volatility))
    errors.push("proposedFacts.volatility: unknown normalized code");
  if (f.reels!==null && (!Number.isInteger(f.reels) || f.reels<1 || f.reels>20))
    errors.push("proposedFacts.reels: expected 1..20 or null");
  if (f.paylines!==null && (!Number.isInteger(f.paylines) || f.paylines<1))
    errors.push("proposedFacts.paylines: invalid");
  if (f.maxWinMultiplier!==null &&
      (typeof f.maxWinMultiplier!=="number" || !Number.isFinite(f.maxWinMultiplier) ||
       f.maxWinMultiplier<=0)) errors.push("proposedFacts.maxWinMultiplier: invalid");
  for (const k of ["themes","features"]) {
    if (!Array.isArray(f[k]) || f[k].length>24 || f[k].some(x=>!isSlug(x)) ||
        new Set(f[k]).size!==f[k].length) errors.push("proposedFacts."+k+": must be unique normalized codes");
  }
  return true;
}
export function validateStudioCandidateV1(pkg,{now=new Date().toISOString()}={}) {
  const errors=[];
  if (!noExtra(pkg,ROOT_FIELDS,"package",errors)) return {valid:false,errors};
  for(const k of ROOT_FIELDS) if(!Object.hasOwn(pkg,k))errors.push("package: missing "+k);
  if(pkg.contractVersion!==1 || pkg.kind!=="seo-platform-candidate-package")
    errors.push("package: unsupported contract version/kind");
  if(!isSlug(pkg.packageId) || !isSlug(pkg.entityId) || !Number.isInteger(pkg.revision) ||
     pkg.revision<1) errors.push("package: invalid stable ID or revision");
  if(!time(pkg.createdAt) || !time(now) || Date.parse(pkg.createdAt)>Date.parse(now))
    errors.push("package: invalid/future createdAt");
  if(pkg.entityType!=="game" || pkg.locale!=="en" || pkg.status!=="pending-editorial-review")
    errors.push("package: only pending EN game candidates supported in v1");
  if(typeof pkg.sampleOnly!=="boolean" || pkg.publicationApproved!==false ||
     pkg.autoPublish!==false) errors.push("package: approval/publication flags must be explicitly false");
  const f=pkg.proposedFacts;
  const hasFacts=normalizedFacts(f,errors);
  const sourceIds=new Set();
  if(!Array.isArray(pkg.sourceSnapshots) || pkg.sourceSnapshots.length<1 ||
     pkg.sourceSnapshots.length>20)errors.push("sourceSnapshots: requires 1..20 entries");
  else for(const source of pkg.sourceSnapshots){
    if(!noExtra(source,["sourceId","url","observedAt","sha256","sourceType","rightsStatus"],"sourceSnapshots[]",errors))continue;
    if(!isSlug(source.sourceId) || sourceIds.has(source.sourceId))
      errors.push("sourceSnapshots: missing/duplicate sourceId");
    else sourceIds.add(source.sourceId);
    const url=asUrl(source.url);
    if(!url) errors.push("sourceSnapshots: invalid/unsafe HTTPS URL");
    else if(!pkg.sampleOnly && /(^|\.)example\.(?:org|com|net)$/.test(url.hostname))
      errors.push("sourceSnapshots: placeholder URL forbidden in non-sample package");
    if(!time(source.observedAt) || !time(now) ||
       Date.parse(source.observedAt)>Date.parse(now))
      errors.push("sourceSnapshots: invalid/future observedAt");
    if(typeof source.sha256!=="string" || !HASH.test(source.sha256))
      errors.push("sourceSnapshots: invalid sha256");
    if(!["primary","secondary","third-party"].includes(source.sourceType) ||
       source.rightsStatus!=="pending-review")
      errors.push("sourceSnapshots: source rights/type not eligible for candidate");
  }
  const claimed=new Set();
  if(!Array.isArray(pkg.claims) || pkg.claims.length<1 || pkg.claims.length>40)
    errors.push("claims: requires 1..40 proposals");
  else for(const claim of pkg.claims){
    if(!noExtra(claim,["field","value","sourceIds","verificationStatus"],"claims[]",errors))continue;
    if(!FACT_FIELDS.has(claim.field) || claimed.has(claim.field))
      errors.push("claims: unsupported/duplicate field");
    else claimed.add(claim.field);
    if(claim.verificationStatus!=="unverified" && claim.verificationStatus!=="conflicted")
      errors.push("claims: proposals cannot be approved");
    if(!Array.isArray(claim.sourceIds) || claim.sourceIds.length===0 ||
       new Set(claim.sourceIds).size!==claim.sourceIds.length ||
       claim.sourceIds.some(id=>!sourceIds.has(id)))
      errors.push("claims: missing/duplicate/unresolved source reference");
    if(hasFacts && !Object.is(JSON.stringify(claim.value),JSON.stringify(f[claim.field])))
      errors.push("claims: proposed value differs from proposedFacts."+claim.field);
  }
  if(hasFacts && Array.isArray(pkg.claims)){
    for(const field of FIELDS){
      const value=f[field];
      if(value!==null && !(Array.isArray(value)&&value.length===0) && !claimed.has(field))
        errors.push("claims: nonempty proposedFacts."+field+" needs a claim/source");
    }
  }
  const brief=pkg.editorialBrief;
  if(noExtra(brief,["intent","proposedSections","notes"],"editorialBrief",errors)){
    if(typeof brief.intent!=="string" || brief.intent.length<4 || brief.intent.length>140 ||
       /[<>]/.test(brief.intent)) errors.push("editorialBrief.intent: invalid");
    if(!Array.isArray(brief.proposedSections) || brief.proposedSections.length>16 ||
       brief.proposedSections.some(s=>!isSlug(s)) ||
       new Set(brief.proposedSections).size!==brief.proposedSections.length)
      errors.push("editorialBrief: invalid proposedSections");
    if(typeof brief.notes!=="string" || brief.notes.length>2000)
      errors.push("editorialBrief: invalid notes");
  }
  if(!Array.isArray(pkg.relatedEntityCandidates) || pkg.relatedEntityCandidates.length>12)
    errors.push("relatedEntityCandidates: expected up to 12 suggestions");
  else {
    const refs=new Set();
    for(const rel of pkg.relatedEntityCandidates){
      if(!noExtra(rel,["relation","targetEntityId","reason","status"],"relatedEntityCandidates[]",errors))continue;
      const key=rel.relation+":"+rel.targetEntityId;
      if(rel.relation!=="related-to-game" || !isSlug(rel.targetEntityId) ||
         rel.targetEntityId===pkg.entityId || refs.has(key) ||
         typeof rel.reason!=="string" || rel.reason.trim().length<10 ||
         rel.reason.length>350 || rel.status!=="proposed")
        errors.push("relatedEntityCandidates: invalid, duplicate or approved relation");
      refs.add(key);
    }
  }
  return {valid:errors.length===0,errors};
}
export function toStage33PreviewV1(pkg,options={}) {
  const review=validateStudioCandidateV1(pkg,options);
  if(!review.valid)throw new Error("Offline package rejected: "+review.errors.join("; "));
  // IN-MEMORY ONLY: not a Stage 34 candidate file; Stage 34 has a specific
  // latestcasinobonuses.bet host gate and cannot ingest arbitrary Studio sources.
  return {
    schemaVersion:2,status:"pending-review",autoPublish:false,
    source:{url:pkg.sourceSnapshots[0].url,normalization:"studio-contract-v1-preview-only"},
    facts:structuredClone(pkg.proposedFacts),
    raw:{provider:pkg.proposedFacts.providerId,themes:[],features:[]},
    normalization:{issues:[]},
    contractContext:{packageId:pkg.packageId,revision:pkg.revision,
      sourceCount:pkg.sourceSnapshots.length,claimCount:pkg.claims.length,
      relationsAreOnlyProposals:true,stage34ImportCompatible:false},
  };
}
