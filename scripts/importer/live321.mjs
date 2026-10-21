import {readFile, writeFile, mkdir, mkdtemp, rm} from 'node:fs/promises';
import {dirname, resolve, join} from 'node:path';
import {tmpdir} from 'node:os';
import {parseSitemap, discoverFromDocuments, updateDiscovery} from './discovery31.mjs';
import {HOST, robotsAllowed, fetchRobots, runPipeline} from './pipeline32.mjs';

const ORIGIN=`https://${HOST}`;
const AGENT='SEOReviewResearchBot/0.1 (+manual research; contact site owner)';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
const validUrl=(url)=>{const u=new URL(url);if(u.protocol!=='https:'||u.hostname!==HOST||u.port||u.username||u.password||u.search||u.hash)throw Error('Unapproved URL');return u;};
export async function getXml(url,{fetchImpl=fetch,robotsText,timeoutMs=15000,maxBytes=2_000_000}={}){
 const u=validUrl(url);
 if(!robotsText||!robotsAllowed(robotsText,u.pathname))throw Error('robots.txt disallows '+u.pathname);
 const res=await fetchImpl(url,{redirect:'manual',signal:AbortSignal.timeout(timeoutMs),headers:{'User-Agent':AGENT,'Accept':'application/xml, text/xml;q=0.9'}});
 if(!res.ok)throw Error(`HTTP ${res.status} for ${u.pathname}`);
 if(res.status>=300&&res.status<400)throw Error('Redirect blocked');
 if(!/\b(xml|text\/plain)\b/i.test(res.headers.get('content-type')||''))throw Error('Unexpected Sitemap content-type');
 if(Number(res.headers.get('content-length')||0)>maxBytes)throw Error('Sitemap too large');
 // Stream and enforce cap even when Content-Length is absent.
 const chunks=[];let total=0;
 if(res.body){for await(const chunk of res.body){total+=chunk.byteLength;if(total>maxBytes){await res.body.cancel?.().catch(()=>{});throw Error('Sitemap too large');}chunks.push(Buffer.from(chunk));}}
 else {const b=Buffer.from(await res.arrayBuffer());total=b.length;if(total>maxBytes)throw Error('Sitemap too large');chunks.push(b);}
 return Buffer.concat(chunks).toString('utf8');
}
export function slotSitemaps(indexXml,maxMaps=1){
 if(!Number.isInteger(maxMaps)||maxMaps<1||maxMaps>3)throw Error('maxMaps must be 1..3');
 const index=parseSitemap(indexXml);if(index.kind!=='index')throw Error('Expected Sitemap Index');
 return index.entries.map(e=>e.loc).filter(u=>{try{return /^\/sitemap-slots(?:-\d+)?\.xml$/.test(validUrl(u).pathname);}catch{return false;}}).slice(0,maxMaps);
}
export async function liveImport({statePath='data/discovery/lcb-live-urls.json',outDir='src/content/import-candidates/lcb',maxMaps=1,limit=3,write=false,fetchImpl=fetch,robotsText,delayMs=10000,run=runPipeline,sleep=pause}={}){
 if(!robotsText)throw Error('robots.txt must be retrieved and checked');
 if(!Number.isInteger(limit)||limit<1||limit>5)throw Error('limit must be 1..5');
 if(delayMs<10000)throw Error('Minimum delay is 10000ms');
 const indexXml=await getXml(`${ORIGIN}/sitemap-index.xml`,{fetchImpl,robotsText});
 const maps=slotSitemaps(indexXml,maxMaps);if(!maps.length)throw Error('No permitted slot sitemaps found');
 const documents=[];
 for(const url of maps){await sleep(delayMs);documents.push({path:url,xml:await getXml(url,{fetchImpl,robotsText})});}
 const found=discoverFromDocuments(documents,{max:2000});
 let previous=null;try{previous=JSON.parse(await readFile(resolve(statePath),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const {manifest,stats}=updateDiscovery(previous,found,new Date().toISOString());
 // Dry-run never mutates the real discovery state or candidate directory.
 let temporary=null;let workingState=resolve(statePath);
 if(!write){temporary=await mkdtemp(join(tmpdir(),'lcb-live-preview-'));workingState=join(temporary,'state.json');}
 try{
  await mkdir(dirname(workingState),{recursive:true});
  await writeFile(workingState,JSON.stringify(manifest,null,2)+'\n');
  await sleep(delayMs);
  const result=await run({statePath:workingState,outDir,limit,mode:'network',fetchImpl,delayMs,robotsText,write});
  return {mode:write?'write':'dry-run',maps:maps.length,...stats,fetch:result};
 }finally{if(temporary)await rm(temporary,{recursive:true,force:true});}
}
export {fetchRobots};
