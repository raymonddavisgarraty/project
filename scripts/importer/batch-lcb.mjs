// Offline-only batch processing. Manifest entries point to local HTML files.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, join, basename } from 'node:path';
import { createHash } from 'node:crypto';
import { extractLatestCasinoBonuses } from './adapters/latestcasinobonuses.mjs';
import { normalizeLCB } from './normalize-lcb.mjs';

const argv = process.argv.slice(2);
const opt = name => { const i = argv.indexOf(name); return i < 0 ? null : argv[i+1]; };
const manifestPath = opt('--manifest');
if (!manifestPath) { console.error('Usage: node scripts/importer/batch-lcb.mjs --manifest path/to/manifest.json [--write] [--out path/to/dir]'); process.exit(2); }
const writing = argv.includes('--write');
const out = resolve(opt('--out') ?? 'src/content/import-candidates/lcb');
const summary = { processed: 0, valid: 0, issues: 0, errors: [], candidates: [] };
try {
  const manifest = JSON.parse(await readFile(resolve(manifestPath), 'utf8'));
  if (!Array.isArray(manifest) || manifest.length > 100) throw new Error('Manifest must be an array with at most 100 entries');
  const seen = new Set();
  for (const [index, item] of manifest.entries()) {
    summary.processed++;
    try {
      if (!item || typeof item.html !== 'string' || typeof item.url !== 'string') throw new Error('Expected html and url strings');
      const u = new URL(item.url);
      if (u.protocol !== 'https:' || u.hostname !== 'latestcasinobonuses.bet' || u.search || u.hash) throw new Error('Unsupported source URL');
      const identity = u.origin + u.pathname.replace(/\/$/, '');
      if (seen.has(identity)) throw new Error('Duplicate source URL');
      seen.add(identity);
      // The manifest path is resolved relative to the manifest file's directory.
      const htmlPath = resolve(dirname(resolve(manifestPath)), item.html);
      const html = await readFile(htmlPath, 'utf8');
      if (Buffer.byteLength(html, 'utf8') > 3_000_000) throw new Error('HTML file too large');
      const normalized = normalizeLCB(extractLatestCasinoBonuses(html, item.url));
      const slug = u.pathname.split('/').filter(Boolean).at(-1);
      const hash = createHash('sha256').update(identity).digest('hex').slice(0,12);
      const filename = `${slug}--${hash}.json`;
      summary.valid++;
      if (normalized.normalization.issues.length) summary.issues++;
      if (writing) {
        await mkdir(out, { recursive: true });
        try { await writeFile(join(out, filename), JSON.stringify(normalized, null, 2) + '\n', { flag: 'wx' }); }
        catch (error) { if (error.code !== 'EEXIST') throw error; throw new Error('Candidate already exists; not overwritten'); }
      }
      summary.candidates.push({ filename, title: normalized.facts.title, providerId: normalized.facts.providerId, themes: normalized.facts.themes, issues: normalized.normalization.issues });
    } catch (error) { summary.errors.push({ index, html: item?.html ?? null, error: error.message }); }
  }
  console.log(JSON.stringify({ ...summary, mode: writing ? 'write' : 'dry-run' }, null, 2));
  if (summary.errors.length) process.exitCode = 1;
} catch (error) { console.error(error.message); process.exitCode = 1; }
