import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { parseSitemap, discoverFromDocuments, updateDiscovery } from './discovery31.mjs';
const args = process.argv.slice(2);
const option = name => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1]; };
const files = [];
for (let i = 0; i < args.length; i++) if (args[i] === '--xml') files.push(args[++i]);
if (!files.length || files.some(x => !x) || files.length > 200) {
  console.error('Usage: node scripts/importer/discover-urls.mjs --xml path/to/sitemap.xml [--xml path/to/other.xml] [--state path/to/state.json] [--write]');
  process.exit(2);
}
const statePath = resolve(option('--state') || 'data/discovery/lcb-urls.json');
const documents = await Promise.all(files.map(async path => ({ path, xml: await readFile(resolve(path), 'utf8') })));
const indexes = documents.filter(d => parseSitemap(d.xml).kind === 'index');
const listed = indexes.flatMap(d => parseSitemap(d.xml).entries.map(e => e.loc));
const found = discoverFromDocuments(documents);
let previous = null;
try { previous = JSON.parse(await readFile(statePath, 'utf8')); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const {manifest, stats} = updateDiscovery(previous, found, new Date().toISOString());
const result = { ...stats, sitemapIndexes: indexes.length, nestedSitemapsListed: listed.length, note: listed.length ? 'Sitemap index detected: save and pass its child XML files with additional --xml arguments; no network requests performed.' : 'Offline discovery; no network requests performed.', mode: args.includes('--write') ? 'write' : 'dry-run' };
if (args.includes('--write')) {
  await mkdir(dirname(statePath), { recursive: true });
  await writeFile(statePath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}
console.log(JSON.stringify(result, null, 2));
