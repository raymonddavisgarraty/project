# Integration checkpoint — Stage 43.5 + Stage 44.4–45.5

**Draft development snapshot; not a production release.** This is a single integration branch composed of:
- First parent: Stage 45.5 `124cafbf2211d136d4f257e9d23e38bd7a0c05bb`, which includes the stacked Stage 44.4 / 45.1 / 45.2 / 45.3 / 45.4 / 45.5 changes and baseline Stage 43.4.
- Second parent: Stage 43.5 `8415a85340e8d7d61f1ed12c682f74b08166df9c`, which provides separate private source snapshot manifest validation and read-only SHA-256 checking.

The integration merge preserves the original Stage 43.5 history rather than rewriting it. On the common file `package.json`, both sets of commands were combined. Stage 43.5's `.gitignore` and `.gitattributes` protections were carried over; all new Stage 43.5 modules, schema, synthetic fixtures and documentation are included by Git blob hash, unchanged.

No tracked private editorial snapshot bytes were added. The `data/editorial/evidence-snapshots/` directory is gitignored. Private owner files in the original Windows checkout are **not** present in this integration worktree and must never be cleaned or committed.

## Reproducible acceptance in the existing isolated Windows worktree

```powershell
Set-Location (Join-Path $env:TEMP "seo-review-stage45-2-verify")
git status --short
git fetch origin review/integration-stage435-stage455
git switch --detach FETCH_HEAD
npm run verify:integration
```

The `verify:integration` script builds with Eleventy, then runs Stage 43.5 snapshot and tamper tests, its **synthetic-only** sample CLI, Stage 43.4 source pilot tests, Editorial Workbench, Stage 45.1–45.5 regressions, SEO, navigation, display, catalog, review-page and entity checks, and the Studio integration contract. This test must run on a clean worktree. The synthetic checksum check does **not** read or approve a private real-world source.

Expected guarded outcomes:
- Site remains development-only, with `noindex` and zero sitemap entries until editorial evidence, applicable-market policy and a revision-bound human release decision are separately approved.
- Source byte integrity does **not** prove source authenticity, publishing rights, correct edition or claims.
- The 66 editorial tasks are a workflow backlog, not proof of 66 approved claims.
- `npm run check:editorial` is **expected to fail** while claims remain unverified. Do not disable it, set production flags, or force a public release.
- No merged PR is implied: upstream PRs and `main` are unchanged until separately reviewed and approved.

## After automated acceptance

Open `http://localhost:8080/en/` and test desktop/mobile, menu, hero controls, no-JS catalog, light/dark mode and `site-bundle.css`. Recheck Lighthouse in a clean Chrome Guest profile without extensions; prior local Lighthouse results do not represent production field Core Web Vitals. Review the full dependency advisory list before updating the lockfile.

## Integration decisions still open

1. Separate controlled final review/merge sequence for the upstream stacked PR chain to `main`; **not automatic**.
2. Human evidence review for Sweet Bonanza and other unpublished game/casino claims, keeping differences in RTP/maximum win/volatility unresolved until authentic edition-specific records exist.
3. Real production deployment requirements: hosting/CDN cache headers, CSP, privacy/analytics, uptime monitoring, locale and jurisdiction approvals.
4. Editorial Workbench remains private and read-only; future Studio and Telegram integration are out of scope here.

## Additional privacy hardening (post-Windows acceptance)

The entire local `data/editorial/` folder is gitignored, not only its `evidence-snapshots/`, `review-log43/` and `reports/stage431/` subfolders. The original checkout contains additional untracked private editorial records. This is a Git metadata-only safeguard: it does not delete local files, change the generated website, alter any editorial decision, or add private content to Git. Existing clean integration tests were executed on the prior commit `9af77e7`; this additional ignore-only commit should be checked with `git check-ignore -v data/editorial/<local-file>` on a workstation with a real untracked record, or `git check-ignore -v --no-index data/editorial/safety-probe.txt` without touching a file.
