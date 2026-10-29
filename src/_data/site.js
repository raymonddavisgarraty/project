import { resolveSiteUrl, resolveTelegramUrl } from "../lib/site-config.js";

const url = resolveSiteUrl();
export default {
  name: "ReviewHub",
  url,
  defaultLanguage: "en",
  languages: ["en", "de", "es"],
  social: { telegram: resolveTelegramUrl() },
  organization: {
    name: "ReviewHub",
    url,
    logo: "/assets/images/logo.svg",
  },
};
