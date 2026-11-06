// Small on-demand title index for the game catalogue UI, NOT the published
// editorial feed or a source of ratings, offers or private research claims.
// In production it contains only independently allowed detail routes.
import games from "./games.js";
import fields from "./editorialFields433.js";
import buildMode from "./buildMode.js";
import indexability from "./indexability42.js";
export default games
  .filter(game => !buildMode.production || indexability.allows("/en/games/" + game.slug + "/"))
  .map(game => ({
    title: game.title,
    url: "/en/games/" + game.slug + "/",
    provider: fields.gameFieldVerified(game,"providerName") ? game.globalFacts.providerName : "",
    volatility: fields.gameFieldVerified(game,"volatility") ? game.globalFacts.volatility : "",
  }));
