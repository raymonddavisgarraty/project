import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {makeBrief39,auditEditorial39,createBrief39} from './editorial39.mjs';
const root=await mkdtemp(join(tmpdir(),'stage39-'));
try{
 const sha='a'.repeat(64),slug='test-slot';
 const staging={schemaVersion:1,status:'approved-staging',autoPublish:false,sourceCandidate:{file:'test-slot.json',hash:sha,url:'https://example.org/game'},review:{reviewer:'Editor',confirmedRights:true,evidence:[{url:'https://example.org/game',note:'Official'}]},facts:{title:'Test Slot',providerId:'verified-provider',reels:5,releaseDate:'2020-01-01',rtp:null}};
 const stagingFile=join(root,sha+'.json'),editorialFile=join(root,'editorial.json'),briefFile=join(root,'brief.json'),compareDir=join(root,'other');
 await mkdir(compareDir);await writeFile(stagingFile,JSON.stringify(staging));
 assert.equal(makeBrief39(staging,slug).verifiedFacts.rtp,null);
 await createBrief39({stagingFile,slug,outFile:briefFile});assert.equal(JSON.parse(await readFile(briefFile,'utf8')).publication.includes('Stage 38'),true);
 const editorial={slug,seo:{metaTitle:'Test Slot review',metaDescription:'Independent Test Slot review',h1:'Test Slot Review'},hero:{title:'Test Slot',description:'An independently reviewed slot with basic verified information and no asserted return percentage.'},sections:{overview:{title:'Overview',text:'Game overview details.'},features:{title:'Features',items:['Feature information pending verification']},gameplay:{title:'Gameplay',text:'Gameplay information based on verified evidence.'},rtpVolatility:{title:'RTP',text:'RTP has not been independently verified.'}},pros:['Clearly identified developer','Verified release'],cons:['Limited published technical information'],faq:[{question:'Who made this game?',answer:'The provider is verified.'},{question:'What is the RTP?',answer:'Not independently verified.'}],author:'review-team',updatedDate:'2026-10-22'};
 await writeFile(editorialFile,JSON.stringify(editorial));
 let report=await auditEditorial39({editorialFile,slug,stagingFile,existingEditorialDir:compareDir});assert.equal(report.ready,true,JSON.stringify(report));
 await writeFile(join(compareDir,'other.json'),JSON.stringify({...editorial,slug:'other'}));
 report=await auditEditorial39({editorialFile,slug,stagingFile,existingEditorialDir:compareDir});assert(report.errors.includes('duplicate-editorial-content'));
 await rm(join(compareDir,'other.json'));editorial.sections.rtpVolatility.text='RTP: 97.25%';await writeFile(editorialFile,JSON.stringify(editorial));
 report=await auditEditorial39({editorialFile,slug,stagingFile});assert(report.errors.includes('unverified-rtp-claim'));
 assert.throws(()=>makeBrief39({...staging,facts:{...staging.facts,releaseDate:'2099-01-01'}},slug),/Future/);
 console.log('Stage 39 tests OK (brief, quality gate, duplicate detection, unverified RTP, future release, no publishing).');
}finally{await rm(root,{recursive:true,force:true});}
