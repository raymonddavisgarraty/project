// Canonical, language-independent identifiers. Unknown providers remain unresolved.
export const providers = [
  { id: 'red-tiger-gaming', name: 'Red Tiger Gaming', aliases: ['Red Tiger', 'Red Tiger Gaming'] },
  { id: 'pragmatic-play', name: 'Pragmatic Play', aliases: ['Pragmatic Play'] },
  { id: 'play-n-go', name: "Play'n GO", aliases: ["Play'n GO", 'Play N Go', 'Playngo'] },
  { id: 'netent', name: 'NetEnt', aliases: ['NetEnt', 'Net Entertainment'] },
  { id: 'nolimit-city', name: 'Nolimit City', aliases: ['Nolimit City', 'NoLimit City'] }
];
const canonical = s => String(s ?? '').normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]+/gu, ' ').trim();
export function resolveProvider(label) {
  if (!label) return { id: null, status: 'missing', sourceLabel: label ?? null };
  const matches = providers.filter(p => [p.name, ...p.aliases].some(a => canonical(a) === canonical(label)));
  if (matches.length === 1) return { id: matches[0].id, status: 'matched', sourceLabel: label };
  return { id: null, status: matches.length ? 'ambiguous' : 'unresolved', sourceLabel: label };
}
