// Visual mapping only. Stage 43.3 remains the sole field-level facts authority.
// We never infer a factual value from an icon or an unrelated game.
const GAME=Object.freeze({
  providerName:["🎮","Game provider","Developer-listed"],
  releaseYear:["📅","Release year","Source-reviewed"],
  reels:["🎰","Reels","Base layout"],
  paylineType:["✨","Win mechanic","Source-reviewed"],
  volatility:["🌪️","Volatility","Source-reviewed"],
  rtp:["📊","Declared RTP","Configuration may vary"],
  maxWinMultiplier:["🏆","Maximum win","Developer-listed"],
  paylines:["🎯","Paylines","Source-reviewed"],
});
const CASINO=Object.freeze({
  license:["🛡️","Licence","Operator claim reviewed"],
  gamesCount:["🎰","Games","Source-reviewed"],
  type:["🎲","Casino type","Source-reviewed"],
});
function build(rows,mapping){
  if(!Array.isArray(rows))return [];
  const visited=new Set(),out=[];
  for(const row of rows){
    if(row?.reviewStatus!=="claim-verified"||typeof row.field!=="string"||
       !Object.hasOwn(mapping,row.field)||visited.has(row.field)||
       typeof row.value!=="string"||!row.value.trim()||/[<>]/.test(row.value))continue;
    visited.add(row.field);
    const [symbol,label,note]=mapping[row.field];
    out.push(Object.freeze({symbol,label,value:row.value,note}));
  }
  return Object.freeze(out);
}
export const game=rows=>build(rows,GAME);
export const casino=rows=>build(rows,CASINO);
const GAME_NOTES=Object.freeze({
  providerName:"Developer of the selected game.",
  releaseYear:"Year of the original game release.",
  reels:"Number of reels or columns; this does not describe every row.",
  paylineType:"How winning symbol combinations are evaluated.",
  volatility:"Payout variation, not a prediction for an individual session.",
  rtp:"Theoretical long-run value; operator configurations may differ.",
  maxWinMultiplier:"Potential payout multiplier, not a guaranteed win.",
  paylines:"Paylines for the applicable game version.",
});
export const gameSpecs=rows=>Object.freeze(
  (Array.isArray(rows)?rows:[])
    .filter(row=>row?.reviewStatus==="claim-verified" &&
      typeof row.field==="string" && Object.hasOwn(GAME_NOTES,row.field) &&
      typeof row.label==="string" && typeof row.value==="string" && row.value.trim() &&
      !/[<>]/.test(row.value))
    .map(row=>Object.freeze({label:row.label,value:row.value,note:GAME_NOTES[row.field]}))
);
export default Object.freeze({game,casino,gameSpecs});
