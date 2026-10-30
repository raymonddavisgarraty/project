// Stage 44.2: only individually source-reviewed casino type values can be
// used as catalogue filters; withdrawal offers and ratings remain excluded.
const TYPES = new Map([
  ["slots", "Slots"],
  ["crypto", "Crypto"],
  ["live", "Live casino"],
  ["mixed", "Mixed"],
]);
export function buildCasinoCatalog442({ casinos = [], editorialFields = null } = {}) {
  if (!Array.isArray(casinos)) throw new Error("Casinos must be an array");
  const types = new Map();
  for (const casino of casinos) {
    const rows = editorialFields?.casinoRows?.(casino);
    if (!Array.isArray(rows)) continue;
    const matches = rows.filter(r => r?.field === "type" && r.reviewStatus === "claim-verified");
    if (matches.length !== 1) continue;
    const type = typeof casino.type === "string" ? casino.type.trim().toLowerCase() : "";
    if (!TYPES.has(type) || matches[0].value.trim().toLowerCase() !== type) continue;
    types.set(type, TYPES.get(type));
  }
  return Object.freeze({
    types: Object.freeze([...types].map(([value,label])=>Object.freeze({value,label}))
      .sort((a,b)=>a.label.localeCompare(b.label,"en"))),
    withdrawalAvailable: false,
    ratingSortAvailable: false,
  });
}
