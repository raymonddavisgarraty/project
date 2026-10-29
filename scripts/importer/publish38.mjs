import {readFile, readdir, mkdir, writeFile, rm} from 'node:fs/promises';
import {resolve, join, basename} from 'node:path';
import {createHash} from 'node:crypto';

const slugOK = s => typeof s === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
const sha = s => createHash('sha256').update(s).digest('hex');
const nonempty = s => typeof s === 'string' && s.trim().length > 0;
const finite = n => n == null || (typeof n === 'number' && Number.isFinite(n));
const date = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
const readJSON = async p => JSON.parse(await readFile(p,'utf8'));
const exists = async p => {try {await readFile(p);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}};

export function validateEditorial(e, slug) {
 if (!e || e.slug!==slug || !nonempty(e.seo?.metaTitle) || !nonempty(e.seo?.metaDescription) || !nonempty(e.hero?.title) || !nonempty(e.hero?.description)) throw new Error('Editorial title, description and SEO metadata required');
 if (!e.sections || typeof e.sections!=='object' || !Array.isArray(e.pros) || !Array.isArray(e.cons) || !Array.isArray(e.faq)) throw new Error('Editorial sections, pros, cons and FAQ required');
 if (!nonempty(e.author) || !date(e.updatedDate)) throw new Error('Editorial author and updatedDate required');
 if (e.rating != null && (typeof e.rating.overall!=='number' || e.rating.overall<0 || e.rating.overall>5)) throw new Error('Invalid rating');
 if (e.monetization?.affiliateId && !nonempty(e.monetization.affiliateId)) throw new Error('Invalid affiliate ID');
 return e;
}
export function validateStaging(s, hash, today=new Date().toISOString().slice(0,10)) {
 if (!s || s.schemaVersion!==1 || s.status!=='approved-staging' || s.autoPublish!==false || s.sourceCandidate?.hash!==hash || !/^[a-f0-9]{64}$/.test(hash)) throw new Error('Not valid approved staging');
 if (!nonempty(s.sourceCandidate.url) || !/^[a-z0-9][a-z0-9-]*\.json$/i.test(s.sourceCandidate.file) || !nonempty(s.review?.reviewer) || s.review?.confirmedRights!==true || !Array.isArray(s.review?.evidence) || s.review.evidence.length===0) throw new Error('Staging provenance/review incomplete');
 const f=s.facts;
 if (!f || !nonempty(f.title) || !slugOK(f.providerId) || !Number.isInteger(f.reels) || f.reels<=0) throw new Error('Required game facts missing');
 if (f.releaseDate && (!date(f.releaseDate) || f.releaseDate>today)) throw new Error('Future or invalid release date');
 if (![f.rtp,f.maxWinMultiplier].every(finite) || (f.rtp!=null && (f.rtp<0||f.rtp>100))) throw new Error('Invalid numeric game facts');
 return f;
}
export function toGlobal(s,slug,providerName) {
 const f=s.facts;
 return {id:slug,slug,providerId:f.providerId,providerName,rtp:f.rtp??null,volatility:f.volatility??null,reels:f.reels,paylines:typeof f.paylines==='number'?f.paylines:null,paylineType:null,releaseYear:f.releaseDate?Number(f.releaseDate.slice(0,4)):null,maxWinMultiplier:f.maxWinMultiplier??null,hitFrequency:null,sourceStatus:'editorially-verified',sourceUrls:[s.sourceCandidate.url,...s.review.evidence.map(x=>x.url).filter(nonempty)].filter((v,i,a)=>a.indexOf(v)===i),provenance:{candidateFile:s.sourceCandidate.file,candidateHash:s.sourceCandidate.hash,reviewer:s.review.reviewer,reviewedAt:s.review.reviewedAt??null}};
}
function toModule(editorial) {return 'export default '+JSON.stringify(editorial,null,2)+';\n';}
export async function bridge38({stagingFile,editorialFile,slug,providerRegistry='src/content/registries/providers.json',factsDir='src/content/games',editorialDir='src/content/locales/en/games',candidateDir='src/content/import-candidates/lcb',reviewDir='data/editorial/reviews',today,write=false}={}) {
 if (!slugOK(slug)) throw new Error('Invalid slug');
 if (!stagingFile || !editorialFile) throw new Error('Staging and editorial files required');
 const hash=basename(stagingFile,'.json');
 const s=await readJSON(resolve(stagingFile));
 validateStaging(s,hash,today);
 // Revalidate against the original candidate and immutable editorial decision, not only staging content.
 const candidateBytes=await readFile(join(resolve(candidateDir),s.sourceCandidate.file));
 if (sha(candidateBytes)!==hash) throw new Error('Candidate hash mismatch');
 const review=await readJSON(join(resolve(reviewDir),hash+'.json'));
 if (review.decision!=='approved' || review.reviewStatus!=='editorially-approved' || review.autoPublish!==false || review.candidateFile!==s.sourceCandidate.file || review.candidateHash!==hash) throw new Error('Immutable approval missing or mismatched');
 if (JSON.stringify(review.facts)!==JSON.stringify(s.facts) || review.confirmedRights!==true || review.reviewer!==s.review.reviewer || JSON.stringify(review.evidence)!==JSON.stringify(s.review.evidence)) throw new Error('Staging differs from approved review');
 const editorial=validateEditorial(await readJSON(resolve(editorialFile)),slug);
 const providers=await readJSON(resolve(providerRegistry));
 const entries=Array.isArray(providers)?providers:providers.providers;
 const provider=entries?.find(p=>p.id===s.facts.providerId && p.verified===true);
 if (!provider) throw new Error('Provider not verified in registry');
 const global=toGlobal(s,slug,provider.name);
 const factsPath=join(resolve(factsDir),slug+'.json');
 const editorialPath=join(resolve(editorialDir),slug+'.js');
 for(const dir of [factsDir,editorialDir]) {
  for(const file of await readdir(resolve(dir))) {
   if (!file.endsWith('.json') && !file.endsWith('.js')) continue;
   if (dir===factsDir && file.endsWith('.json')) {
    const g=await readJSON(join(resolve(dir),file));
    if (g.id===slug || g.slug===slug) throw new Error('Duplicate game ID or slug');
   }
  }
 }
 if (await exists(factsPath) || await exists(editorialPath)) throw new Error('Destination already exists');
 const result={slug,globalPath:factsPath,editorialPath,sourceCandidateHash:hash,autoPublish:false,writeStatus:'dry-run'};
 if (!write) return result;
 await mkdir(resolve(factsDir),{recursive:true});await mkdir(resolve(editorialDir),{recursive:true});
 // Explicit write only. Roll back facts if the second exclusive create fails.
 await writeFile(factsPath,JSON.stringify(global,null,2)+'\n',{flag:'wx'});
 try {await writeFile(editorialPath,toModule(editorial),{flag:'wx'});} catch(e){await rm(factsPath,{force:true});throw e;}
 return {...result,writeStatus:'created',autoPublish:false};
}
