import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { runPipeline, fetchRobots, HOST } from './pipeline32.mjs';
const args=process.argv.slice(2);
const opt=n=>{const i=args.indexOf(n);return i<0?null:args[i+1]};
const mode=args.includes('--network')?'network':'offline';
if(mode==='network' && !args.includes('--confirm-permission')) {console.error('Network mode requires --network --confirm-permission after reviewing site terms and authorization.');process.exit(2);}
const limit=Number(opt('--limit')||3);
const statePath=opt('--state')||'data/discovery/lcb-urls.json';
const outDir=opt('--out')||'src/content/import-candidates/lcb';
const write=args.includes('--write');
let htmlByUrl={};
if(mode==='offline') {
  const mapping=opt('--html-map');
  if(!mapping) {console.error('Offline usage: --html-map tests/fixtures/stage32/html-map.example.json [--state ...] [--write]');process.exit(2);}
  htmlByUrl=JSON.parse(await readFile(resolve(mapping),'utf8'));
}
try {
  const robotsText=mode==='network'?await fetchRobots():null;
  const summary=await runPipeline({statePath,outDir,limit,mode,htmlByUrl,robotsText,write});
  console.log(JSON.stringify(summary,null,2));
  if(summary.errors.length)process.exitCode=1;
} catch(error) {console.error(error.message);process.exitCode=1;}
