import { resolveCommercialOffer } from "../lib/commercial-policy.js";
import partners from "./partners.js";
import markets from "./markets.js";
import publication from "./publication.js";

const forEntity = entity => resolveCommercialOffer({ entity, partners, markets, policy: publication });
export default {
  forGame(game) { return forEntity(game); },
  forCasino(casino) { return forEntity(casino); },
};
