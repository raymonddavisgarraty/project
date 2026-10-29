# Sweet Bonanza (original 2019) — source-verification worksheet

**Research leads only.** No independently signed source snapshot, editorial approval or production clearance. Lookups: 29 October 2026.

## Comparison of current facts and first-party source leads

| Field | Current legacy value | Candidate finding | Human action |
|---|---|---|---|
| providerId | pragmatic-play | Internal registry key, not a publisher identifier | Review source-to-registry mapping |
| providerName | Pragmatic Play | Official publisher pages identify the title | Confirm original game and editorial approval |
| releaseYear | 2019 | Official announcement 25 June 2019 | Verify source/canonical date |
| reels | 6 | Official source describes 6×5 tumbling grid | Confirm game edition and terminology |
| volatility | high | Official 2019 announcement describes high volatility | Review edition applicability |
| paylineType | pays-anywhere | Official game page describes 8–12+ matches anywhere | Review normalization |
| maxWinMultiplier | **21100** | **21175** in provider's original announcement | Potential conflict; DO NOT auto-update |
| rtp | **96.48** | **Not established in inspected first-party pages** | Obtain official rules/maths and RTP variants |
| hitFrequency | medium | No source obtained | Verify or propose removal after human review |
| paylines | null | Matching symbols anywhere; no fixed payline number asserted | Keep null unless documented otherwise |

English editorial SEO metadata, overview, FAQs, game cards and hero also contain numerical or descriptive claims. Review those too. Existing ratings remain unsupported until a genuine methodology is approved.

## Source leads

1. Pragmatic Play original release announcement, 25 June 2019:
   https://www.pragmaticplay.com/en/news/pragmatic-play-launches-sweet-bonanza/
   Mentions the original 6×5 game, high volatility, free spins and max-win wording 21175x.
2. Pragmatic Play original Sweet Bonanza page:
   https://www.pragmaticplay.com/en/games/sweet-bonanza-slot/
   Describes pays-anywhere gameplay, scatters, tumbling and multipliers.

These URLs are leads for editorial review, not automatically imported approval evidence. Do not use newer Sweet Bonanza 1000/2500/POP facts to validate the original.

## Editorial checklist

- [ ] Inspect actual original-game rules and the relevant maths/RTP configuration.
- [ ] Verify if the 21175x official announcement and the 21100x legacy value describe different versions or stake calculations.
- [ ] Record source, version, publication/observation timestamps and jurisdiction.
- [ ] Verify 6×5, provider, release year, volatility, pay-anywhere mechanics, scatters and multipliers.
- [ ] Establish RTP variants with authoritative documentation; do not assume a global RTP.
- [ ] Confirm hit frequency with a reproducible source, or propose removing the unsupported field.
- [ ] Review English meta description, hero, FAQ, body and cards against evidence.
- [ ] Separately approve rating methodology and each derived rating before describing them as tested.
- [ ] Log reviewer identity and substantive decision. Only then propose an evidence-backed correction PR.
- [ ] Rerun Stage 43 strict audit; no automatic approval or publication.

Optional research note using the existing explicit journal:

    node scripts/editorial43-log.mjs record --entity-type=game --entity-id=sweet-bonanza --reviewer-id=editor-id --action=conflict-identified --note="Original official release differs from legacy max-win claim; requires game-rules review" --source-url=https://www.pragmaticplay.com/en/news/pragmatic-play-launches-sweet-bonanza/

Research logs are local, create-only, not approval records. Back them up if permanent retention is required.
