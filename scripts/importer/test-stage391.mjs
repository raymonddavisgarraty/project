import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {auditEditorial391} from './editorial391.mjs';
const root=await mkdtemp(join(tmpdir(),'stage391-'));
try{
 const slug='example-game',sha='a'.repeat(64),publishedDir=join(root,'published');await mkdir(publishedDir);
 const staging={schemaVersion:1,status:'approved-staging',autoPublish:false,sourceCandidate:{file:'example-game.json',hash:sha,url:'https://example.org/game'},review:{reviewer:'Editor',confirmedRights:true,evidence:[{url:'https://example.org/game',note:'Official'}]},facts:{title:'Example Game',providerId:'verified-provider',reels:5,releaseDate:'2020-01-01',rtp:96.5,volatility:'high'}};
 const e={slug,seo:{metaTitle:'Example Game review',metaDescription:'Independent Example Game review',h1:'Example Game Review'},hero:{title:'Example Game',description:'This independent review describes the verified game features.'},sections:{overview:{title:'Overview',text:'A review of the game.'},features:{title:'Features',items:['Game information is based on evidence']},gameplay:{title:'Gameplay',text:'This is a 5-reel game.'},rtpVolatility:{title:'RTP',text:'RTP: 96.50%. High volatility.'}},pros:['Provider verified','Game details checked'],cons:['Limited data'],faq:[{question:'What is the RTP?',answer:'The RTP is 96.5%.'},{question:'How many reels?',answer:'It has 5 reels.'}],author:'review-team',updatedDate:'2026-10-22'};
 const stagingFile=join(root,sha+'.json'),editorialFile=join(root,'editorial.json');
 await writeFile(stagingFile,JSON.stringify(staging));await writeFile(editorialFile,JSON.stringify(e));
 const audit=()=>auditEditorial391({editorialFile,slug,stagingFile,publishedDir});
 let report=await audit();assert.equal(report.ready,true,JSON.stringify(report));
 e.sections.gameplay.text='This is a 6-reel game.';await writeFile(editorialFile,JSON.stringify(e));report=await audit();assert(report.errors.includes('claim:reels-conflicts-with-staging'));
 e.sections.gameplay.text='This is a 5-reel game.';e.sections.rtpVolatility.text='RTP: 97.50%. Low volatility.';await writeFile(editorialFile,JSON.stringify(e));report=await audit();assert(report.errors.includes('claim:rtp-conflicts-with-staging'));assert(report.errors.includes('claim:volatility-conflicts-with-staging'));
 e.sections.rtpVolatility.text='RTP: 96.50%. High volatility.';await writeFile(editorialFile,JSON.stringify(e));
 await writeFile(join(publishedDir,'another-game.js'),'export default '+JSON.stringify({...e,slug:'another-game'})+';\n');
 report=await audit();assert(report.errors.includes('duplicate-published-content'));
 console.log('Stage 39.1 tests OK (facts consistency, published JS comparison, duplicate block, no publishing).');
}finally{await rm(root,{recursive:true,force:true});}
