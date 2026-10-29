import {resolve,join} from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {loadCandidate,listQueue,makeDraft,decide} from './review34.mjs';
const argv=process.argv.slice(2);
const command=argv[0];
const arg=(flag,fallback)=>{const i=argv.indexOf(flag);return i>=0?argv[i+1]:fallback;};
const candidateDir=arg('--candidates','src/content/import-candidates/lcb');
const reviewDir=arg('--reviews','data/editorial/reviews');
const filename=arg('--file');
try {
 if(command==='list') console.log(JSON.stringify(await listQueue(candidateDir,reviewDir),null,2));
 else if(command==='show') {if(!filename)throw new Error('--file required');const c=await loadCandidate(candidateDir,filename);console.log(JSON.stringify({file:filename,candidateHash:c.hash,candidate:c.candidate},null,2));}
 else if(command==='prepare') {
  if(!filename)throw new Error('--file required');
  const c=await loadCandidate(candidateDir,filename);
  const output=resolve(arg('--out',join('data/editorial/drafts',filename)));
  await mkdir(resolve(output,'..'),{recursive:true});
  await writeFile(output,JSON.stringify(makeDraft(c.candidate,c.hash),null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({draft:output,decision:'rejected-by-default',autoPublish:false},null,2));
 } else if(command==='decide') {
  if(!filename||!arg('--draft'))throw new Error('--file and --draft required');
  console.log(JSON.stringify(await decide({candidateDir,reviewDir,filename,draftPath:arg('--draft'),proposalDir:arg('--proposals','data/editorial/normalization-proposals'),registryDir:arg('--registries','src/content/registries')}),null,2));
 } else throw new Error('Usage: node scripts/importer/run-review34.mjs list | show --file NAME | prepare --file NAME [--out PATH] | decide --file NAME --draft PATH');
} catch(e){console.error('Stage 34:',e.message);process.exitCode=1;}
