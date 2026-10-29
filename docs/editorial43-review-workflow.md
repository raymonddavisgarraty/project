# Stage 43 — Evidence, editorial review and revision workflow

## Why the release is currently blocked

Two existing games have only unverified provenance, while their public editorial copy and cards mention numerical RTP and ratings. The two casino records contain substantial licensing, bonus and trust statements with no approved field-level evidence. An author profile record has an unverified numerical review count. These are data-quality risks, not accusations that the claims are false.

## Proof standard

An approved field requires: identical value between the published record and current source evidence; valid HTTPS source URL; source classification; timestamp; and explicit, identifiable human editor review. Every conflicting source value must be reconciled, not averaged or ignored.

Casino bonus details and withdrawal speed must be checked within 30 days; the licence field within 365 days. These are conservative INTERNAL review thresholds, not legal conclusions. The tool cannot independently authenticate URLs or tell whether an operator is authorised in a jurisdiction.

Example shape (ALL identifiers, dates and URLs illustrative, NOT evidence):

    {
      "status": "verified",
      "evidence": [{
        "url": "https://official-source.example.org/fact",
        "observedAt": "2026-10-29T12:00:00Z",
        "sourceType": "official",
        "value": 96.48
      }],
      "review": {
        "status": "approved",
        "reviewerId": "actual-reviewed-editor",
        "reviewedAt": "2026-10-29T12:15:00Z"
      }
    }

Never copy such example data into a real published source file.

## Game review procedure

Validate provider identification, edition- or territory-specific RTP, volatility, reels, payout mechanism, max win, hit frequency, release date, tested limitations and source age. Align all factual statements in title, hero, table, FAQ and body with the reviewed source; do not interpret a structured fact as proof of all prose claims.

Existing sourceStatus legacy-unverified must not be switched without a real documented human decision, correction, and review of the full article. Quality scores need separately documented methodology and per-review support.

## Casino review procedure

Verify corporate and brand identity; license number, regulator and jurisdiction; offer terms, wager, deposit, eligibility and expiry; game counts, availability by territory, payment methods and timing; all security and trust assertions. In particular, generic descriptions such as Curacao, fast withdrawal, SSL or RNG do NOT independently validate regulatory authorisation or security testing.

Review the entire rendered Hero, sidebar, cards and prose, not just a JSON value.

## Author/methodology review

Confirm author accountability and accurate role. Current claims such as 247 published reviews require an inventory or evidence, not inference. Establish measurable rating criteria, versioned scoring rubric, reviewer identity, primary sources, conflicts policy and actual methods before claiming editorial scores have been verified.

## Revision history and safe workflow

Research journal events can document notes or conflicts and use exclusive file creation, but are never approvals. Reviewed source JSON changes must be committed in Git with explicit rationale and peer review. Raw private source dumps and reviewer secrets should remain outside public assets.

A remaining integrity enhancement is to bind approvals to complete reviewed document snapshots and evidence digests. This patch intentionally does not modify the existing Stage 38 hash-bound publication process, and should not be mistaken for a completed legal or factual review.

## Stage acceptance vs public-release approval

- Development QA passes when scripts run and risks are surfaced correctly.
- Strict editorial check MUST fail for existing unreviewed records.
- Production readiness requires actual source verification, legally permitted market scope, reviewed methodology and appropriate release controls.
- Manual removal, redaction or noindex of a problematic existing route requires an explicit editorial policy decision and corresponding sitemap/URL tests, never an automatic invisible rewrite.
