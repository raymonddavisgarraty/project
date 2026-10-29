import { assertProductionEditorial43 } from "./scripts/editorial43.mjs";

export default function (eleventyConfig) {
  // Production must fail closed until every rendered claim has reviewed evidence.
  // Local builds remain available for editorial QA and source verification.
  assertProductionEditorial43();
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
