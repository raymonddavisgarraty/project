import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {loadCandidate,makeDraft,decide} from './review34.mjs';
import {auditQueue,stageApproved} from './stage35.mjs';
import {loadRegistries,propose36} from './registry36.mjs';

const root=await mkdtemp(join(tmpdir(),'stage35-'));
const candidateDir=join(root,'candidates');
const reviewDir=join(root,'reviews');
const outDir=join(root,'staging');
const proposalDir=join(root,'proposals');
const registryDir=join(root,'registries');
const filename='test-game--123456789abc.json';
const futureFilename='future-game--123456789abc.json';

async function putJSON(path,value) {await writeFile(path,JSON.stringify(value,null,2)+'\n');}
try {
 await Promise.all([candidateDir,reviewDir,outDir,proposalDir,registryDir].map(p=>mkdir(p,{recursive:true})));
 // Entire fixture is isolated; it does not modify the project's real registries or proposals.
 await putJSON(join(registryDir,'providers.json'),[
  {id:'verified-provider',name:'Verified Provider',aliases:['Verified Provider'],verified:true}
 ]);
 await putJSON(join(registryDir,'themes.json'),[
  {id:'fruit',name:'Fruit',aliases:['Fruit','Фрукты']}
 ]);
 await putJSON(join(registryDir,'features.json'),[]);
 const registries=await loadRegistries(registryDir);
 const makeCandidate=(title,releaseDate)=>({
  schemaVersion:2,status:'pending-review',
  source:{url:`https://latestcasinobonuses.bet/slots/${title.toLowerCase().replace(/ /g,'-')}/`},
  facts:{title,providerId:null,releaseDate,rtp:null,reels:5,themes:['fruit'],features:[]},
  raw:{provider:'Verified Provider',themes:'Fruit',features:''},
  normalization:{issues:[]}
 });
 const candidate=makeCandidate('Test Game','2020-01-01');
 const future=makeCandidate('Future Game','2999-11-19');
 await putJSON(join(candidateDir,filename),candidate);
 await putJSON(join(candidateDir,futureFilename),future);
 const queue=await auditQueue({candidateDir,reviewDir,today:'2026-10-22'});
 assert.equal(queue.length,2);
 assert(queue.find(x=>x.file===futureFilename).issues.includes('releaseDate:future'));
 await assert.rejects(()=>stageApproved({candidateDir,reviewDir,outDir,filename}),{code:'ENOENT'});
 const makeProposal=async(file,record)=>{
  const {hash}=await loadCandidate(candidateDir,file);
  const proposal={file,candidateHash:hash,...propose36(record,registries)};
  await putJSON(join(proposalDir,file),proposal);
  return hash;
 };
 const hash=await makeProposal(filename,candidate);
 await makeProposal(futureFilename,future);
 const draft=makeDraft(candidate,hash);
 Object.assign(draft,{
  decision:'approved',reviewer:'Test Editor',reason:'Fixture verified against independent evidence',
  confirmedRights:true,confirmedFacts:true,
  evidence:[{url:'https://provider.example.org/official',note:'Independent test fixture evidence'}]
 });
 draft.facts.providerId='verified-provider';
 const draftPath=join(root,'draft.json');await putJSON(draftPath,draft);
 await decide({candidateDir,reviewDir,filename,draftPath,proposalDir,registryDir});
 const staged=await stageApproved({candidateDir,reviewDir,outDir,filename});
 const data=JSON.parse(await readFile(staged.output,'utf8'));
 assert.equal(data.autoPublish,false);
 assert.equal(data.status,'approved-staging');
 assert.equal(data.facts.providerId,'verified-provider');
 await assert.rejects(()=>stageApproved({candidateDir,reviewDir,outDir,filename}),{code:'EEXIST'});
 // Approval of a future-release candidate must fail even if an editor clears its date.
 const {hash:futureHash}=await loadCandidate(candidateDir,futureFilename);
 const futureDraft=makeDraft(future,futureHash);
 Object.assign(futureDraft,{
  decision:'approved',reviewer:'Test Editor',reason:'Attempt to bypass future release gate',
  confirmedRights:true,confirmedFacts:true,
  evidence:[{url:'https://provider.example.org/official',note:'Independent test fixture evidence'}]
 });
 futureDraft.facts.providerId='verified-provider';
 futureDraft.facts.releaseDate=null;
 const futureDraftPath=join(root,'future-draft.json');await putJSON(futureDraftPath,futureDraft);
 await assert.rejects(
  ()=>decide({candidateDir,reviewDir,filename:futureFilename,draftPath:futureDraftPath,proposalDir,registryDir}),
  /future release date/i
 );
 console.log('Stage 35 tests OK (unified approval gate, future-release block, staging, hash binding, no overwrite, no publish).');
} finally {
 await rm(root,{recursive:true,force:true});
}
