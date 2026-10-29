import assert from 'node:assert/strict';
import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadRegistries,resolveEntry,propose36} from './registry36.mjs';
const reg=await loadRegistries();
assert.equal(resolveEntry('Red Tiger Gaming',reg.providers,{requireVerified:true}).id,'red-tiger-gaming');
assert.equal(resolveEntry('Amusnet Interactive',reg.providers,{requireVerified:true}).status,'unverified');
assert.equal(resolveEntry('unknown studio',reg.providers,{requireVerified:true}).id,null);
const record={schemaVersion:2,status:'pending-review',source:{url:'https://example.org/game'},facts:{title:'Example',themes:['fruit'],features:[],releaseDate:'2026-01-01'},raw:{provider:'Amusnet Interactive',themes:'Классика , Фрукты',features:'Jackpot'}};
const proposal=propose36(record,reg);
assert.deepEqual(proposal.themes.ids,['classic','fruit']);
assert.deepEqual(proposal.features.ids,['jackpot']);
assert.equal(proposal.provider.id,null);
assert.equal(proposal.autoPublish,false);
assert.throws(()=>propose36({...record,status:'published'},reg));
const dir=await mkdtemp(join(tmpdir(),'registry36-'));
try {
  for(const [name,items] of Object.entries(reg)) await writeFile(join(dir,`${name}.json`),JSON.stringify(items));
  const providers=structuredClone(reg.providers);
  providers.push({id:'fake',aliases:['Red Tiger Gaming'],verified:true});
  await writeFile(join(dir,'providers.json'),JSON.stringify(providers));
  await assert.rejects(loadRegistries(dir),/ambiguous alias/);
} finally {await rm(dir,{recursive:true,force:true})}
console.log('Stage 36 tests OK (verified providers, themes, features, alias collision, no auto-publish).');
