import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const key = s => String(s ?? '').normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]+/gu,' ').trim();
export async function loadRegistries(root='src/content/registries') {
  const read = async name => JSON.parse(await readFile(resolve(root,`${name}.json`),'utf8'));
  const data = {providers:await read('providers'),themes:await read('themes'),features:await read('features')};
  for (const [kind,entries] of Object.entries(data)) {
    if (!Array.isArray(entries)) throw new Error(`${kind}: expected array`);
    const ids=new Set(), aliases=new Map();
    for (const entry of entries) {
      if (!entry.id || !Array.isArray(entry.aliases)) throw new Error(`${kind}: invalid entry`);
      if (ids.has(entry.id)) throw new Error(`${kind}: duplicate id ${entry.id}`);
      ids.add(entry.id);
      for (const alias of [entry.id,entry.name,...entry.aliases]) {
        if (!alias) continue;
        const k=key(alias), prior=aliases.get(k);
        if (prior && prior!==entry.id) throw new Error(`${kind}: ambiguous alias ${alias}`);
        aliases.set(k,entry.id);
      }
    }
  }
  return data;
}
export function resolveEntry(value,entries,{requireVerified=false}={}) {
  if (!value) return {id:null,status:'missing',sourceLabel:value??null};
  const matches=entries.filter(e=>[e.id,e.name,...e.aliases].some(a=>a && key(a)===key(value)));
  if (matches.length!==1) return {id:null,status:matches.length?'ambiguous':'unresolved',sourceLabel:value};
  if (requireVerified && matches[0].verified!==true) return {id:null,status:'unverified',proposedId:matches[0].id,sourceLabel:value};
  return {id:matches[0].id,status:'matched',sourceLabel:value};
}
export function resolveMany(values,entries) {
  const ids=[],unknown=[];
  for (const value of values) {
    const result=resolveEntry(value,entries);
    if (result.id) {if (!ids.includes(result.id)) ids.push(result.id);}
    else if (String(value).trim() && !unknown.includes(value)) unknown.push(value);
  }
  return {ids,unknown};
}
export function splitLabels(value) {
  if (Array.isArray(value)) return value.flatMap(splitLabels);
  if (typeof value!=='string') return [];
  return value.split(/[,;|،，]+/u).map(s=>s.trim()).filter(Boolean);
}
export function propose36(candidate,registries) {
  if (candidate?.schemaVersion!==2 || candidate?.status!=='pending-review' || !candidate?.facts || !candidate?.source?.url) throw new Error('Invalid pending-review candidate');
  const provider=resolveEntry(candidate.raw?.provider ?? candidate.facts.providerId,registries.providers,{requireVerified:true});
  const themes=resolveMany([...splitLabels(candidate.raw?.themes),...splitLabels(candidate.facts.themes)],registries.themes);
  const features=resolveMany([...splitLabels(candidate.raw?.features),...splitLabels(candidate.facts.features)],registries.features);
  const issues=[];
  if (provider.status!=='matched') issues.push(`provider:${provider.status}`);
  if (themes.unknown.length) issues.push('themes:unmapped');
  if (features.unknown.length) issues.push('features:unmapped');
  if (candidate.facts.releaseDate && candidate.facts.releaseDate>new Date().toISOString().slice(0,10)) issues.push('releaseDate:future');
  return {title:candidate.facts.title,sourceUrl:candidate.source.url,provider,themes,features,issues,reviewRequired:true,autoPublish:false};
}
