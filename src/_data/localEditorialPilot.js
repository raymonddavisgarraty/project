// Eleventy global data — preview is OFF by default and always OFF in production.
import buildMode from "./buildMode.js";
import registry from "../content/publication-state.en.json" with { type:"json" };
import {buildLocalGameDraftPreviewV1} from "../lib/local-game-draft-preview-v1.mjs";

export default Object.freeze({
  forGame(game){
    return buildLocalGameDraftPreviewV1({
      game,registry,
      enabled:process.env.EDITORIAL_PREVIEW==="1",
      production:buildMode.production,
    });
  }
});
