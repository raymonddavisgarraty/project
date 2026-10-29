import {readdir,readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {loadRegistries,propose36} from './registry36.mjs';
const args=process.argv.slice(2);
const arg=(flag,fallback)=>{const i=args.indexOf(flag);return i<0?fallback:args[i+1]};
const command=args[0];
if (command!=='audit' && command!=='propose') {console.error('Usage: node scripts/importer/run-stage36.mjs audit|propose [--candidates DIR] [--registries DIR] [--out DIR]');process.exit(1)}
const candidates=resolve(arg('--candidates','src/content/import-candidates/lcb'));
const registries=await loadRegistries(arg('--registries','src/content/registries'));
const output=resolve(arg('--out','data/editorial/normalization-proposals'));
const result=[];
for (const filename of (await readdir(candidates)).filter(f=>f.endsWith('.json')).sort()) {
  const bytes=await readFile(join(candidates,filename));
  const candidate=JSON.parse(bytes.toString('utf8'));
  const proposal=propose36(candidate,registries);
  const candidateHash=createHash('sha256').update(bytes).digest('hex');
  const item={file:filename,candidateHash,...proposal};
  if (command==='propose') {
    await mkdir(output,{recursive:true});
    const path=join(output,basename(filename));
    try {await writeFile(path,JSON.stringify(item,null,2)+'\n',{flag:'wx'});item.writeStatus='created';}
    catch(e) {if(e.code==='EEXIST')item.writeStatus='already-exists';else throw e;}
  }
  result.push(item);
}
console.log(JSON.stringify(result,null,2));
