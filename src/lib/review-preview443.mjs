// Stage 44.3 — editorial review *presentation*, not a content/approval pipeline.
// Only safe review-status metadata is exposed. No original unverified values,
// source URLs, ratings, bonuses, provenance objects or publication permissions.
const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CONFIG = Object.freeze({
  game: Object.freeze([
    Object.freeze({
      key: "identity",
      title: "Publisher and release",
      description: "Match the original game identity, publisher and release information to first-party records.",
      fields: Object.freeze(["providerId", "providerName", "releaseYear"]),
    }),
    Object.freeze({
      key: "mechanics",
      title: "Rules and configuration",
      description: "Check the game edition, reel layout, winning system and volatility against applicable rules.",
      fields: Object.freeze(["reels", "paylines", "paylineType", "volatility"]),
    }),
    Object.freeze({
      key: "mathematics",
      title: "RTP and winning potential",
      description: "Confirm theoretical return, maximum-win wording and available game configurations without borrowing figures from other editions.",
      fields: Object.freeze(["rtp", "maxWinMultiplier", "hitFrequency"]),
    }),
    Object.freeze({
      key: "evaluation",
      title: "Editorial assessment",
      description: "Keep numerical scores unpublished until the scoring methodology and the exact review are approved.",
      fields: Object.freeze(["rating"]),
    }),
  ]),
  casino: Object.freeze([
    Object.freeze({
      key: "identity",
      title: "Operator and licensing",
      description: "Verify operator identity, licensing claims and their jurisdictional scope directly from authoritative records.",
      fields: Object.freeze(["title", "license", "type"]),
    }),
    Object.freeze({
      key: "offers",
      title: "Promotions and conditions",
      description: "Check the current promotion, wagering requirements, minimum deposit and applicable territories.",
      fields: Object.freeze(["bonus", "bonusDetails.wager", "bonusDetails.minDeposit"]),
    }),
    Object.freeze({
      key: "game-catalogue",
      title: "Game selection",
      description: "Confirm game categories and catalogue totals only when the operator's current inventory is documented.",
      fields: Object.freeze(["gamesCount", "gameTypes"]),
    }),
    Object.freeze({
      key: "payments",
      title: "Payments and withdrawals",
      description: "Check deposit methods, payment options, processing terms and the date of the source evidence.",
      fields: Object.freeze(["paymentMethods", "payments", "withdrawalSpeed"]),
    }),
    Object.freeze({
      key: "evaluation",
      title: "Editorial assessment",
      description: "Do not show an overall score or category ratings before an accountable editorial decision.",
      fields: Object.freeze(["rating", "ratingBreakdown"]),
    }),
  ]),
});
function validAudit(audit) {
  return audit?.schemaVersion === 1 && audit.autoApprove === false &&
    audit.autoPublish === false && Array.isArray(audit.items);
}
function matchedItem(audit, type, id) {
  if (!validAudit(audit) || !ID.test(id || "")) return null;
  const matches = audit.items.filter(item=>item?.type===type && item.id===id);
  if (matches.length!==1 || !Array.isArray(matches[0].claims)) return null;
  return matches[0];
}
function evaluate(type,item) {
  const claimIndex=new Map();
  const duplicates=new Set();
  if (item) for (const claim of item.claims) {
    if(typeof claim?.field!=="string")continue;
    if(claimIndex.has(claim.field))duplicates.add(claim.field);
    claimIndex.set(claim.field,claim);
  }
  const isClaimChecked = field => {
    if(duplicates.has(field))return false;
    const claim=claimIndex.get(field);
    return claim?.status==="verified" && Array.isArray(claim.codes) && claim.codes.length===0;
  };
  const allClaims=item?.claims.filter(c=>c && c.status!=="not-claimed") || [];
  const checkedClaims=allClaims.filter(c=>!duplicates.has(c.field) && isClaimChecked(c.field)).length;
  const sections=CONFIG[type].map(section=>{
    const claimed=section.fields.filter(field=>{
      const claim=claimIndex.get(field);
      return claim && claim.status!=="not-claimed";
    });
    const checked=claimed.filter(isClaimChecked).length;
    return Object.freeze({
      key:section.key,title:section.title,description:section.description,
      checkedCount:checked,totalCount:claimed.length,
      state:claimed.length>0 && checked===claimed.length?"claims-checked":"checks-pending",
    });
  });
  return Object.freeze({
    type,
    // Even a fully checked individual assertion does not allow public release.
    publicationApproved:false,
    editorialStatus:"verification-pending",
    checkedClaims,claimCount:allClaims.length,
    sections:Object.freeze(sections),
  });
}
export function createReviewPreview443(audit) {
  return Object.freeze({
    forGame(game) {
      const id=game?.id;
      const validIdentity=ID.test(id||"") && game.globalFacts?.id===id &&
        game.globalFacts?.slug===game.slug;
      return evaluate("game",validIdentity?matchedItem(audit,"game",id):null);
    },
    forCasino(casino) {
      const id=casino?.slug;
      return evaluate("casino",matchedItem(audit,"casino",id));
    },
  });
}
