import { createHash } from 'node:crypto';

const decode = s => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
export function parseSitemap(xml) {
  if (typeof xml !== 'string' || xml.length > 10_000_000) throw new Error('Invalid/oversized XML');
  const kind = /<(?:\w+:)?sitemapindex\b/i.test(xml) ? 'index' : /<(?:\w+:)?urlset\b/i.test(xml) ? 'urlset' : null;
  if (!kind) throw new Error('Expected sitemapindex or urlset XML');
  const tag = kind === 'index' ? 'sitemap' : 'url';
  const re = new RegExp(`<(?:\\w+:)?${tag}\\b[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?${tag}>`, 'gi');
  const entries = [];
  for (const m of xml.matchAll(re)) {
    const loc = m[1].match(/<(?:\w+:)?loc\b[^>]*>([\s\S]*?)<\/(?:\w+:)?loc>/i)?.[1]?.trim();
    const lastmod = m[1].match(/<(?:\w+:)?lastmod\b[^>]*>([\s\S]*?)<\/(?:\w+:)?lastmod>/i)?.[1]?.trim();
    if (loc) entries.push({ loc: decode(loc), lastmod: lastmod || null });
  }
  return { kind, entries };
}
export function canonicalizeGameUrl(raw, allowedHost) {
  let u;
  try { u = new URL(raw); } catch { return null; }
  if (u.protocol !== 'https:' || u.username || u.password || u.hostname.toLowerCase() !== allowedHost.toLowerCase() || u.port) return null;
  if (!/^\/slots\/[a-z0-9][a-z0-9-]*\/?$/i.test(u.pathname)) return null;
  const slug = u.pathname.split('/').filter(Boolean)[1];
  if (['videoslots', 'all', 'new', 'popular'].includes(slug.toLowerCase())) return null;
  return `${u.origin}/slots/${slug.toLowerCase()}/`;
}
export function discoverFromDocuments(documents, { host = 'latestcasinobonuses.bet', max = 10000 } = {}) {
  if (!Array.isArray(documents) || documents.length > 200) throw new Error('Too many documents');
  const byUrl = new Map();
  for (const doc of documents) {
    const parsed = parseSitemap(doc.xml);
    if (parsed.kind !== 'urlset') continue;
    for (const entry of parsed.entries) {
      const url = canonicalizeGameUrl(entry.loc, host);
      if (!url) continue;
      const prev = byUrl.get(url);
      if (!prev || (entry.lastmod && (!prev.lastmod || entry.lastmod > prev.lastmod))) byUrl.set(url, { url, lastmod: entry.lastmod });
      if (byUrl.size > max) throw new Error(`Game URL limit exceeded: ${max}`);
    }
  }
  return [...byUrl.values()].sort((a,b) => a.url.localeCompare(b.url));
}
export function updateDiscovery(previous, found, observedAt) {
  const prior = previous?.records || {};
  const records = { ...prior };
  let added = 0, changed = 0, unchanged = 0;
  for (const {url,lastmod} of found) {
    const id = createHash('sha256').update(url).digest('hex').slice(0, 16);
    const old = records[id];
    const modified = Boolean(old && lastmod && old.lastmod && lastmod !== old.lastmod);
    if (!old) added++; else if (modified) changed++; else unchanged++;
    records[id] = { ...old, url, lastmod: lastmod || old?.lastmod || null, firstSeenAt: old?.firstSeenAt || observedAt, lastSeenAt: observedAt, status: !old ? 'new' : modified ? 'changed' : old.status || 'discovered' };
  }
  return { manifest: { schemaVersion: 1, records }, stats: { discovered: found.length, added, changed, unchanged, total: Object.keys(records).length } };
}
