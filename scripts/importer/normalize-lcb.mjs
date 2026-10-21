import { resolveProvider } from './registry.mjs';

const themes = new Map([
  ['америка', 'america'], ['america', 'america'], ['еда', 'food'], ['food', 'food'],
  ['фрукты', 'fruit'], ['fruits', 'fruit'], ['египет', 'egypt'], ['egypt', 'egypt'],
  ['мифология', 'mythology'], ['mythology', 'mythology'], ['приключения', 'adventure'], ['adventure', 'adventure'],
  ['животные', 'animals'], ['animals', 'animals'], ['фэнтези', 'fantasy'], ['fantasy', 'fantasy'],
  ['классика', 'classic'], ['classic', 'classic'], ['древний египет', 'egypt'],
  ['древняя греция', 'ancient-greece'], ['ancient greece', 'ancient-greece'],
  ['азия', 'asia'], ['asia', 'asia'], ['восток', 'oriental'], ['сладости', 'sweets'], ['sweets', 'sweets']
]);
const features = new Map([
  ['фриспины','free-spins'], ['free spins','free-spins'], ['free-spins','free-spins'],
  ['бонусная покупка','bonus-buy'], ['bonus buy','bonus-buy'], ['bonus-buy','bonus-buy'],
  ['вайлд','wild'], ['wild','wild'], ['скаттер','scatter'], ['scatter','scatter'],
  ['каскадные выигрыши','tumbling-reels'], ['tumbling reels','tumbling-reels'], ['tumbling-reels','tumbling-reels']
]);
const clean = s => String(s).normalize('NFKC').trim().toLowerCase().replace(/\s+/g,' ');
function taxonomy(values, map) {
  const normalized = [], unknown = [];
  for (const value of values ?? []) {
    const code = map.get(clean(value));
    if (code) { if (!normalized.includes(code)) normalized.push(code); }
    else if (String(value).trim() && !unknown.includes(value)) unknown.push(value);
  }
  return { normalized, unknown };
}
export function normalizeLCB(record) {
  if (record?.status !== 'pending-review' || !record.facts || !record.source?.url) throw new Error('Invalid LCB candidate');
  const provider = resolveProvider(record.raw?.provider ?? record.facts.providerId);
  const themeResult = taxonomy(record.facts.themes, themes);
  const featureResult = taxonomy(record.facts.features, features);
  const facts = {
    ...record.facts,
    providerId: provider.id,
    themes: themeResult.normalized,
    features: featureResult.normalized
  };
  const issues = [];
  if (provider.status !== 'matched') issues.push(`provider:${provider.status}`);
  if (themeResult.unknown.length) issues.push('themes:unmapped');
  if (featureResult.unknown.length) issues.push('features:unmapped');
  if (facts.releaseDate && facts.releaseDate > new Date().toISOString().slice(0,10)) issues.push('releaseDate:future');
  return {
    ...record,
    schemaVersion: 2,
    source: { ...record.source, normalization: 'lcb-stage30-v1' },
    facts,
    normalization: {
      provider,
      unmappedThemes: themeResult.unknown,
      unmappedFeatures: featureResult.unknown,
      issues
    },
    status: 'pending-review'
  };
}
