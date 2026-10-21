import {createHash} from 'node:crypto';

// Hash stable extracted facts, not volatile collectedAt timestamps or editor notes.
export function candidateSignature(candidate) {
 const stable={url:candidate.source.url,facts:candidate.facts,raw:candidate.raw};
 return createHash('sha256').update(JSON.stringify(stable)).digest('hex');
}
export function qualityReport(candidate,{today=new Date().toISOString().slice(0,10)}={}) {
 const issues=[...(candidate.normalization?.issues||[]).filter(x=>x!=='releaseDate:future')];
 const facts=candidate.facts||{};
 if(!facts.title)issues.push('title:missing');
 if(!facts.providerId)issues.push('provider:missing-id');
 if(facts.releaseDate && facts.releaseDate>today)issues.push('releaseDate:future');
 if(facts.rtp!=null && (!Number.isFinite(Number(facts.rtp)) || Number(facts.rtp)<0 || Number(facts.rtp)>100))issues.push('rtp:invalid');
 if(facts.reels!=null && (!Number.isInteger(facts.reels)||facts.reels<1||facts.reels>20))issues.push('reels:invalid');
 return {status:issues.length?'needs-review':'ready-for-editorial-review',issues:[...new Set(issues)],autoPublish:false};
}
