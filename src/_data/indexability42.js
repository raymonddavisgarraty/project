import routes from "./publishedRoutes.js";
import audit from "../lib/editorial-audit433.js";
import { createIndexability42 } from "../lib/indexability42.mjs";

// Stage 42.2: no independently approved public-information release,
// human indexing decisions, or source-revision proofs exist yet.
// Never derive permissions from generated routes, claims, locale,
// Studio candidates or successful Eleventy builds.
export default createIndexability42({
  routes,
  audit,
  approvals: [],
  revisionHashes: {},
  informationApproved: false,
});
