# Original content pilot — Sweet Bonanza

Pilot path: `docs/editorial-pilots/sweet-bonanza-original-en-review.md`.

After the user-approved simplification of the single-editor pipeline, Sweet Bonanza moves from `draft` to **`review` only**. Other games/casinos remain draft. The editor has a proposed original English article based on two producer pages, with numeric RTP, maximum win, volatility and review rating withheld because edition-specific source verification is incomplete.

An editorial `review` state is neither a fact approval nor a legal/market release decision. No code under `src/content/locales/en/games/` or `src/content/games/` is edited. Existing legacy QA route stays noindex; existing Stage 43 blockers remain; there is no public export or Telegram content.

Next handoff: responsible human editor checks manufacturer rules, market/rights, original copy, author provenance and all claims; then an approved content PR updates the live game review and the separate release gate. Use `npm run check:content-workflow` to confirm three drafts, one in review, zero published candidates. `npm run verify:integration` must remain green.

