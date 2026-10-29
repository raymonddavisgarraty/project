import {prepare37,validate37,approve37} from './stage37.mjs';
const argv=process.argv.slice(2),cmd=argv[0];
const arg=(flag,fallback)=>{const i=argv.indexOf(flag);return i<0?fallback:argv[i+1];};
const filename=arg('--file');
const opts={filename,candidateDir:arg('--candidates','src/content/import-candidates/lcb'),registryDir:arg('--registries','src/content/registries')};
try {
 if(!filename)throw new Error('--file required');
 let result;
 if(cmd==='prepare')result=await prepare37({...opts,proposalDir:arg('--proposals','data/editorial/normalization-proposals'),outDir:arg('--out','data/editorial/drafts')});
 else if(cmd==='validate' || cmd==='approve'){
  const draftPath=arg('--draft',`data/editorial/drafts/${filename}`);
  result=cmd==='validate'?await validate37({...opts,draftPath}):await approve37({...opts,draftPath,reviewDir:arg('--reviews','data/editorial/reviews')});
 }else throw new Error('Usage: prepare|validate|approve --file FILENAME [--draft PATH]');
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error('Stage 37:',e.message);process.exitCode=1;}
