import games from "./games.js";
import publishedRoutes from "./publishedRoutes.js";
import audit from "../lib/editorial-audit433.js";
import editorialDisplay432 from "./editorialDisplay432.js";
import { buildGameNavigation44 } from "../lib/game-navigation44.mjs";

// Navigation only; never treats a generated route as an approved review.
export default buildGameNavigation44({
  games, publishedRoutes, audit, fullReviewPolicy: editorialDisplay432,
});
