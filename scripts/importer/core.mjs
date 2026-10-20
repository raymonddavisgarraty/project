import { createHash } from 'node:crypto';

export function slugify(s) { return String(s).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100); }
export function decodeEntities(s) { return String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }
export function discoverSitemap(xml, base, max = 100) {
  const entries = [...xml.matchAll(/<loc(?:\s[^>]*)?>([\s\S]*?)<\/loc>/gi)].map(m => decodeEntities(m[1].trim()));
  return [...new Set(entries)].filter(s => { try { const u = new URL(s, base); return u.protocol === 'https:' && u.origin === new URL(base).origin; } catch { return false; } }).slice(0, max);
}
function meta(html, key) {
  for (const m of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = m[0];
    const prop = /(?:name|property)\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (prop?.toLowerCase() === key.toLowerCase()) return decodeEntities(/content\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] || '');
  }
  return null;
}
function ldObjects(html) {
  const objects = [];
  for (const m of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const data = JSON.parse(m[1]); const flat = Array.isArray(data) ? data : [data]; for (const obj of flat) objects.push(...(Array.isArray(obj?.['@graph']) ? obj['@graph'] : [obj])); } catch { /* invalid source markup */ }
  }
  return objects;
}
export function extractGame(html, url) {
  const jsonld = ldObjects(html);
  const game = jsonld.find(x => /(?:VideoGame|Game|SoftwareApplication)/i.test([].concat(x?.['@type'] || []).join(','))) || {};
  const h1 = /<h1\b[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const title = String(game.name || h1 || meta(html, 'og:title') || '').trim();
  const providerName = typeof game.publisher === 'string' ? game.publisher : game.publisher?.name || null;
  return { title, providerName, sourceUrl: url, rawSignals: { description: game.description || meta(html, 'description') || null, schemaType: game['@type'] || null } };
}
export function normalize(raw) {
  const title = String(raw.title || '').trim();
  if (!title || title.length > 180) throw new Error('Missing/invalid game title');
  const slug = slugify(title);
  if (!slug) throw new Error('Cannot derive slug');
  const providerName = raw.providerName ? String(raw.providerName).trim() : null;
  return { slug, title, providerName, providerId: null, rtp: null, volatility: null, reels: null, paylines: null, maxWinMultiplier: null, features: [], themes: [] };
}
export function candidate(raw, fetchedAt) {
  const normalized = normalize(raw);
  const sourceUrl = new URL(raw.sourceUrl);
  if (sourceUrl.protocol !== 'https:') throw new Error('HTTPS required');
  const hash = createHash('sha256').update(JSON.stringify({ normalized, sourceUrl: sourceUrl.href })).digest('hex');
  return { schemaVersion: 1, kind: 'game-import-candidate', status: 'pending-review', fetchedAt, source: { url: sourceUrl.href, domain: sourceUrl.hostname }, data: normalized, evidence: Object.fromEntries(['title','providerName'].filter(k => normalized[k] != null).map(k => [k, [{ url: sourceUrl.href, method: 'html-extraction', observedValue: normalized[k] }]])), fingerprint: hash };
}
