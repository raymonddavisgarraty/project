import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import {qualityReport, candidateSignature} from './quality33.mjs';
import { canonicalizeGameUrl } from './discovery31.mjs';
import { extractLatestCasinoBonuses } from './adapters/latestcasinobonuses.mjs';
import { normalizeLCB } from './normalize-lcb.mjs';

export const HOST = 'latestcasinobonuses.bet';
const agent = 'SEOReviewResearchBot';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const hash = x => createHash('sha256').update(x).digest('hex').slice(0,12);

export function robotsAllowed(text, path, userAgent=agent) {
  // Conservative minimal robots parser: on unsupported or malformed rules, fail closed upstream.
  if (typeof text !== 'string' || !text.trim()) return false;
  const groups = []; let current = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.split('#')[0].trim(); if (!line) continue;
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i); if (!m) continue;
    const key=m[1].toLowerCase(), value=m[2].trim();
    if(key==='user-agent') {
      if(!current || current.hasRules) {current={agents:[],rules:[],hasRules:false}; groups.push(current);}
      current.agents.push(value.toLowerCase());
    } else if ((key==='allow'||key==='disallow') && current) {
      current.hasRules=true; if(value) current.rules.push({type:key,path:value});
    }
  }
  const specific=groups.filter(g=>g.agents.includes(userAgent.toLowerCase()));
  const selected=specific.length?specific:groups.filter(g=>g.agents.includes('*'));
  if(!selected.length) return true;
  const rules=selected.flatMap(g=>g.rules);
  const matches=rules.filter(r=>{
    const regex='^'+r.path.split('*').map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*').replace(/\$$/,'$');
    try {return new RegExp(regex).test(path);} catch{return false;}
  }).sort((a,b)=>b.path.length-a.path.length || (a.type==='allow'?-1:1));
  return matches[0]?.type !== 'disallow';
}

export function selectPending(manifest, limit=3) {
  if (!manifest || manifest.schemaVersion!==1 || !manifest.records || Array.isArray(manifest.records)) throw new Error('Invalid Stage 31 discovery manifest');
  if (!Number.isInteger(limit) || limit<1 || limit>5) throw new Error('Limit must be 1..5');
  return Object.values(manifest.records).filter(x=>x && ['new','changed'].includes(x.status) && canonicalizeGameUrl(x.url,HOST)===x.url).sort((a,b)=>a.url.localeCompare(b.url)).slice(0,limit);
}

async function fetchText(url, {fetchImpl=fetch, timeoutMs=12000, maxBytes=3000000}={}) {
  const u=new URL(url);
  if(u.protocol!=='https:' || u.hostname!==HOST || u.port || u.username || u.password) throw new Error('Unapproved host or scheme');
  const response=await fetchImpl(url,{redirect:'manual',signal:AbortSignal.timeout(timeoutMs),headers:{'User-Agent':`${agent}/0.1 (+manual research; contact site owner)`, 'Accept':'text/html, text/plain;q=0.8'}});
  if(response.status>=300 && response.status<400) throw new Error('Redirect blocked');
  if(!response.ok) throw new Error(`HTTP ${response.status}`);
  const contentType=response.headers.get('content-type')||'';
  if(!/text\/html|text\/plain/i.test(contentType)) throw new Error('Unexpected content-type');
  const length=Number(response.headers.get('content-length')||0);
  if(length>maxBytes) throw new Error('Response too large');
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(bytes.length>maxBytes) throw new Error('Response too large');
  return new TextDecoder('utf-8',{fatal:false}).decode(bytes);
}

async function fileExists(path){try{await readFile(path);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}

export async function runPipeline({statePath='data/discovery/lcb-urls.json', outDir='src/content/import-candidates/lcb', limit=3, mode='offline', htmlByUrl={}, fetchImpl=fetch, delayMs=3000, robotsText=null, write=false, now=new Date().toISOString()}={}) {
  const stateFile=resolve(statePath);
  const state=JSON.parse(await readFile(stateFile,'utf8'));
  const selected=selectPending(state,limit);
  const summary={mode,selected:selected.length,processed:0,written:0,skipped:0,errors:[],results:[]};
  if(mode!=='offline' && mode!=='network') throw new Error('Invalid mode');
  if(mode==='network' && (!robotsText || !robotsAllowed(robotsText,'/slots/'))) throw new Error('Robots permission not established for /slots/');
  for(const item of selected) {
    const url=item.url;
    try {
      if(mode==='network' && !robotsAllowed(robotsText,new URL(url).pathname)) {summary.skipped++; summary.results.push({url,status:'robots-disallowed'});continue;}
      let html;
      if(mode==='offline') {
        const htmlPath=htmlByUrl[url]; if(!htmlPath) {summary.skipped++;summary.results.push({url,status:'no-local-html'});continue;}
        html=await readFile(resolve(htmlPath),'utf8');
      } else {
        if(summary.processed>0) await sleep(delayMs);
        html=await fetchText(url,{fetchImpl});
      }
      if(Buffer.byteLength(html)>3000000) throw new Error('HTML too large');
      const candidate=normalizeLCB(extractLatestCasinoBonuses(html,url));
      const slug=new URL(url).pathname.split('/').filter(Boolean).at(-1);
      const filename=`${slug}--${hash(url.replace(/\/$/,''))}.json`;
      const quality=qualityReport(candidate);
      const signature=candidateSignature(candidate);
      if(write && item.candidateFile && item.signature === signature) {
        item.status='fetched'; item.checkedAt=now; summary.skipped++; summary.processed++;
        summary.results.push({url,status:'unchanged',filename:item.candidateFile,issues:quality.issues});
        continue;
      }
      if(write) {
        await mkdir(resolve(outDir),{recursive:true});
        // Never overwrite a manually edited candidate; put changed source data into a review revision.
        let destination=join(resolve(outDir),filename);
        if(item.candidateFile || await fileExists(destination)) destination=join(resolve(outDir),`${slug}--${hash(url.replace(/\/$/,''))}--rev-${signature.slice(0,12)}.json`);
        const payload={...candidate,quality,importSignature:signature};
        try { await writeFile(destination,JSON.stringify(payload,null,2)+'\n',{flag:'wx'}); }
        catch(e){if(e.code!=='EEXIST')throw e;}
        item.status='fetched'; item.fetchedAt=now; item.checkedAt=now; item.candidateFile=destination.split(/[\\/]/).at(-1); item.signature=signature;
        summary.written++;
      }
      summary.processed++; summary.results.push({url,status:write?'candidate-written':'preview',filename:write?item.candidateFile:filename,issues:quality.issues,quality:quality.status});
    } catch(e) {summary.errors.push({url,error:e.message});}
  }
  if(write) {await mkdir(dirname(stateFile),{recursive:true}); await writeFile(stateFile,JSON.stringify(state,null,2)+'\n');}
  return summary;
}

export async function fetchRobots({fetchImpl=fetch}={}) {
  // Never follow redirects or use arbitrary user-provided hosts.
  const response=await fetchImpl(`https://${HOST}/robots.txt`,{redirect:'manual',signal:AbortSignal.timeout(10000),headers:{'User-Agent':`${agent}/0.1`}});
  if(!response.ok || response.status>=300 && response.status<400) throw new Error(`robots.txt unavailable: HTTP ${response.status}`);
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(bytes.length>1000000) throw new Error('robots.txt too large');
  return new TextDecoder().decode(bytes);
}
