import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {slotSitemaps,liveImport,getXml} from './live321.mjs';
const root='https://latestcasinobonuses.bet';
const robots='User-agent: *\nDisallow: /wp-admin/\n';
const index=`<sitemapindex><sitemap><loc>${root}/sitemap-slots.xml</loc></sitemap><sitemap><loc>${root}/sitemap-casinos.xml</loc></sitemap></sitemapindex>`;
const child=`<urlset><url><loc>${root}/slots/america-burger-bounty/</loc></url></urlset>`;
assert.deepEqual(slotSitemaps(index),[`${root}/sitemap-slots.xml`]);
const requests=[];
const fakeFetch=async url=>{requests.push(url);const body=url.endsWith('sitemap-index.xml')?index:child;return new Response(body,{status:200,headers:{'content-type':'application/xml'}});};
await assert.rejects(()=>getXml('https://evil.example/x.xml',{robotsText:robots,fetchImpl:fakeFetch}),/Unapproved/);
await assert.rejects(()=>getXml(`${root}/wp-admin/a.xml`,{robotsText:robots,fetchImpl:fakeFetch}),/disallows/);
const dir=await mkdtemp(join(tmpdir(),'stage321-'));
try{
 const statePath=join(dir,'state.json');let passed;
 const fakeRun=async args=>{passed=args;return {mode:'network',selected:1,processed:1,written:0,skipped:0,errors:[],results:[]};};
 const result=await liveImport({statePath,robotsText:robots,fetchImpl:fakeFetch,run:fakeRun,delayMs:10000,limit:1,sleep:async()=>{}});
 assert.equal(result.discovered,1);assert.equal(result.maps,1);assert.equal(passed.write,false);
 await assert.rejects(()=>readFile(statePath,'utf8'),{code:'ENOENT'});
 assert.equal(requests.length,2);
 await assert.rejects(()=>liveImport({robotsText:robots,delayMs:0,fetchImpl:fakeFetch}),/Minimum delay/);
 console.log('Stage 32.1 tests OK (sitemap selection, host/robots, discovery, dry-run isolation).');
}finally{await rm(dir,{recursive:true,force:true});}
