import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {loadCandidate,validateDraft} from './review34.mjs';
import {qualityReport} from './quality33.mjs';

const safeName = name => /^[a-z0-9][a-z0-9-]*\.json$/i.test(name);
export async function auditQueue({candidateDir='src/content/import-candidates/lcb',reviewDir='data/editorial/reviews',today}={}) {
 const names=(await readdir(resolve(candidateDir))).filter(safeName).sort();
 const results=[];
 for(const filename of names) {
  try {
   const {candidate,hash}=await loadCandidate(candidateDir,filename);
   const quality=qualityReport(candidate,{...(today?{today}:{})});
   let review=null;
   try {review=JSON.parse(await readFile(join(resolve(reviewDir),hash+'.json'),'utf8'));}
   catch(e){if(e.code!=='ENOENT')throw e;}
   results.push({file:filename,title:candidate.facts.title??null,quality:quality.status,issues:quality.issues,decision:review?.decision??'pending',candidateHash:hash});
  } catch(e){results.push({file:filename,decision:'invalid',error:e.message});}
 }
 return results;
}
export async function stageApproved({candidateDir='src/content/import-candidates/lcb',reviewDir='data/editorial/reviews',outDir='data/editorial/approved-staging',filename}) {
 if(!safeName(filename))throw new Error('Invalid filename');
 const {candidate,hash}=await loadCandidate(candidateDir,filename);
 const review=JSON.parse(await readFile(join(resolve(reviewDir),hash+'.json'),'utf8'));
 if(review.decision!=='approved'||review.reviewStatus!=='editorially-approved'||review.autoPublish!==false)throw new Error('Not an approved, non-publishing review');
 if(review.candidateFile!==filename)throw new Error('Review filename mismatch');
 validateDraft(review,candidate,hash);
 const staged={schemaVersion:1,status:'approved-staging',autoPublish:false,sourceCandidate:{file:filename,hash,url:candidate.source.url},review:{reviewedAt:review.reviewedAt,reviewer:review.reviewer,evidence:review.evidence,confirmedRights:review.confirmedRights},facts:review.facts};
 await mkdir(resolve(outDir),{recursive:true});
 const output=join(resolve(outDir),hash+'.json');
 await writeFile(output,JSON.stringify(staged,null,2)+'\n',{flag:'wx'});
 return {output,status:staged.status,autoPublish:false};
}
