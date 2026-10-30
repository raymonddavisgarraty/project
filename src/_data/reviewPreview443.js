import audit from "../lib/editorial-audit433.js";
import { createReviewPreview443 } from "../lib/review-preview443.mjs";

// Each per-page projection contains status metadata, never unapproved facts.
export default createReviewPreview443(audit);
