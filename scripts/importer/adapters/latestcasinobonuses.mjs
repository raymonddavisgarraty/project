/** Stage 29: offline HTML adapter. No network access or publication. */
export const SOURCE_HOST = 'latestcasinobonuses.bet';
const decode = s => String(s ?? '').replace(/&nbsp;|&#160;/gi,' ').replace(/&amp;/gi,'&').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&lt;/gi,'<').replace(/&gt;/gi,'>');
const plain = s => decode(String(s??'').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const field = (html, label) => {
  // Restrict matching to an HTML table row to avoid nearby unrelated numbers.
  for (const row of html.match(/<tr\b[^>]*>[\s\S]*?<\/tr>/gi) ?? []) {
    const cells = [...row.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(x=>plain(x[1]));
    if (cells.length >= 2 && new RegExp(`^${esc(label)}\\s*:?$`,'i').test(cells[0])) return cells[1] || null;
  }
  return null;
};
const number = (v) => {
  if (!v) return null;
  const m = String(v).replace(/\s/g,'').match(/\d+(?:[.,]\d+)?/);
  return m ? Number(m[0].replace(',','.')) : null;
};
const int = v => {const n=number(v); return n!==null && Number.isInteger(n) ? n : null;};
const volatility = v => {
  if (!v) return null;
  const s=v.toLowerCase().replace(/ё/g,'е').trim();
  return ({'низкая':'low','средне-низкая':'medium-low','средняя':'medium','средне-высокая':'medium-high','высокая':'high','корректируемая':'adjustable'})[s] ?? null;
};
const date = v => {
  const m=v?.match(/\b(\d{2})\.(\d{2})\.(\d{4})\b/); if(!m)return null;
  const iso=`${m[3]}-${m[2]}-${m[1]}`;
  return !Number.isNaN(Date.parse(iso)) && new Date(`${iso}T00:00:00Z`).toISOString().slice(0,10)===iso ? iso : null;
};
const slug = s => String(s??'').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const featureMap = {'free spins':'free-spins','фри спины':'free-spins','скаттер':'scatter','wild':'wild','дикий символ':'wild','покупка бонусной игры':'bonus-buy','бонусная игра':'bonus-game','автоматическая игра':'autoplay','прогрессивный джекпот':'progressive-jackpot'};
const yes = v => /^(да|есть|yes|true|✓|✔|\+)$/i.test(v?.trim()??'');
export function extractLatestCasinoBonuses(html, sourceUrl) {
  const url = new URL(sourceUrl);
  if (url.protocol!=='https:' || url.hostname!==SOURCE_HOST || !/^\/slots\/[a-z0-9-]+\/?$/.test(url.pathname)) throw new Error('Unsupported source URL');
  if(typeof html!=='string' || html.length<100) throw new Error('Missing HTML');
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  const heading=plain(h1?.[1]);
  const name=heading.replace(/\s+(?:демо|обзор).*$/i,'').trim() || null;
  const provider=field(html,'Производитель автомата');
  const raw = {
    provider, releaseDate:field(html,'Дата релиза'), rtp:field(html,'Отдача (%)'),
    volatility:field(html,'Волатильность'), maxWin:field(html,'Макс выигрыш'),
    reels:field(html,'Количество барабанов'), paylines:field(html,'Количество Линий'),
    themes:field(html,'Тема игрового автомата'), features:field(html,'Специальные функции (бонуски)')
  };
  const features = new Set();
  for (const f of (raw.features??'').split(/[,;]+/)) { const k=f.trim().toLowerCase(); if(featureMap[k])features.add(featureMap[k]); }
  for(const [label,code] of Object.entries(featureMap)) if(yes(field(html,label)))features.add(code);
  const facts = {
    title:name, providerId:provider?slug(provider):null, releaseDate:date(raw.releaseDate),
    rtp:number(raw.rtp), volatility:volatility(raw.volatility),
    maxWinMultiplier:number(raw.maxWin), reels:int(raw.reels), paylines:int(raw.paylines),
    themes:raw.themes ? raw.themes.split(/[,;]+/).map(s=>s.trim()).filter(Boolean) : [],
    features:[...features]
  };
  if(facts.rtp!==null && (facts.rtp<0 || facts.rtp>100))facts.rtp=null;
  if(!facts.title)throw new Error('Game title not found');
  return {schemaVersion:1, source:{url:url.href,host:SOURCE_HOST,adapter:'latestcasinobonuses-v1',collectedAt:new Date().toISOString()}, status:'pending-review', facts, raw, notes:['Extracted from source HTML; not verified with game provider','Provider ID is a proposed slug, not resolved against provider directory','Themes are source labels; normalize before publishing']};
}
