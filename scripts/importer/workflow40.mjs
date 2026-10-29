import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join,basename} from 'node:path';
import {validateStaging} from './publish38.mjs';
import {auditEditorial391} from './editorial391.mjs';

const slugOK=s=>typeof s==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const hashOK=s=>typeof s==='string'&&/^[a-f0-9]{64}$/.test(s);
const readJSON=async p=>JSON.parse(await readFile(resolve(p),'utf8'));
const names=async dir=>{try{return (await readdir(resolve(dir))).sort();}catch(e){if(e.code==='ENOENT')return [];throw e;}};
const exists=async p=>{try{await readFile(resolve(p));return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};
const problem=e=>e?.message??String(e);

/** Read-only workflow report: never modifies drafts, approvals, or publication files. */
export async function workflow40({stagingDir='data/editorial/approved-staging',draftDir='data/editorial/english',publishedDir='src/content/locales/en/games',factsDir='src/content/games',threshold=0.88}={}){
 if(!Number.isFinite(threshold)||threshold<0||threshold>1)throw new Error('Invalid threshold');
 const rows=[];const usedSlugs=new Map();
 for(const filename of (await names(stagingDir)).filter(n=>/^[a-f0-9]{64}\.json$/.test(n))){
  const hash=basename(filename,'.json'),stagingFile=join(resolve(stagingDir),filename);
  let staging,slug;
  try{staging=await readJSON(stagingFile);slug=staging?.facts?.slug??staging?.facts?.id??null;
   // Staging has no guaranteed slug; derive from immutable candidate filename only as a proposal.
   if(!slug){const candidate=staging?.sourceCandidate?.file??'';slug=candidate.replace(/--[a-f0-9]{12}\.json$/i,'').replace(/\.json$/i,'');}
   if(!slugOK(slug))throw new Error('Cannot derive safe slug');
   validateStaging(staging,hash);
  }catch(e){rows.push({staging:filename,slug:slug??null,status:'blocked',nextAction:'repair-staging',errors:['staging:'+problem(e)],warnings:[],ready:false});continue;}
  const errors=[],warnings=[];
  if(usedSlugs.has(slug)){errors.push('slug:collision-with-'+usedSlugs.get(slug));}else usedSlugs.set(slug,filename);
  const editorialFile=join(resolve(draftDir),slug+'.json');
  const publishedFile=join(resolve(publishedDir),slug+'.js');
  const publishedJSON=join(resolve(publishedDir),slug+'.json');
  const factsFile=join(resolve(factsDir),slug+'.json');
  const isPublished=(await exists(publishedFile))||(await exists(publishedJSON))||(await exists(factsFile));
  if(isPublished){rows.push({staging:filename,slug,status:'published-or-collision',nextAction:'verify-existing-publication',errors,warnings,ready:false});continue;}
  if(!(await exists(editorialFile))){rows.push({staging:filename,slug,status:errors.length?'blocked':'needs-editorial',nextAction:errors.length?'resolve-slug-collision':'write-editorial-draft',errors,warnings,ready:false});continue;}
  try{
   const audit=await auditEditorial391({editorialFile,slug,stagingFile,publishedDir,existingEditorialDir:draftDir,threshold});
   errors.push(...audit.errors);warnings.push(...audit.warnings);
  }catch(e){errors.push('audit:'+problem(e));}
  const ready=errors.length===0;
  rows.push({staging:filename,slug,status:ready?'ready-for-human-review':'blocked',nextAction:ready?'human-review-and-stage38-check':'resolve-editorial-issues',errors:[...new Set(errors)],warnings:[...new Set(warnings)],ready});
 }
 // Flag orphan drafts without pretending they are approved.
 for(const filename of (await names(draftDir)).filter(n=>n.endsWith('.json'))){
  const slug=basename(filename,'.json');if(!slugOK(slug)||usedSlugs.has(slug))continue;
  rows.push({staging:null,slug,status:'unlinked-draft',nextAction:'locate-approved-staging',errors:['draft:no-linked-approved-staging'],warnings:[],ready:false});
 }
 const counts={total:rows.length,ready:rows.filter(x=>x.ready).length,blocked:rows.filter(x=>x.status==='blocked').length,needsEditorial:rows.filter(x=>x.status==='needs-editorial').length,publishedOrCollision:rows.filter(x=>x.status==='published-or-collision').length,unlinkedDrafts:rows.filter(x=>x.status==='unlinked-draft').length};
 return {schemaVersion:1,generatedAt:new Date().toISOString(),autoPublish:false,counts,items:rows,note:'Read-only triage. Ready means automated checks passed, not publication approval.'};
}
export async function writeWorkflow40(options={}){
 const {outFile,...rest}=options;if(!outFile)throw new Error('outFile required');
 const report=await workflow40(rest);const output=resolve(outFile);
 await mkdir(resolve(output,'..'),{recursive:true});
 await writeFile(output,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 return {output,counts:report.counts,autoPublish:false};
}
