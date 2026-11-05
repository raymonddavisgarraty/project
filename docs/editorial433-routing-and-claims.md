# Stage 43.3 — Entry routing and partial claim architecture

## Route behaviour

### Local

Eleventy emits a /index.html entrypoint. Browser navigation to / receives HTML (status HTTP 200) containing an immediate meta refresh to /en/. A visible fallback link also works without an automatic redirect. The file is marked noindex and uses /en/ as its canonical URL; / is not present in sitemap.

This is a static-site fallback. It is NOT a real HTTP redirect.

### Production hosting (to be configured, not implemented here)

Where supported, configure an HTTP-level temporary redirect from / to /en/, e.g.:

    location = / {
      return 302 /en/;
    }

The snippet above is an example for Nginx only. Do not assume the project uses Nginx or copy it into an unknown hosting environment. Later /de/ and /es/ should only be routable when localized editorial content and market/legal approvals exist. Do not use automatic country or language guessing until the product and SEO routing rules are approved.

For SEO references, Google documents 301/308 as permanent redirects and 302/307 as temporary. A zero-second HTML meta refresh is not a replacement for hosting-level configuration.

## Claim-level resolver

The Stage 43 audit yields entities with claims {field, status, codes}. Stage 43.3 consumes only the actual local Stage 43 audit instance via Eleventy global data:

- If claim.status is not verified, do not display that field.
- If claim.codes is not an empty array, do not display the field.
- If the document/ID is missing, duplicated or inconsistent, do not display fields.
- If the formatter does not recognize a safe numerical / enumerated / plain-text value, omit it.
- Separate this from full-page releaseReady and the Stage 43 production release gate.
- Never use Studio's proposed values to override the source data that Stage 43 audited.

### Partial game fields
Provider name, release year, reels, approved mechanics, volatility, RTP, max win, paylines. Hit frequency is excluded until an explicit definition and evidence exist. Ratings excluded until methodology and page review are complete.

### Partial casino fields
License-claim text, game count and type, when individually verified. Does NOT establish authorisation in the visitor's region, freshness of offers, or consumer safety. Withdrawal speeds, bonuses and scores stay withheld.

### Future improvement (not Stage 43.3)
Bind reviewers' approvals to a hash of the exact reviewed data and editorial prose. Allow only approved page components to be indexed by policy and update sitemap/route manifest accordingly. Production must not be released while material unverified legacy statements are present.

## Regression assurance
The root is checked by scripts/seo42.mjs in addition to the existing content-page rules. Stage 43.2 checker is adjusted to distinguish specific approved numeric fields from unapproved ones. No new default content routes or facets are generated.
