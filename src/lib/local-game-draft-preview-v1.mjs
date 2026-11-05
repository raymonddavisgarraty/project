// Optional local editorial text preview. NOT a publication, indexing, or data-export authority.
// No unreviewed rating, affiliate field, game math, private provenance or author data is copied.
const SIMPLE_ID=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const text=x=>typeof x==="string"&&x.trim().length>0&&!/[<>]/.test(x)&&x.length<=3000;
const clean=x=>text(x)?x:null;

export function buildLocalGameDraftPreviewV1({game,registry,enabled=false,production=false}={}){
  // Explicit opt-in for a single reviewed editorial pilot. Production always off.
  if(!enabled||production||game?.id!=="sweet-bonanza"||game?.slug!=="sweet-bonanza"||
     game.globalFacts?.id!=="sweet-bonanza"||!Array.isArray(registry?.items)||
     registry.locale!=="en"||registry.schemaVersion!==1)return null;
  const matches=registry.items.filter(s=>s?.type==="game"&&s.id===game.id);
  if(matches.length!==1||matches[0].status!=="review")return null;
  const title=clean(game.seo?.h1),intro=clean(game.hero?.description);
  if(!title||!intro||!SIMPLE_ID.test(game.author||""))return null;
  const sections=[];
  for(const name of ["overview","gameplay","rtpVolatility","bonusFeatures"]){
    const s=game.sections?.[name];
    if(!s)continue;
    const heading=clean(s.title),body=clean(s.text);
    if(!heading||!body)return null;
    sections.push({heading,body});
  }
  const f=game.sections?.features;
  if(f && (!clean(f.title)||!Array.isArray(f.items)||
    !f.items.every(text)||f.items.length>12))return null;
  const questions=game.faq;
  if(!Array.isArray(questions)||questions.length>12||
     !questions.every(q=>clean(q?.question)&&clean(q?.answer)))return null;
  const refs=game.editorialSourceLeads;
  if(!Array.isArray(refs)||refs.length>5||!refs.every(url=>
    typeof url==="string"&&/^https:\/\/www\.pragmaticplay\.com\/en\/[a-z0-9/-]+\/$/.test(url)))return null;
  return Object.freeze({
    kind:"local-editorial-copy-preview-only",unverified:true,
    heading:title,intro,sections:Object.freeze(sections),
    features:f?Object.freeze({heading:f.title,items:Object.freeze([...f.items])}):null,
    questions:Object.freeze(questions.map(q=>({question:q.question,answer:q.answer}))),
    researchLinks:Object.freeze([...refs]),
    publicationApproved:false,indexabilityApproved:false,publicExportApproved:false,
  });
}
