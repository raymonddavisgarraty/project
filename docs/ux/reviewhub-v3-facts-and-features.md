# Game Facts / feature tags / mechanic cards — ReviewHub v3

The Sweet Loot standalone HTML is the design baseline. The existing generic `quick-facts.njk` is **extended rather than duplicated**: it accepts labelled facts with optional icon, emoji and short note, displayed as six compact cards per row on wide screens, three per row on tablets and two per row on phones.

The existing `pill-list.njk` now accepts either strings (backward compatibility) or `{symbol,label}` objects and can render without a title in the game hero. Small reusable `feature-cards.njk` adds emoji-led feature descriptions.

## Data flow

- Full approved game detail: `editorialFields433.gameRows(game)` → `visualFactsV3.game()` → `quick-facts.njk`. Only Stage 43.3 claim-reviewed rows are displayed, no raw project RTP, raw casino offer, or inferred rating.
- Full approved casino detail: `editorialFields433.casinoRows(casino)` → `visualFactsV3.casino()` → the **same** quick-facts card component.
- Per-game feature tags and descriptive mechanics are taken only from that game record, under its existing full-review gate. There is no shared hard-coded mechanic list for all games.
- Local Sweet Bonanza pilot uses **separate game-specific editorial preview data**. It has six visual facts (original developer, 6×5 original game layout, 8+ matches, tumbling, 10 initial free spins), five tags and four mechanism explanation cards. The fields are stripped/allowlisted by `buildLocalGameDraftPreviewV1` and exist **only with** `EDITORIAL_PREVIEW=1` outside production while Sweet Bonanza remains in Review. The pilot has no RTP or maximum-win figure.
- Sweet Loot features such as a multiplier top row, pirate symbols and Super Free Spins are **not** used on Sweet Bonanza.

## Validation

Run `npm run test:visual-facts-v3`, `npm run verify:integration` and, after checkout, `EDITORIAL_PREVIEW=1 npm run dev` (PowerShell: `$env:EDITORIAL_PREVIEW='1'`). The source remains noindex and the main production gate is untouched.

This change provides UI slots and data shapes. Actual image uploads, video, full media gallery and authorised playable demo integration are a separate task. Do not ship local preview output to the public site.

## Hero facts and separate detailed Specifications

As in Sweet Loot, six compact `Game at a glance` cards now follow `hero-grid` directly, before the status line and secondary sticky navigation. They are **not** repeated in the content body. Section `02 · Specifications` instead contains a detailed `info-table.njk` with longer explanatory notes and additional structured, game-specific rows. The pilot shares each of the six values between the two representations without copying one game's facts to another. Full published game pages use the Stage 43.3 field-reviewed rows for both hero summaries and detailed table. Sweet Bonanza's exact RTP/max win remain withheld. All draft content remains non-production only.
