import {readFile,readdir} from 'node:fs/promises';
import {resolve,join,extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {auditEditorial39} from './editorial39.mjs';

const tokens=s=>String(s??'').normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)??[];
const norm=s=>tokens(s).join(' ');
const prose=e=>[e.hero?.description,...Object.values(e.sections??{}).flatMap(x=>[x?.text,...(Array.isArray(x?.items)?x.items:[])]),...(e.pros??[]),...(e.cons??[]),...(e.faq??[]).flatMap(x=>[x?.question,x?.answer])].filter(x=>typeof x==='string').join(' ');
const score=(a,b)=>{const x=new Set(tokens(a).filter(w=>w.length>2)),y=new Set(tokens(b).filter(w=>w.length>2));if(!x.size||!y.size)return 0;let n=0;for(const w of x)if(y.has(w))n++;return n/(x.size+y.size-n);};
const numeric=s=>Number(String(s).replace(',','.'));
const close=(a,b)=>Math.abs(a-b)<0.005;

// Published modules are local, trusted project code. Never import untrusted downloaded JS.
async function readPublished(path){
 if(extname(path)==='.json')return JSON.parse(await readFile(path,'utf8'));
 if(extname(path)==='.js'){const mod=await import(pathToFileURL(path).href);return mod.default;}
 return null;
}
function claims(e,f){
 const errors=[],warnings=[];
 const body=prose(e)+' '+[e.seo?.metaTitle,e.seo?.metaDescription,e.seo?.h1].filter(Boolean).join(' ');
 const percent=/\b(?:rtp|return\s+to\s+player)\s*(?:(?:of|is|at)\s*)?[:=]?\s*(\d{1,3}(?:[.,]\d{1,3})?)\s*%|\b(\d{1,3}(?:[.,]\d{1,3})?)\s*%\s*(?:rtp|return\s+to\s+player)\b/gi;
 for(const match of body.matchAll(percent)){
  const value=numeric(match[1]??match[2]);
  if(f.rtp==null)errors.push('claim:rtp-unverified');
  else if(!close(value,f.rtp))errors.push('claim:rtp-conflicts-with-staging');
 }
 const reels=/\b(\d{1,2})\s*[- ]?\s*reels?\b|\breels?\s*[:=]\s*(\d{1,2})\b/gi;
 for(const match of body.matchAll(reels))if(Number(match[1]??match[2])!==f.reels)errors.push('claim:reels-conflicts-with-staging');
 const year=/\b(?:released?\s+(?:in|on)\s+|launch(?:ed)?\s+in\s+)(20\d{2})\b/gi;
 for(const match of body.matchAll(year)){
  if(!f.releaseDate)warnings.push('claim:release-year-unverified');
  else if(Number(match[1])!==Number(f.releaseDate.slice(0,4)))errors.push('claim:release-year-conflicts-with-staging');
 }
 const volatility=/\b(low|medium|high)\s+volatility\b/gi;
 for(const match of body.matchAll(volatility)){
  if(!f.volatility)warnings.push('claim:volatility-unverified');
  else if(match[1].toLowerCase()!==String(f.volatility).toLowerCase())errors.push('claim:volatility-conflicts-with-staging');
 }
 // A title is not evidence of provider identity; require explicit human verification of name claims.
 if(/\b(?:guaranteed\s+wins?|risk[- ]free\s+profits?)\b/i.test(body))errors.push('claim:misleading-guarantee');
 return {errors:[...new Set(errors)],warnings:[...new Set(warnings)]};
}

export async function auditEditorial391({editorialFile,slug,stagingFile,publishedDir,existingEditorialDir,threshold=0.88}={}){
 if(!editorialFile||!slug||!stagingFile)throw new Error('editorialFile, slug and stagingFile required');
 const base=await auditEditorial39({editorialFile,slug,stagingFile,existingEditorialDir,threshold});
 const e=JSON.parse(await readFile(resolve(editorialFile),'utf8'));
 const staging=JSON.parse(await readFile(resolve(stagingFile),'utf8'));
 const extra=claims(e,staging.facts??{});
 const publishedDuplicates=[];
 const warnings=[...base.warnings,...extra.warnings];
 if(publishedDir){
  for(const name of (await readdir(resolve(publishedDir))).sort()){
   if(!/\.(js|json)$/.test(name)||name===slug+'.js'||name===slug+'.json')continue;
   try{
    const other=await readPublished(join(resolve(publishedDir),name));
    if(!other||typeof other!=='object'||!other.hero)continue;
    const similarity=norm(prose(e))===norm(prose(other))?1:score(prose(e),prose(other));
    if(similarity>=threshold)publishedDuplicates.push({file:name,similarity:Number(similarity.toFixed(3))});
   }catch(err){warnings.push('published:unreadable-'+name+':'+err.message);}
  }
 }
 const errors=[...new Set([...base.errors,...extra.errors,...(publishedDuplicates.length?['duplicate-published-content']:[])])];
 return {...base,schemaVersion:2,ready:errors.length===0,errors,warnings:[...new Set(warnings)],publishedDuplicates,checks:{facts:'heuristic text checks; manual verification required',published:'local trusted JS/JSON modules only'},note:'Readiness does not grant publication approval. Stage 38 approval and explicit publish remain mandatory.'};
}
