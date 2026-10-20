import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('src/content');
const gameDir = resolve(root, 'games');
const provDir = resolve(root, 'provenance/games');
const candidateDir = resolve(root, 'import-candidates/games');
const allowed = new Set(['verified', 'unverified', 'conflict']);
const fields = new Set(['providerId', 'providerName', 'rtp', 'volatility', 'reels', 'paylines', 'paylineType', 'releaseYear', 'maxWinMultiplier', 'hitFrequency']);
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const fail = (message) => { throw new Error(message); };
const isISO = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(v) && !Number.isNaN(Date.parse(v));
const validUrl = (v) => { try { const u = new URL(v); return u.protocol === 'https:' || u.protocol === 'http:'; } catch { return false; } };
const files = readdirSync(gameDir).filter(f => f.endsWith('.json'));
for (const file of files) {
  const game = read(resolve(gameDir, file));
  const path = resolve(provDir, file);
  if (!existsSync(path)) fail(`Missing provenance: ${file}`);
  const record = read(path);
  if (record.gameId !== game.id || record.schemaVersion !== 1) fail(`Provenance identity/schema mismatch: ${file}`);
  if (!record.fields || typeof record.fields !== 'object') fail(`Missing fields: ${file}`);
  for (const field of fields) {
    const entry = record.fields[field];
    if (!entry || !allowed.has(entry.status) || !Array.isArray(entry.evidence)) fail(`${file}: invalid provenance for ${field}`);
    if (entry.status === 'verified' && entry.evidence.length === 0) fail(`${file}: verified ${field} has no evidence`);
    for (const e of entry.evidence) {
      if (!validUrl(e.url) || !isISO(e.observedAt) || !['official', 'secondary', 'other'].includes(e.sourceType)) fail(`${file}: invalid evidence for ${field}`);
      if (!Object.hasOwn(e, 'value')) fail(`${file}: evidence without value for ${field}`);
    }
  }
  for (const key of Object.keys(record.fields)) if (!fields.has(key)) fail(`${file}: unknown field ${key}`);
  console.log(`OK provenance ${game.id}`);
}
for (const file of readdirSync(provDir).filter(f => f.endsWith('.json'))) {
  if (!files.includes(file)) fail(`Orphan provenance: ${file}`);
}
if (existsSync(candidateDir)) for (const file of readdirSync(candidateDir).filter(f => f.endsWith('.json'))) {
  const c = read(resolve(candidateDir, file));
  if (!files.some(f => read(resolve(gameDir, f)).id === c.gameId)) fail(`${file}: unknown gameId`);
  if (!fields.has(c.field) || !Object.hasOwn(c, 'proposedValue') || !validUrl(c.sourceUrl) || !isISO(c.observedAt)) fail(`${file}: invalid candidate`);
  if (!['pending', 'accepted', 'rejected'].includes(c.status)) fail(`${file}: invalid candidate status`);
  if (c.status === 'accepted' && (!c.reviewedAt || !isISO(c.reviewedAt))) fail(`${file}: accepted candidate requires reviewedAt`);
  console.log(`OK candidate ${file}`);
}
console.log(`Validated provenance for ${files.length} games; existing facts unchanged.`);
