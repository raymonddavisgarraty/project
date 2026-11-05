# G2.3 — File-backed revision integrity (no approvals)

This checkpoint closes the gap between G2.2 candidate JSON fingerprints and the actual byte revisions of the Eleventy source repository. It is **not** the approved release authority, indexability mechanism, outbound published catalogue, Studio or Telegram Bot.

The read-only snapshotSourceRevisionG2() selects a fixed, allowlisted group of tracked source files by Game/Casino immutable ID and slug. Game records include global facts JSON, localized editorial JS, claim provenance, provider/theme/feature registries and author + rating methodology sources. Casino records include the current shared casino JS, casino provenance, markets, publication policy, author and rating methodology sources. It reads actual bytes, SHA-256 and lengths; inspectSourceRevisionG2() compares these against a previously recorded pending snapshot and rejects mismatches or approval injection.

Restrictions: filenames are constructed from validated ID/slug, no arbitrary user path is accepted; symlinks, escaped source paths, non-regular files and >1 MiB files are rejected. The casino ID/slug split remains blocked pending provenance migration. There is no private data/editorial/ access, no writes to existing source, no external requests, no changes to Stage 42 indexability or Stage 43 audit. Real-world source authenticity and rights are **not** verified by a source file hash.

- npm run test:source-revision: synthetic sandbox test, 22 bad manifests + real-byte file mutation; no project file modifications.
- npm run check:source-revision: read-only check over existing tracked 2 games and 2 casinos, with all approval/export flags false. It compares immediately observed bytes to themselves as a structural diagnostic, NOT as independent approval.
- npm run verify:integration: existing full regression and SEO block.

Remaining authority: independent editor identity and source rights, exact reviewed revision manifest and evidence validity, locale/market rules, explicit release decision with revocation and quarantine for unapproved entities; only then may a future approved release projection be used by HTML and a sanitized versioned Published Catalogue v1. In the current repository sitemapEntries=0 must remain correct.
