import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises';
import {resolve, join, basename} from 'node:path';
import {createHash} from 'node:crypto';

const sha = value => createHash('sha256').update(value).digest('hex');
const allowedFields = ['title','providerId','releaseDate','rtp','volatility','maxWinMultiplier','reels','paylines','themes','features'];
const safeName = name => /^[a-z0-9][a-z0-9-]*\.json$/i.test(name) && basename(name)===name;
const unique = xs => [...new Set(xs)];
const isDate = s => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s+'T00:00:00Z'));

export async function loadCandidate(dir, filename) {
  if(!safeName(filename)) throw new Error('Unsafe candidate filename');
  const raw = await readFile(join(resolve(dir),filename),'utf8');
  const candidate = JSON.parse(raw);
  if(candidate?.status!=='pending-review' || !candidate.facts || !candidate.source?.url) throw new Error('Not a supported review candidate');
  if(new URL(candidate.source.url).hostname!=='latestcasinobonuses.bet') throw new Error('Unexpected source');
  // Older imported records have no importSignature; bind reviews to exact raw file hash instead.
  return {candidate,raw,hash:sha(raw)};
}
export async function listQueue(dir, reviewsDir) {
  let files=[];
  try { files=(await readdir(resolve(dir))).filter(safeName).sort(); } catch(e){if(e.code!=='ENOENT')throw e;}
  const rows=[];
  for(const file of files) {
    let data; try {data=await loadCandidate(dir,file);}catch(e) { rows.push({file,error:e.message,decision:'invalid'}); continue; }
    const reviewed=await findDecision(reviewsDir,data.hash);
    rows.push({file,title:data.candidate.facts.title??null,quality:data.candidate.quality?.status??'unknown',issues:data.candidate.quality?.issues??[],decision:reviewed?.decision??'pending'});
  }
  return rows;
}
async function findDecision(dir, candidateHash) {
  try {
    const path=join(resolve(dir),candidateHash+'.json');
    return JSON.parse(await readFile(path,'utf8'));
  } catch(e){if(e.code==='ENOENT')return null;throw e;}
}
export function validateDraft(draft,candidate,hash) {
  if(!draft || draft.schemaVersion!==1 || draft.candidateHash!==hash || draft.sourceUrl!==candidate.source.url || (draft.importSignature??null)!==(candidate.importSignature??null)) throw new Error('Draft does not match this exact candidate revision');
  if(!['approved','rejected'].includes(draft.decision)) throw new Error('Decision must be approved or rejected');
  if(typeof draft.reviewer!=='string' || draft.reviewer.trim().length<2) throw new Error('Reviewer name required');
  if(typeof draft.reason!=='string' || draft.reason.trim().length<10) throw new Error('Review rationale required (10+ chars)');
  if(!draft.facts || typeof draft.facts!=='object' || Array.isArray(draft.facts) || Object.keys(draft.facts).some(k=>!allowedFields.includes(k))) throw new Error('Unexpected facts fields');
  const f=draft.facts;
  if(draft.decision==='approved') {
    if(draft.confirmedRights!==true) throw new Error('Explicit confirmation of data-use rights required');
    if(typeof f.title!=='string' || f.title.trim().length<2 || typeof f.providerId!=='string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(f.providerId)) throw new Error('Title and resolved providerId required');
    if(f.releaseDate!=null && (!isDate(f.releaseDate) || f.releaseDate>new Date().toISOString().slice(0,10))) throw new Error('Release date invalid or in future');
    if(f.rtp!=null && (typeof f.rtp!=='number' || f.rtp<0 || f.rtp>100)) throw new Error('RTP invalid');
    if(f.reels!=null && (!Number.isInteger(f.reels)||f.reels<1||f.reels>20)) throw new Error('Reels invalid');
    if(f.paylines!=null && (!Number.isInteger(f.paylines)||f.paylines<1)) throw new Error('Paylines invalid');
    if(f.maxWinMultiplier!=null && (typeof f.maxWinMultiplier!=='number'||f.maxWinMultiplier<=0)) throw new Error('Max win invalid');
    if(!Array.isArray(f.themes)||!Array.isArray(f.features)||[...f.themes,...f.features].some(x=>typeof x!=='string'||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x))) throw new Error('Themes and features must be normalized slug arrays');
    if(unique(f.themes).length!==f.themes.length||unique(f.features).length!==f.features.length) throw new Error('Duplicate taxonomy codes');
    if(!Array.isArray(draft.evidence)||draft.evidence.length===0||draft.evidence.some(x=>!x || typeof x.url!=='string' || !/^https:\/\//.test(x.url) || typeof x.note!=='string'||x.note.trim().length<5)) throw new Error('Independent evidence with HTTPS URL and note required');
    if(draft.evidence.every(x=>new URL(x.url).hostname==='latestcasinobonuses.bet')) throw new Error('At least one independent verification source required');
    if(draft.confirmedFacts!==true) throw new Error('Explicit factual verification required');
  }
}
export function makeDraft(candidate,hash) {
  return {schemaVersion:1,candidateHash:hash,sourceUrl:candidate.source.url,importSignature:candidate.importSignature??null,decision:'rejected',reviewer:'',reason:'',confirmedRights:false,confirmedFacts:false,evidence:[],facts:Object.fromEntries(allowedFields.map(k=>[k,candidate.facts[k]??(k==='themes'||k==='features'?[]:null)]))};
}
export async function decide({candidateDir,reviewDir,filename,draftPath,proposalDir,registryDir}) {
  const {candidate,hash}=await loadCandidate(candidateDir,filename);
  const draft=JSON.parse(await readFile(resolve(draftPath),'utf8'));
  validateDraft(draft,candidate,hash);
  if(draft.decision==='approved') {
    // Shared approval gate: direct Stage 34 calls cannot bypass Stage 37.
    const {validate37}=await import('./stage37.mjs');
    await validate37({filename,draftPath,candidateDir,proposalDir,registryDir});
  }
  const existing=await findDecision(reviewDir,hash);
  if(existing) throw new Error(`Candidate already reviewed: ${existing.decision}; decisions are immutable`);
  const decision={...draft,reviewedAt:new Date().toISOString(),candidateFile:filename,reviewStatus:draft.decision==='approved'?'editorially-approved':'rejected',autoPublish:false};
  await mkdir(resolve(reviewDir),{recursive:true});
  await writeFile(join(resolve(reviewDir),hash+'.json'),JSON.stringify(decision,null,2)+'\n',{flag:'wx'});
  return {decision:decision.decision,reviewFile:hash+'.json',autoPublish:false};
}
