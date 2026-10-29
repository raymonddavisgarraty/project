import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {workflow40,writeWorkflow40} from './workflow40.mjs';
const root=await mkdtemp(join(tmpdir(),'stage40-'));
try{
 const stagingDir=join(root,'staging'),draftDir=join(root,'drafts'),publishedDir=join(root,'published'),factsDir=join(root,'facts');
 await Promise.all([stagingDir,draftDir,publishedDir,factsDir].map(p=>mkdir(p)));
 const hash='a'.repeat(64),slug='sample-game';
 const s={schemaVersion:1,status:'approved-staging',autoPublish:false,sourceCandidate:{file:'sample-game--123456789abc.json',hash,url:'https://example.org/slots/sample-game/'},review:{reviewer:'Editor',confirmedRights:true,evidence:[{url:'https://example.org/official'}]},facts:{title:'Sample Game',providerId:'test-provider',reels:5,releaseDate:'2020-01-01'}};
 await writeFile(join(stagingDir,hash+'.json'),JSON.stringify(s));
 const opts={stagingDir,draftDir,publishedDir,factsDir};
 let report=await workflow40(opts);assert.equal(report.counts.needsEditorial,1);assert.equal(report.items[0].slug,slug);
 await writeFile(join(draftDir,'orphan.json'),'{}');
 report=await workflow40(opts);assert.equal(report.counts.unlinkedDrafts,1);
 await writeFile(join(draftDir,slug+'.json'),'{}');
 report=await workflow40(opts);assert.equal(report.items.find(x=>x.slug===slug).status,'blocked');
 await writeFile(join(factsDir,slug+'.json'),'{}');
 report=await workflow40(opts);assert.equal(report.counts.publishedOrCollision,1);
 const outFile=join(root,'report.json');await writeWorkflow40({...opts,outFile});
 assert.equal(JSON.parse(await readFile(outFile,'utf8')).autoPublish,false);
 await assert.rejects(()=>writeWorkflow40({...opts,outFile}),/EEXIST/);
 assert.equal((await readFile(join(draftDir,slug+'.json'),'utf8')),'{}');
 console.log('Stage 40 tests OK (triage, orphan drafts, audit block, publication collision, read-only, no overwrite).');
}finally{await rm(root,{recursive:true,force:true});}
