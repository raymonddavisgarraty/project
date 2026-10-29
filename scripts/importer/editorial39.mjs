import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {validateEditorial,validateStaging} from './publish38.mjs';

const slugOK=s=>typeof s==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const hash=s=>createHash('sha256').update(s).digest('hex');
const words=s=>String(s??'').toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}]+/gu)??[];
const normalize=s=>words(s).join(' ');
const textBlocks=e=>[e.hero?.description,...Object.values(e.sections??{}).flatMap(v=>[v?.text,...(Array.isArray(v?.items)?v.items:[])]),...(e.pros??[]),...(e.cons??[]),...(e.faq??[]).flatMap(v=>[v?.question,v?.answer])].filter(x=>typeof x==='string');
const textSignature=e=>normalize(textBlocks(e).join(' '));
const tokenSet=s=>new Set(words(s).filter(w=>w.length>2));
const jaccard=(a,b)=>{const aa=tokenSet(a),bb=tokenSet(b);if(!aa.size||!bb.size)return 0;let same=0;for(const w of aa)if(bb.has(w))same++;return same/(aa.size+bb.size-same);};
const readJSON=async p=>JSON.parse(await readFile(resolve(p),'utf8'));
const isURL=s=>{try{const u=new URL(s);return ['http:','https:'].includes(u.protocol)&&Boolean(u.hostname);}catch{return false;}};

export function makeBrief39(staging,slug){
 if(!slugOK(slug))throw new Error('Invalid slug');
 const f=validateStaging(staging,staging.sourceCandidate?.hash);
 return {schemaVersion:1,slug,locale:'en',status:'editorial-brief',sourceCandidate:staging.sourceCandidate,verifiedFacts:{title:f.title,providerId:f.providerId,releaseDate:f.releaseDate??null,reels:f.reels,rtp:f.rtp??null,volatility:f.volatility??null,themes:f.themes??[],features:f.features??[]},evidence:staging.review.evidence,requirements:{seo:['Original meta title, meta description and H1','Do not claim unverified RTP, volatility, maximum win or demo availability'],sections:['overview','features','gameplay','rtpVolatility'],editorial:['Independent prose based on verified facts','Pros, cons and factual FAQ','Author and update date','No fabricated scores, images or affiliate identifiers'],localization:'Facts remain global; all editorial prose belongs to en locale'},publication:'requires separate editorial review and explicit Stage 38 publish'};
}

export async function auditEditorial39({editorialFile,slug,stagingFile,existingEditorialDir,threshold=0.88}={}){
 if(!slugOK(slug))throw new Error('Invalid slug');
 if(!Number.isFinite(threshold)||threshold<0||threshold>1)throw new Error('Invalid duplicate threshold');
 const e=await readJSON(editorialFile);const errors=[],warnings=[],duplicates=[];
 try{validateEditorial(e,slug);}catch(err){errors.push('schema: '+err.message);}
 const s=stagingFile?await readJSON(stagingFile):null;
 if(s){try{validateStaging(s,basename(stagingFile,'.json'));}catch(err){errors.push('staging: '+err.message);}}
 for(const key of ['overview','features','gameplay','rtpVolatility']){
  const section=e.sections?.[key];if(!section||typeof section!=='object'||!String(section.title??'').trim()||!(String(section.text??'').trim()||(Array.isArray(section.items)&&section.items.some(x=>String(x).trim()))))errors.push('missing-section:'+key);
 }
 if(!String(e.seo?.h1??'').trim())errors.push('missing-h1');
 if(!Array.isArray(e.faq)||e.faq.length<2||e.faq.some(x=>!String(x?.question??'').trim()||!String(x?.answer??'').trim()))errors.push('faq:at-least-two-complete');
 if(!Array.isArray(e.pros)||e.pros.length<2||!Array.isArray(e.cons)||e.cons.length<1)errors.push('pros-cons:incomplete');
 const prose=textBlocks(e).join(' ');if(words(prose).length<120)warnings.push('thin-content:under-120-words');
 if(String(e.seo?.metaTitle??'').length>65)warnings.push('seo:title-over-65-characters');
 if(String(e.seo?.metaDescription??'').length>165)warnings.push('seo:description-over-165-characters');
 if(s){
  const f=s.facts;
  if(e.hero?.title&&normalize(e.hero.title)!==normalize(f.title))warnings.push('title:differs-from-verified-facts');
  if(f.rtp==null&&/\b(?:rtp|return to player)\s*(?:of|:|is)?\s*\d+(?:[.,]\d+)?\s*%/i.test(prose))errors.push('unverified-rtp-claim');
  if(f.releaseDate&&f.releaseDate>new Date().toISOString().slice(0,10))errors.push('future-release');
  if(!Array.isArray(s.review?.evidence)||s.review.evidence.some(v=>!isURL(v?.url)))errors.push('evidence:invalid-url');
 }
 if(e.rating!=null)warnings.push('rating:requires-independent-scoring-evidence');
 if(e.media?.cover?.src)warnings.push('media:verify-image-rights-and-asset-existence');
 if(e.monetization?.affiliateId)warnings.push('affiliate:verify-disclosure-and-link-compliance');
 if(existingEditorialDir){
  for(const name of await readdir(resolve(existingEditorialDir))){
   if(!name.endsWith('.json')||name===slug+'.json')continue;
   let other;try{other=await readJSON(join(resolve(existingEditorialDir),name));}catch{warnings.push('catalog:unreadable-'+name);continue;}
   const a=textSignature(e),b=textSignature(other);const score=a&&b&&a===b?1:jaccard(a,b);
   if(score>=threshold)duplicates.push({file:name,similarity:Number(score.toFixed(3))});
  }
 }
 if(duplicates.length)errors.push('duplicate-editorial-content');
 return {schemaVersion:1,slug,ready:errors.length===0,errors,warnings,duplicates,stats:{editorialWords:words(prose).length,contentSha256:hash(textSignature(e))},note:'Automated readiness is not a factual verification or a publication approval.'};
}
export async function createBrief39({stagingFile,slug,outFile}={}){
 if(!stagingFile||!outFile)throw new Error('stagingFile and outFile required');
 const brief=makeBrief39(await readJSON(stagingFile),slug);
 await mkdir(resolve(outFile,'..'),{recursive:true});await writeFile(resolve(outFile),JSON.stringify(brief,null,2)+'\n',{flag:'wx'});
 return {output:resolve(outFile),slug,autoPublish:false};
}
