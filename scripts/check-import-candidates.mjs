import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('src/content/import-candidates/games');
const fail = msg => { throw new Error(msg); };
const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);
const validUrl = v => { try { const u = new URL(v); return u.protocol === 'https:' && !u.username && !u.password; } catch { return false; } };
const iso = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(v) && !Number.isNaN(Date.parse(v));
const failFile = (file, message) => fail(`${file}: ${message}`);
const files = existsSync(root) ? readdirSync(root).filter(x => x.endsWith('.json')) : [];
let importer = 0, field = 0;
for (const file of files) {
  let c;
  try { c = JSON.parse(readFileSync(resolve(root, file), 'utf8')); }
  catch { failFile(file, 'invalid JSON'); }
  if (!isObj(c)) failFile(file, 'candidate must be an object');
  if (c.kind === 'game-import-candidate') {
    if (c.schemaVersion !== 1 || c.status !== 'pending-review') failFile(file, 'invalid importer schema/status');
    if (!iso(c.fetchedAt) || !isObj(c.source) || !validUrl(c.source.url)) failFile(file, 'invalid source/timestamp');
    if (new URL(c.source.url).hostname !== c.source.domain) failFile(file, 'source domain mismatch');
    if (!isObj(c.data) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.data.slug ?? '') || typeof c.data.title !== 'string' || !c.data.title.trim()) failFile(file, 'invalid game data');
    if (typeof c.fingerprint !== 'string' || !/^[a-f0-9]{64}$/i.test(c.fingerprint)) failFile(file, 'invalid fingerprint');
    if (!isObj(c.evidence)) failFile(file, 'missing evidence');
    for (const [key, items] of Object.entries(c.evidence)) {
      if (!Array.isArray(items)) failFile(file, `invalid evidence for ${key}`);
      for (const e of items) if (!isObj(e) || !validUrl(e.url) || !Object.hasOwn(e, 'observedValue')) failFile(file, `invalid evidence item for ${key}`);
    }
    importer++;
  } else if (typeof c.gameId === 'string' && typeof c.field === 'string') {
    // Legacy Stage 27 field proposals; gameId must refer to an existing published record.
    const gamesDir = resolve('src/content/games');
    const ids = new Set(readdirSync(gamesDir).filter(x => x.endsWith('.json')).map(x => JSON.parse(readFileSync(resolve(gamesDir, x), 'utf8')).id));
    const allowedFields = new Set(['providerId', 'providerName', 'rtp', 'volatility', 'reels', 'paylines', 'paylineType', 'releaseYear', 'maxWinMultiplier', 'hitFrequency']);
    if (!ids.has(c.gameId)) failFile(file, 'unknown gameId for field proposal');
    if (!allowedFields.has(c.field) || !Object.hasOwn(c, 'proposedValue') || !validUrl(c.sourceUrl) || !iso(c.observedAt)) failFile(file, 'invalid field proposal');
    if (!['pending', 'accepted', 'rejected'].includes(c.status)) failFile(file, 'invalid field proposal status');
    if (c.status === 'accepted' && !iso(c.reviewedAt)) failFile(file, 'accepted proposal needs reviewedAt');
    field++;
  } else failFile(file, 'unknown candidate format');
  console.log(`OK import candidate ${file}`);
}
console.log(`Validated ${importer} new-game candidates and ${field} field proposals; published data unchanged.`);
