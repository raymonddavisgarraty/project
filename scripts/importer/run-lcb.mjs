import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, join} from 'node:path';
import {createHash} from 'node:crypto';
import {extractLatestCasinoBonuses} from './adapters/latestcasinobonuses.mjs';
const args=process.argv.slice(2);
const arg=(key)=>{const i=args.indexOf(key);return i>=0?args[i+1]:null;};
if(!arg('--html') || !arg('--url')) {console.error('Usage: node scripts/importer/run-lcb.mjs --html path/to/page.html --url https://latestcasinobonuses.bet/slots/game/ [--write]');process.exit(2);}
try {
 const html=await readFile(resolve(arg('--html')),'utf8');
 const record=extractLatestCasinoBonuses(html,arg('--url'));
 if(args.includes('--write')) {
   const dir=resolve('src/content/import-candidates/lcb'); await mkdir(dir,{recursive:true});
   const name=new URL(record.source.url).pathname.split('/').filter(Boolean).at(-1);
   const hash=createHash('sha256').update(record.source.url).digest('hex').slice(0,10);
   const path=join(dir,`${name}--${hash}.json`);
   await writeFile(path,JSON.stringify(record,null,2)+'\n',{flag:'wx'});
   console.log(`Created review candidate: ${path}`);
 } else console.log(JSON.stringify(record,null,2));
} catch(e){console.error(`Import failed: ${e.message}`);process.exitCode=1;}
