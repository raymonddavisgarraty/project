// Stage 43.4 — read-only Sweet Bonanza source triage, NOT editorial review.
// Intentionally never imported into Eleventy or the Stage 38 publisher.
const FIELDS=["providerId","providerName","rtp","volatility","reels",
  "paylines","paylineType","releaseYear","maxWinMultiplier","hitFrequency"];
const SOURCES=Object.freeze({
  "pragmatic-2019-launch":"https://www.pragmaticplay.com/en/news/pragmatic-play-launches-sweet-bonanza/",
  "pragmatic-game-page":"https://www.pragmaticplay.com/en/games/sweet-bonanza-slot/",
  "mirrored-rules-pdf":"https://yesplay.bet/assets/documents/pragmatic-play-Sweet-Bonanza-rules.pdf",
});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const plain=x=>x!==null&&typeof x==="object"&&!Array.isArray(x);
const date=(s,now)=>{
  if(typeof s!=="string"||!/^20\d\d-\d\d-\d\d$/.test(s))return false;
  const n=Date.parse(s+"T00:00:00Z");
  return Number.isFinite(n)&&new Date(n).toISOString().slice(0,10)===s &&
    n<=Date.parse(now+"T00:00:00Z");
};
const keys=(x,allowed,name,errors)=>{
  if(!plain(x)){errors.push(name+" must be object");return false;}
  for(const k of Object.keys(x))if(!allowed.includes(k))
    errors.push(name+" has unexpected field: "+k);
  return true;
};
export function assessEvidencePilot434({
  dossier,facts,provenance,now="2026-11-02"
}={}){
  const errors=[];
  const root=["schemaVersion","dossierId","status","gameId","edition",
    "observedOn","editorialApproved","publicationApproved","autoPublish",
    "baselineFacts","sources","observations","questions","disclaimer"];
  if(!keys(dossier,root,"dossier",errors))
    return {ok:false,errors,editorialApproved:false,publicationApproved:false,autoPublish:false};
  if(dossier.schemaVersion!==1||dossier.dossierId!=="sweet-bonanza-original-434"||
     dossier.status!=="research-only"||dossier.gameId!=="sweet-bonanza"||
     dossier.edition!=="original-sweet-bonanza-2019"||
     dossier.editorialApproved!==false||dossier.publicationApproved!==false||
     dossier.autoPublish!==false)
    errors.push("Research status/identity/permission violation");
  if(!date(now,now)||!date(dossier.observedOn,now))
    errors.push("Invalid or future observation date");
  if(!plain(facts)||facts.id!==dossier.gameId||
     facts.sourceStatus!=="legacy-unverified")
    errors.push("Source facts are not the expected unverified record");
  if(!plain(provenance)||provenance.schemaVersion!==1||
     provenance.gameId!==dossier.gameId||!plain(provenance.fields))
    errors.push("Missing genuine Stage 43 provenance context");
  const baseline=dossier.baselineFacts;
  if(keys(baseline,FIELDS,"baselineFacts",errors)){
    for(const field of FIELDS){
      if(!Object.hasOwn(baseline,field)||!same(baseline[field],facts?.[field]))
        errors.push("Stale baseline: "+field);
      if(provenance?.fields?.[field]?.status!=="unverified"||
         !Array.isArray(provenance?.fields?.[field]?.evidence)||
         provenance.fields[field].evidence.length!==0)
        errors.push("Research is not permitted to override claim evidence: "+field);
    }
  }
  const sourceMap=new Map();
  if(!Array.isArray(dossier.sources)||dossier.sources.length!==3)
    errors.push("Source inventory must identify the 3 documented leads");
  else for(const s of dossier.sources){
    const fields=["sourceId","sourceType","url","publishedOn","observedOn",
      "snapshotSha256","reviewStatus","rightsStatus","note"];
    if(!keys(s,fields,"source",errors))continue;
    if(!Object.hasOwn(SOURCES,s.sourceId)||sourceMap.has(s.sourceId)||
       s.url!==SOURCES[s.sourceId]||
       (s.sourceId==="mirrored-rules-pdf")!==
         (s.sourceType==="unverified-third-party-rulebook-copy")||
       (s.sourceId==="pragmatic-2019-launch"&&s.sourceType!=="first-party-announcement")||
       (s.sourceId==="pragmatic-game-page"&&s.sourceType!=="first-party-game-page"))
      errors.push("Unrecognized, duplicate or misclassified research source: "+s.sourceId);
    sourceMap.set(s.sourceId,s);
    if(!date(s.observedOn,now)||s.observedOn>dossier.observedOn||
       (s.publishedOn!==null&&(!date(s.publishedOn,now)||s.publishedOn>s.observedOn)))
      errors.push("Invalid source date: "+s.sourceId);
    if(s.snapshotSha256!==null||s.reviewStatus!=="research-lead-only"||
       s.rightsStatus!=="not-reviewed"||typeof s.note!=="string"||s.note.length<15)
      errors.push("Research lead claims evidence/rights/approval: "+s.sourceId);
  }
  const observations=new Map(FIELDS.map(x=>[x,[]])),seen=new Set();
  if(!Array.isArray(dossier.observations)||!dossier.observations.length||
     dossier.observations.length>35)
    errors.push("Missing or excessive source observations");
  else for(const o of dossier.observations){
    if(!keys(o,["field","sourceId","candidateValue","qualifier","note"],"observation",errors))
      continue;
    const key=o.sourceId+":"+o.field+":"+o.qualifier;
    if(!observations.has(o.field)||!sourceMap.has(o.sourceId)||
       !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(o.qualifier||"")||
       seen.has(key)||o.candidateValue===null||o.candidateValue===undefined||
       typeof o.note!=="string"||o.note.length<20||o.note.length>450)
      errors.push("Invalid/duplicate/unlinked source observation: "+key);
    else{seen.add(key);observations.get(o.field).push(o);}
  }
  if(!Array.isArray(dossier.questions)||dossier.questions.length<4||
     dossier.questions.some(s=>typeof s!=="string"||s.length<15)||
     typeof dossier.disclaimer!=="string"||
     !dossier.disclaimer.includes("No immutable source snapshot"))
    errors.push("Missing explicit unresolved research questions or disclaimer");
  const rows=FIELDS.map(field=>{
    const leads=observations.get(field),distinct=new Set(leads.map(o=>JSON.stringify(o.candidateValue)));
    const primary=leads.some(o=>o.sourceId!=="mirrored-rules-pdf");
    const mirrored=leads.some(o=>o.sourceId==="mirrored-rules-pdf");
    const differs=leads.some(o=>!same(o.candidateValue,baseline?.[field]));
    const status=!leads.length?"needs-source":distinct.size>1?
      (field==="rtp"?"configuration-ambiguous":"conflicting-research-leads"):
      differs?"candidate-discrepancy":primary?"matching-research-lead":"third-party-lead-only";
    return Object.freeze({
      field,baselineValue:baseline?.[field],status,observationCount:leads.length,
      firstPartyLeadPresent:primary,unverifiedMirrorPresent:mirrored,approved:false,
      candidateValues:[...new Set(leads.map(o=>o.candidateValue))]
    });
  });
  return Object.freeze({
    schemaVersion:1,kind:"source-first-research-triage",gameId:dossier.gameId,
    ok:errors.length===0,
    sourceLeadCount:sourceMap.size,rows:Object.freeze(rows),
    counts:{
      matches:rows.filter(x=>x.status==="matching-research-lead").length,
      discrepancies:rows.filter(x=>x.status==="candidate-discrepancy").length,
      conflicts:rows.filter(x=>x.status==="conflicting-research-leads").length,
      configurationAmbiguities:rows.filter(x=>x.status==="configuration-ambiguous").length,
      missingSources:rows.filter(x=>x.status==="needs-source").length
    },
    editorialApproved:false,publicationApproved:false,autoPublish:false,
    publicExportApproved:false,provenanceModified:false,
    errors:Object.freeze(errors),
    notes:["All sources are unapproved leads, with no authenticated source snapshots or publication rights.",
      "Matching values are research candidates only; source observations never set Stage 43 claims to verified.",
      "RTP/volatility variants need edition-specific authenticated rules and independent human review."]
  });
}
