// Deny by default. English-language pages are globally accessible: a single
// country approval must never be treated as global audience targeting.
function approved(value) { return value === "approved"; }

export function safeExternalUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  let url;
  try { url = new URL(value); }
  catch { return null; }
  const host = url.hostname.toLowerCase();
  if (url.protocol !== "https:" || url.username || url.password ||
      host === "localhost" || host === "example.com" ||
      /(^|\.)(example\.(com|org|net)|test|invalid|local)$/.test(host) ||
      /^(127\.|10\.|192\.168\.)/.test(host)) return null;
  return url.toString();
}

export function resolveCommercialOffer({ entity, partners = [], markets = {}, policy = {} } = {}) {
  // A global static page cannot restrict offers based on visitor jurisdiction.
  if (policy.globalCommercialApproved !== true) return null;
  const approval = entity?.commercialApproval;
  if (!approval || !approved(approval.status) || approval.scope !== "global" ||
      approval.rightsChecked !== true) return null;
  const codes = approval.marketCodes;
  if (!Array.isArray(codes) || codes.length === 0 ||
      codes.some(code => !markets[code] || !approved(markets[code].publicationStatus) ||
        !approved(markets[code].commercialStatus))) return null;

  const affiliateId = entity?.monetization?.affiliateId || entity?.affiliateId;
  if (typeof affiliateId !== "string") return null;
  const partner = partners.find(item => item.id === affiliateId);
  if (!partner || !approved(partner.status) || partner.globalRightsApproved !== true ||
      !Array.isArray(partner.marketCodes) ||
      codes.some(code => !partner.marketCodes.includes(code))) return null;

  const playUrl = safeExternalUrl(partner.url);
  const bonusUrl = safeExternalUrl(partner.bonusUrl);
  if (!playUrl && !bonusUrl) return null;

  const demoApproval = entity.demoApproval;
  const demoUrl = policy.globalDemoApproved === true &&
    approved(demoApproval?.status) && demoApproval?.rightsChecked === true
      ? safeExternalUrl(partner.demoUrl)
      : null;
  return { playUrl, bonusUrl, demoUrl };
}
