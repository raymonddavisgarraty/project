// Stage 42.3 — INTERNAL read-only identity and relation integrity audit.
// Validates generated routes, stable IDs and editorial navigation references.
// It is NOT an approved public catalogue, source review, or Telegram/Studio API.
const ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const recordKey=(type,id)=>type+":"+id;
const valid=x=>typeof x==="string"&&ID.test(x);

export function inspectEntityGraph423({
  games=[],casinos=[],providers=[],generatedRoutes=[],
}={}){
  if(![games,casinos,providers,generatedRoutes].every(Array.isArray))
    throw new Error("Stage 42.3 requires entity and route arrays");
  const errors=[],notes=[],byType={game:new Map(),casino:new Map(),provider:new Map()};
  const slugs={game:new Map(),casino:new Map()};
  const view=[];
  function register(type,entity){
    const id=entity?.id;
    const slug=entity?.slug;
    if(!valid(id)|| (type!=="provider"&&!valid(slug))){
      errors.push(type+": missing/invalid immutable ID or slug");
      return;
    }
    if(byType[type].has(id)){errors.push(type+": duplicate stable ID: "+id);return;}
    if(type!=="provider"&&slugs[type].has(slug)){
      errors.push(type+": duplicate locale slug: "+slug);return;
    }
    byType[type].set(id,entity);
    if(type!=="provider")slugs[type].set(slug,id);
  }
  for(const entity of providers)register("provider",entity);
  for(const entity of games){
    register("game",entity);
    if(entity?.globalFacts?.id!==entity?.id || entity?.globalFacts?.slug!==entity?.slug)
      errors.push("game:"+String(entity?.id)+": globalFacts identity mismatch");
  }
  for(const entity of casinos)register("casino",entity);
  for(const type of ["game","casino"]){
    // Disallow an ambiguous legacy alias, where an ID shadows another entity's
    // slug. This matters during ID/slug migration and prevents guessed links.
    for(const [id,entity]of byType[type]){
      const alias=slugs[type].get(id);
      if(alias&&alias!==id)errors.push(type+":"+id+": ID conflicts with another slug");
      if(entity.slug!==id && type==="casino"){
        notes.push("casino:"+id+": existing Stage 43 audit still keys casino provenance by slug; migration required before independent ID/slug publication");
      }
    }
  }
  const paths=new Set(),routeByKey=new Map();
  for(const route of generatedRoutes){
    if(!route || typeof route.path!=="string" || paths.has(route.path)){
      errors.push("duplicate/invalid generated path: "+String(route?.path));continue;
    }
    paths.add(route.path);
    if(route.type!=="game"&&route.type!=="casino")continue;
    const key=recordKey(route.type,route.entityId);
    if(routeByKey.has(key)){errors.push("duplicate generated entity route: "+key);continue;}
    const source=byType[route.type].get(route.entityId);
    if(!source){errors.push("unknown route identity: "+key);continue;}
    const expected="/en/"+(route.type==="game"?"games":"casinos")+"/"+source.slug+"/";
    if(route.path!==expected){errors.push("wrong localized route: "+key);continue;}
    routeByKey.set(key,route.path);
  }
  for(const type of ["game","casino"]){
    for(const [id,entity]of byType[type]){
      const path=routeByKey.get(recordKey(type,id));
      if(!path){errors.push("missing generated route: "+type+":"+id);continue;}
      view.push(Object.freeze({
        type,id,slug:entity.slug,generatedPath:path,
        status:"development-identity-only",publicExportApproved:false,
      }));
    }
  }
  const related=[],providerMatches=[],relations=new Set();
  for(const [id,entity]of byType.game){
    const sourceKey=recordKey("game",id);
    if(!routeByKey.has(sourceKey))continue;
    const providerId=entity.globalFacts?.providerId;
    if(providerId!=null){
      if(!valid(providerId)||!byType.provider.has(providerId))
        errors.push("game:"+id+": unknown provider registry ID");
      else providerMatches.push(Object.freeze({
        gameId:id,providerId,status:"registry-identity-match-only",
        providerClaimVerified:false,publicationApproved:false,
      }));
    }
    if(!Array.isArray(entity.relatedGames)){
      errors.push("game:"+id+": relatedGames must be an array of target IDs");continue;
    }
    for(const targetId of entity.relatedGames){
      if(!valid(targetId)){
        errors.push("game:"+id+": invalid related entity ID");continue;
      }
      const target=byType.game.get(targetId);
      if(!target){
        const slugOwner=slugs.game.get(targetId);
        errors.push("game:"+id+": "+(slugOwner?
          "legacy slug-only relation; use stable ID "+slugOwner:
          "unknown related game ID "+targetId));
        continue;
      }
      const key=sourceKey+"->"+targetId;
      if(targetId===id||relations.has(key)){
        errors.push("game:"+id+": self/duplicate relation "+targetId);continue;
      }
      relations.add(key);
      if(!routeByKey.has(recordKey("game",targetId))){
        errors.push("game:"+id+": related target has no generated route "+targetId);continue;
      }
      related.push(Object.freeze({
        sourceGameId:id,targetGameId:targetId,
        relationStatus:"editorial-navigation-candidate-only",
        publicRecommendationApproved:false,
      }));
    }
  }
  return Object.freeze({
    schemaVersion:1,kind:"internal-entity-identity-audit",
    ok:errors.length===0,
    counts:{games:byType.game.size,casinos:byType.casino.size,
      providers:byType.provider.size,verifiedPublishedEntities:0,
      identityRelations:related.length},
    entities:Object.freeze(view),
    relatedCandidates:Object.freeze(related),
    providerRegistryMatches:Object.freeze(providerMatches),
    publicExportApproved:false,publicationApproved:false,
    errors:Object.freeze(errors),notes:Object.freeze(notes),
  });
}
