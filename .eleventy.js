import { assertProductionEditorial43 } from "./scripts/editorial43.mjs";
import indexability42 from "./src/_data/indexability42.js";

export default function (eleventyConfig) {
  // Production must fail closed until every rendered claim has reviewed evidence.
  // Local builds remain available for editorial QA and source verification.
  assertProductionEditorial43();
  // Even a future all-green claim audit cannot make a site with zero
  // explicitly approved indexable routes ready for a production build.
  if ((process.env.NODE_ENV === "production" || process.env.SITE_ENV === "production") &&
      indexability42.approvedRouteCount === 0) {
    throw new Error("Stage 42.2: production build blocked — no independently approved indexable release routes.");
  }
  eleventyConfig.addPassthroughCopy({
    "src/assets": "assets",
  });

  eleventyConfig.addFilter("absoluteUrl", function (url, siteUrl) {
    return new URL(url, siteUrl).toString();
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
