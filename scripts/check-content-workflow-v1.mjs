// Read-only informational content status report. Never writes a public catalogue.
import games from '../src/_data/games.js';
import casinos from '../src/_data/casinos.js';
import routes from '../src/_data/publishedRoutes.js';
import audit from '../src/lib/editorial-audit433.js';
import states from '../src/content/publication-state.en.json' with {type:'json'};
import { previewContentWorkflowV1 } from '../src/lib/content-workflow-v1.mjs';
if(states.schemaVersion!==1||states.locale!=='en'||!Array.isArray(states.items))
  throw new Error('Unknown publication state registry');
const result=previewContentWorkflowV1({games,casinos,states:states.items,routes,audit,
  measuredRevisionHashes:{},globalInformationApproved:false});
const {entities,counts,ok,errors}=result;
const candidates=entities.games.length+entities.casinos.length;
console.log(JSON.stringify({ok,counts,previewCandidateCount:candidates,
  publicExportApproved:false,publicationApproved:false,indexabilityApproved:false,errors},null,2));
if(!ok||candidates!==0)process.exitCode=1;
