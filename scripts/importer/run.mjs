import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { discoverSitemap, extractGame, candidate } from './core.mjs';

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const fixture = opt('--fixture');
const sitemap = opt('--sitemap');
const pageUrl = opt('--url');
const allowNetwork = args.includes('--allow-network');
const outDir = resolve('src/content/import-candidates/games');
const max = Math.min(Math.max(Number(opt('--max') || 10), 1), 25);
const now = new Date().toISOString();
if ((!fixture && !sitemap && !pageUrl) || [fixture, sitemap, pageUrl].filter(Boolean).length !== 1) {
  console.error('Usage: node scripts/importer/run.mjs --fixture tests/fixtures/sample-game.html [--url-source https://example.com/games/example/] OR --sitemap https://domain/sitemap.xml --allow-network [--max 10] OR --url https://domain/game/ --allow-network'); process.exit(2);
}
async function fetchText(url) {
  if (!allowNetwork) throw new Error('Network access requires --allow-network');
  const u = new URL(url);
  if (u.protocol !== 'https:' || u.username || u.password) throw new Error('Only HTTPS URLs without credentials are allowed');
  const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), 12000);
  try {
    const r = await fetch(u, { signal: ac.signal, redirect: 'error', headers: { 'user-agent': 'SEOReviewPlatformResearchBot/0.1 (manual testing; contact site owner)', accept: 'text/html,application/xml,text/xml' } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const size = Number(r.headers.get('content-length') || 0); if (size > 2_000_000) throw new Error('Response too large');
    const body = await r.text(); if (body.length > 2_000_000) throw new Error('Response too large');
    return body;
  } finally { clearTimeout(timer); }
}
const records = [];
if (fixture) {
  const html = await readFile(resolve(fixture), 'utf8');
  records.push({ html, url: opt('--url-source') || 'https://example.org/slots/sample-game/' });
} else if (pageUrl) {
  records.push({ html: await fetchText(pageUrl), url: pageUrl });
} else {
  const xml = await fetchText(sitemap);
  const urls = discoverSitemap(xml, sitemap, max).filter(u => !u.endsWith('.xml'));
  console.log(`Found ${urls.length} same-host URLs. Generic extractor only; no site-specific fields assumed.`);
  for (const url of urls) {
    try { records.push({ html: await fetchText(url), url }); }
    catch (e) { console.warn(`Skipped ${url}: ${e.message}`); }
    await new Promise(r => setTimeout(r, 1500));
  }
}
await mkdir(outDir, { recursive: true });
let count = 0;
for (const { html, url } of records) {
  try {
    const item = candidate(extractGame(html, url), now);
    const safeHost = item.source.domain.replace(/[^a-z0-9.-]/gi, '_');
    const name = `${item.data.slug}--${safeHost}--${item.fingerprint.slice(0, 10)}.json`;
    await writeFile(join(outDir, name), JSON.stringify(item, null, 2) + '\n', { flag: 'wx' }).catch(e => { if (e.code !== 'EEXIST') throw e; });
    console.log(`Candidate: ${name} [pending-review]`); count++;
  } catch (e) { console.warn(`Skipped ${url}: ${e.message}`); }
}
console.log(`Prepared ${count} candidates; no published game records changed.`);
