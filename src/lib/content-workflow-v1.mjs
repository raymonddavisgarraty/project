// Informational SEO Platform: single-editor Draft -> Review -> Published.
// Pure development preview: NOT a public API, sitemap or publication switch.
const ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HASH=/^[a-f0-9]{64}$/;
const VALID_STATUS=new Set(['draft','review','published','archived']);
const TYPES=new Set(['game','casino']);
const BASIC_KEYS=['type','id','status'];
const PUBLISHED_KEYS=[...BASIC_KEYS,'contentSha256','reviewedBy','reviewedAt','informationRightsApproved'];
const obj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>obj(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const identity=(type,id)=>type+':'+id;
const matchingDate=(value,now)=>typeof value==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,19)===value.slice(0,19)&&Date.parse(value)<=now;

export function previewContentWorkflowV1({games=[],casinos=[],states=[],audit=null,
  routes=[],measuredRevisionHashes={},globalInformationApproved=false,now=Date.now()}={}) {
  if (![games,casinos,states,routes].every(Array.isArray)||!obj(measuredRevisionHashes)||!Number.isFinite(now))
    throw new Error('Invalid workflow input');
  const errors=[],records=new Map(),approvedRoutes=new Map(),statusIndex=new Map(),items=new Map();
  const output={games:[],casinos:[],providers:[],articles:[],categories:[],offers:[]};
  const counts={draft:0,review:0,published:0,archived:0};
  for(const [type,list] of [['game',games],['casino',casinos]])for(const e of list){
    if(!ID.test(e?.id??'')||!ID.test(e?.slug??'')||records.has(identity(type,e.id))) {
      errors.push('Invalid or duplicated entity identity');continue;
    }
    records.set(identity(type,e.id),{type,data:e});
  }
  for(const r of routes){
    if(typeof r?.path!=='string'||approvedRoutes.has(r.path))errors.push('Invalid or duplicate generated route');
    else approvedRoutes.set(r.path,r);
  }
  if(audit?.schemaVersion!==1||audit?.autoPublish!==false||audit?.autoApprove!==false||!Array.isArray(audit?.items))
    errors.push('Stage 43 editorial audit missing or untrusted');
  else for(const item of audit.items){
    const key=identity(item?.type,item?.id);
    if(typeof item?.id!=='string'||typeof item?.type!=='string'||items.has(key))errors.push('Duplicate or invalid editorial audit entry');
    else items.set(key,item);
  }
  for(const s of states){
    if(!obj(s)||!VALID_STATUS.has(s.status)||!exact(s,s.status==='published'?PUBLISHED_KEYS:BASIC_KEYS)||
       !TYPES.has(s.type)||!ID.test(s.id??'')){
      errors.push('Unknown publication status fields or value');continue;
    }
    const key=identity(s.type,s.id);
    if(statusIndex.has(key)||!records.has(key)){errors.push('Duplicate or unknown publication status '+key);continue;}
    statusIndex.set(key,s);counts[s.status]++;
  }
  // A missing status is a draft, not an implicit publication.
  for(const key of records.keys())if(!statusIndex.has(key))counts.draft++;
  const candidates=[];
  for(const [key,s] of statusIndex) {
    if(s.status!=='published')continue;
    const {type,data:e}=records.get(key);
    const path='/en/'+(type==='game'?'games':'casinos')+'/'+e.slug+'/';
    const route=approvedRoutes.get(path),entry=items.get(key),author=items.get(identity('author',e.author));
    const claimsValid=entry?.releaseReady===true && Array.isArray(entry.blockers)&&entry.blockers.length===0&&
      Array.isArray(entry.claims)&&entry.claims.every(x=>['verified','not-claimed'].includes(x?.status));
    const authorValid=ID.test(e.author??'')&&author?.releaseReady===true&&
      Array.isArray(author.blockers)&&author.blockers.length===0;
    const approved=globalInformationApproved===true&&s.informationRightsApproved===true&&
      HASH.test(s.contentSha256??'')&&measuredRevisionHashes[path]===s.contentSha256&&
      ID.test(s.reviewedBy??'')&&matchingDate(s.reviewedAt,now)&&
      route?.type===type&&route.entityId===s.id&&claimsValid&&authorValid&&
      (type!=='game'||e.globalFacts?.sourceStatus==='editorially-verified')&&
      (type!=='casino'||e.id===e.slug);
    if(!approved){errors.push('Published state blocked by revision, rights, audit or route: '+key);continue;}
    if(typeof e.title!=='string'||!e.title.trim()||e.title.length>140||/[<>]/.test(e.title)||
       typeof e.description!=='string'||!e.description.trim()||e.description.length>600||/[<>]/.test(e.description)){
      errors.push('Missing or unsafe original public title/summary: '+key);continue;
    }
    // Strict allowlist: never copy rating, bonus, affiliate, private claims or source notes.
    candidates.push({type,id:s.id,locale:'en',path,title:e.title,summary:e.description,
      contentRevision:s.contentSha256});
  }
  if(errors.length===0)for(const c of candidates)output[c.type==='game'?'games':'casinos'].push(c);
  return Object.freeze({contractVersion:1,kind:'offline-publication-catalogue-preview',
    previewOnly:true,publicationApproved:false,indexabilityApproved:false,publicExportApproved:false,
    locale:'en',counts,entities:output,errors,ok:errors.length===0,
    note:'Preview only; never deploy or expose as a public JSON feed.'});
}
