import {bridge38} from './publish38.mjs';
const a=process.argv.slice(2);
const opt=k=>{const i=a.indexOf(k);return i<0?undefined:a[i+1];};
if(!['check','publish'].includes(a[0])){console.error('Usage: node scripts/importer/run-stage38.mjs check|publish --staging PATH --editorial PATH --slug SLUG');process.exit(1);}
try{console.log(JSON.stringify(await bridge38({stagingFile:opt('--staging'),editorialFile:opt('--editorial'),slug:opt('--slug'),write:a[0]==='publish'}),null,2));}
catch(e){console.error('Stage 38:',e.message);process.exitCode=1;}
