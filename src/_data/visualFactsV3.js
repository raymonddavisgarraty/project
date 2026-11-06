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
export default Object.freeze({game,casino});
