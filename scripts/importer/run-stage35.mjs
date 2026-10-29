import {auditQueue,stageApproved} from './stage35.mjs';
const args=process.argv.slice(2), cmd=args[0];
const opt=(flag,def)=>{const i=args.indexOf(flag);return i<0?def:args[i+1];};
try {
 const candidateDir=opt('--candidates','src/content/import-candidates/lcb');
 const reviewDir=opt('--reviews','data/editorial/reviews');
 if(cmd==='audit') console.log(JSON.stringify(await auditQueue({candidateDir,reviewDir}),null,2));
 else if(cmd==='stage') {
  const filename=opt('--file');if(!filename)throw new Error('--file required');
  console.log(JSON.stringify(await stageApproved({candidateDir,reviewDir,outDir:opt('--out','data/editorial/approved-staging'),filename}),null,2));
 } else throw new Error('Usage: run-stage35.mjs audit | stage --file NAME [--candidates DIR] [--reviews DIR] [--out DIR]');
}catch(e){console.error('Stage 35:',e.message);process.exitCode=1;}
