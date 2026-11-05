// Stage 44.2 provider design *inventory*, not a profile publisher.
// Registry identity != reviewed localized editorial or market clearance.
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function approvedProviderGameIds(audit) {
  const checked = new Set(), duplicate = new Set();
  if (audit?.schemaVersion !== 1 || audit.autoApprove !== false ||
      audit.autoPublish !== false || !Array.isArray(audit.items)) return checked;
  const seen=new Set();
  for (const item of audit.items) {
    if (item?.type !== "game" || !ID.test(item.id || "")) continue;
    if (seen.has(item.id)) duplicate.add(item.id);
    seen.add(item.id);
    const claims = Array.isArray(item.claims) ?
      item.claims.filter(c=>c?.field==="providerId") : [];
    if (claims.length === 1 && claims[0].status === "verified" &&
        Array.isArray(claims[0].codes) && claims[0].codes.length === 0) {
      checked.add(item.id);
    }
  }
  for(const id of duplicate) checked.delete(id);
  return checked;
}
export function buildProviderBlueprint442({
  providers=[], games=[], publishedRoutes=[], audit=null,
}={}) {
  if (![providers,games,publishedRoutes].every(Array.isArray))
    throw new Error("Provider blueprint requires arrays");
  const ids=new Set();
  const knownGameIds=approvedProviderGameIds(audit);
  const gameRoute=new Map();
  for(const route of publishedRoutes) {
    if(route?.type!=="game" || typeof route.entityId!=="string" ||
       !/^\/en\/games\/[a-z0-9-]+\/$/.test(route.path||"")) continue;
    if(gameRoute.has(route.entityId))gameRoute.set(route.entityId,null);
    else gameRoute.set(route.entityId,route.path);
  }
  const blueprints=[];
  for(const provider of providers) {
    if(!ID.test(provider?.id||"") || typeof provider.name!=="string" ||
       !provider.name.trim() || ids.has(provider.id)) {
      throw new Error("Invalid or duplicated provider registry identity");
    }
    ids.add(provider.id);
    const related=[];
    for(const game of games){
      if(!knownGameIds.has(game?.id) || game?.globalFacts?.providerId!==provider.id ||
         game.globalFacts?.id!==game.id || game.globalFacts?.slug!==game.slug) continue;
      const path=gameRoute.get(game.id);
      if(!path || path!=="/en/games/"+game.slug+"/") continue;
      related.push(Object.freeze({entityId:game.id,url:path,title:game.title,
        relationshipStatus:"source-reviewed-provider-id"}));
    }
    blueprints.push(Object.freeze({
      id:provider.id,displayName:provider.name.trim(),
      registryStatus:provider.verified===true?"identity-registry-matched":"identity-pending",
      previewOnly:true,
      route:null, // Never synthesize an indexable provider URL.
      localizedEditorialApproved:false,
      jurisdictionApproved:false,
      productionReleaseAllowed:false,
      reviewedGameLinks:Object.freeze(related.slice(0,12)),
      nextActions:Object.freeze([
        "Confirm legal manufacturer identity with first-party sources",
        "Create original English editorial overview with cited claims",
        "Human-review provider and game relationships",
        "Approve applicable jurisdictions and market restrictions",
        "Assign explicit released route only after editorial and technical gates",
      ])
    }));
  }
  return Object.freeze({schemaVersion:1,kind:"provider-design-inventory",
    generatedRoutes:Object.freeze([]),autoPublish:false,profiles:Object.freeze(blueprints)});
}
