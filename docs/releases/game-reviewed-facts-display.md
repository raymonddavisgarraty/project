# Game detail rendering — approved claim rows only

This PR fixes a direct content quality issue in the pre-publication **full** game page. Previously the hero, info table and catalogue card read numerical facts from raw game JSON directly. The repository still includes legacy-unverified values (Sweet Bonanza RTP, maximum win, hit frequency, etc.), which must never be mistaken for approved copy.

**Change:** Only Stage 43.3's existing `editorialFields433.gameRows(game)` can contribute full-page numeric facts. Unknown values are omitted, not filled with null strings. The game card and homepage rail consult `gameFieldVerified` before rendering provider/rtp/volatility. Review status and indexability remain unchanged.

The full page remains behind `editorialDisplay432.game(game)`. The live Sweet Bonanza and Big Dog House pages still display the pending-review fallback. No human review, legal rights, market authorization, confirmed game edition, public URL, rating or promotional offer is created by this change.

### Verify

    npm run test:approved-game-display
    npm run test:stage433
    npm run test:stage432
    npm run test:stage44
    npm run verify:integration

## Next actual publication requirements

At minimum, confirm the specific game edition and fact/prose source basis, complete an accountable editorial review, and approve the local EN release scope. Keep unknown RTP/max wins omitted. Later full-page publishing must also reconcile Stage 43 scoped vs global gates so unrelated drafts cannot falsely become approved or block a genuinely reviewed page.

