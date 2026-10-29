import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {loadCandidate,makeDraft,validateDraft,decide} from './review34.mjs';
import {loadRegistries,propose36} from './registry36.mjs';

const validName = n => typeof n==='string' && /^[a-z0-9][a-z0-9-]*\.json$/i.test(n);
const todayUTC = () => new Date().toISOString().slice(0,10);

export async function prepare37({filename,candidateDir='src/content/import-candidates/lcb',proposalDir='data/editorial/normalization-proposals',registryDir='src/content/registries',outDir='data/editorial/drafts'}={}) {
 if(!validName(filename))throw new Error('Invalid candidate filename');
 const {candidate,hash}=await loadCandidate(candidateDir,filename);
 const proposal=JSON.parse(await readFile(join(resolve(proposalDir),filename),'utf8'));
 if(proposal.file!==filename || proposal.candidateHash!==hash || proposal.sourceUrl!==candidate.source.url)throw new Error('Stale or mismatched normalization proposal; regenerate proposal from the current candidate');
 const registries=await loadRegistries(registryDir);
 const fresh=propose36(candidate,registries);
 if(JSON.stringify(fresh.provider)!==JSON.stringify(proposal.provider) || JSON.stringify(fresh.themes)!==JSON.stringify(proposal.themes) || JSON.stringify(fresh.features)!==JSON.stringify(proposal.features))throw new Error('Registry mapping changed; regenerate normalization proposal');
 const draft=makeDraft(candidate,hash);
 // A mapping is only a suggestion. Unknown values are not silently accepted.
 draft.facts.providerId=fresh.provider.status==='matched'?fresh.provider.id:null;
 draft.facts.themes=fresh.themes.ids;
 draft.facts.features=fresh.features.ids;
 draft.normalizationReview={proposalFile:filename,providerStatus:fresh.provider.status,unknownThemes:fresh.themes.unknown,unknownFeatures:fresh.features.unknown,issues:fresh.issues};
 const path=join(resolve(outDir),filename);
 await mkdir(resolve(outDir),{recursive:true});
 await writeFile(path,JSON.stringify(draft,null,2)+'\n',{flag:'wx'});
 return {draft:path,candidateHash:hash,decision:draft.decision,issues:fresh.issues,autoPublish:false};
}

export async function validate37({filename,draftPath,candidateDir='src/content/import-candidates/lcb',proposalDir='data/editorial/normalization-proposals',registryDir='src/content/registries'}={}) {
 const {candidate,hash}=await loadCandidate(candidateDir,filename);
 const draft=JSON.parse(await readFile(resolve(draftPath),'utf8'));
 validateDraft(draft,candidate,hash);
 if(draft.decision==='approved') {
  if(!validName(filename))throw new Error('Invalid candidate filename');
  const proposal=JSON.parse(await readFile(join(resolve(proposalDir),filename),'utf8'));
  if(proposal.file!==filename || proposal.candidateHash!==hash || proposal.sourceUrl!==candidate.source.url)throw new Error('Stale or mismatched normalization proposal');
  const registries=await loadRegistries(registryDir);
  const fresh=propose36(candidate,registries);
  for(const key of ['provider','themes','features']) {
   if(JSON.stringify(proposal[key])!==JSON.stringify(fresh[key]))throw new Error('Normalization proposal is stale: '+key);
  }
  if(fresh.provider.status!=='matched' || fresh.provider.id!==draft.facts.providerId)throw new Error('Approved provider must match verified normalization');
  for(const key of ['themes','features']) {
   const proposed=new Set(fresh[key].ids);
   if(draft.facts[key].some(id=>!proposed.has(id)))throw new Error('Approved '+key+' must be supported by normalization proposal');
  }
  const verified=registries.providers.some(p=>p.id===draft.facts.providerId && p.verified===true);
  if(!verified)throw new Error('Provider ID must exist in verified provider registry');
  for(const [key,entries] of [['themes',registries.themes],['features',registries.features]]) {
   const unknown=draft.facts[key].filter(id=>!entries.some(e=>e.id===id));
   if(unknown.length)throw new Error(`Unknown ${key}: ${unknown.join(', ')}`);
  }
  // Never allow future-release candidate to be approved as released by deleting its date.
  if(candidate.facts.releaseDate && candidate.facts.releaseDate>todayUTC())throw new Error('Candidate has future release date; approval blocked pending verified release');
  if(draft.normalizationReview?.unknownThemes?.length || draft.normalizationReview?.unknownFeatures?.length) {
   if(draft.taxonomyChecked!==true)throw new Error('Unmapped taxonomy requires explicit taxonomyChecked confirmation');
  }
 }
 return {valid:true,decision:draft.decision,candidateHash:hash,autoPublish:false};
}

export async function approve37({filename,draftPath,candidateDir='src/content/import-candidates/lcb',reviewDir='data/editorial/reviews',registryDir='src/content/registries'}={}) {
 const checked=await validate37({filename,draftPath,candidateDir,registryDir});
 if(checked.decision!=='approved')throw new Error('Draft decision is not approved');
 return decide({candidateDir,reviewDir,filename,draftPath,registryDir});
}
