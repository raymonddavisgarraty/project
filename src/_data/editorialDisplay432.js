import { auditCurrentRepository43 } from "../../scripts/editorial43.mjs";
import { createEditorialDisplay432 } from "../lib/editorial-display432.mjs";

// Global Eleventy data is evaluated before page templates. There is no
// configuration switch or development-mode bypass for unreviewed claims.
const audit = auditCurrentRepository43();
export default createEditorialDisplay432(audit);
