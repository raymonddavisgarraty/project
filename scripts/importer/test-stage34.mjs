import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {loadCandidate,listQueue,makeDraft,decide,validateDraft} from './review34.mjs';
const root=await mkdtemp(join(tmpdir(),'stage371-'));
const candidates=join(root,'candidates'),reviews=join(root,'reviews'),file='test-game--123456789abc.json';
try {
 await mkdir(candidates);
 const candidate={status:'pending-review',source:{url:'https://latestcasinobonuses.bet/slots/test-game/'},importSignature:'signature',facts:{title:'Test Game',providerId:null,releaseDate:'2026-11-19',themes:[],features:[]}};
 await writeFile(join(candidates,file),JSON.stringify(candidate));
 const loaded=await loadCandidate(candidates,file);
 assert.equal((await listQueue(candidates,reviews)).length,1);
 await assert.rejects(()=>loadCandidate(candidates,'../bad.json'),/Unsafe/);
 const draft=makeDraft(candidate,loaded.hash);
 draft.decision='approved';draft.reviewer='Editor';draft.reason='Checked all game attributes';draft.confirmedRights=true;draft.confirmedFacts=true;
 draft.facts.providerId='red-tiger-gaming';draft.facts.releaseDate=null;draft.evidence=[{url:'https://provider.example.com/game',note:'Official provider facts'}];
 validateDraft(draft,candidate,loaded.hash);
 const draftFile=join(root,'draft.json');await writeFile(draftFile,JSON.stringify(draft));
 // Direct Stage 34 approval MUST fail without Stage 36 proposal, even with a valid Stage 34 draft.
 await assert.rejects(()=>decide({candidateDir:candidates,reviewDir:reviews,filename:file,draftPath:draftFile}),/ENOENT|proposal/i);
 // Rejected decisions remain available and immutable.
 draft.decision='rejected';await writeFile(draftFile,JSON.stringify(draft));
 const result=await decide({candidateDir:candidates,reviewDir:reviews,filename:file,draftPath:draftFile});
 assert.equal(result.autoPublish,false);
 assert.equal((await listQueue(candidates,reviews))[0].decision,'rejected');
 await assert.rejects(()=>decide({candidateDir:candidates,reviewDir:reviews,filename:file,draftPath:draftFile}),/already reviewed/);
 const edited=JSON.parse(await readFile(join(candidates,file)));edited.facts.title='Tampered';await writeFile(join(candidates,file),JSON.stringify(edited));
 await assert.rejects(()=>decide({candidateDir:candidates,reviewDir:join(root,'other'),filename:file,draftPath:draftFile}),/does not match/);
 console.log('Stage 34 regression OK (direct approval blocked, rejection allowed, immutable decisions, tamper protection).');
}finally{await rm(root,{recursive:true,force:true});}
