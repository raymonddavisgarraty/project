// Stage 43.1: pure remediation queue from Stage 43's read-only audit.
// This module NEVER changes sources, evidence, approvals or publication.
const PRIORITIES = Object.freeze({P0:0,P1:1,P2:2});
const ENTITY_ORDER = Object.freeze({game:0,casino:1,author:2});
const IMPORTANT_GAME = new Set(["rtp","volatility","maxWinMultiplier","releaseYear"]);
const IMPORTANT_CASINO = new Set([
  "license","bonus","bonusDetails.wager","bonusDetails.minDeposit",
  "withdrawalSpeed","rating","ratingBreakdown","trustItems","gamesCount",
  "paymentMethods","payments","gameTypes",
]);
const IMPORTANT_AUTHOR = new Set(["name","reviewsCount"]);

function priorityFor({type,field,codes}) {
  if (["ratingMethodology","editorialReview","sourceStatus","provenance"].includes(field) ||
      codes.some(c=>/conflict|mismatch|expired/i.test(c))) return "P0";
  if (type==="casino" && IMPORTANT_CASINO.has(field)) return "P0";
  if (type==="game" && (IMPORTANT_GAME.has(field)||field==="rating")) return "P0";
  if (type==="author" && IMPORTANT_AUTHOR.has(field)) return "P0";
  if (field==="rating") return "P0";
  if (type==="game" && ["providerId","providerName","reels","paylineType"].includes(field)) return "P1";
  return "P2";
}
function workstreamFor({type,field,codes}) {
  if (field==="ratingMethodology") return "rating-methodology";
  if (field==="editorialReview") return "editorial-decision";
  if (["sourceStatus","provenance"].includes(field)) return "publication-provenance";
  if (codes.some(c=>/conflict|mismatch/.test(c))) return "conflict-resolution";
  if (type==="casino" && ["license","bonus","bonusDetails.wager","bonusDetails.minDeposit"].includes(field))
    return "regulated-and-volatile-claims";
  return "fact-source-review";
}
function nextActionFor(task) {
  const {type,field,codes}=task;
  if (field==="ratingMethodology")
    return "Document a versioned scoring rubric and real review method; require human sign-off and evidence for each score.";
  if (field==="editorialReview")
    return "Perform a full-content editorial review, identify the responsible reviewer, and record a traceable decision.";
  if (field==="sourceStatus")
    return "Reconcile every material field and editorial claim before changing the legacy source status; never toggle the flag alone.";
  if (field==="provenance")
    return "Restore a correctly keyed provenance record with reviewed sources; do not create approval metadata as a shortcut.";
  if (type==="author")
    return field==="reviewsCount" ?
      "Count truly published reviews and document the calculation, or remove the unsupported numerical claim." :
      "Verify the accountable author/editor identity and the exact displayed assertion against reliable records.";
  if (codes.some(c=>/conflict|mismatch/.test(c)))
    return "Compare the exact published field and edition against authoritative sources; record conflict and propose a reviewed correction.";
  if (codes.some(c=>/expired/.test(c)))
    return "Recheck the currently applicable terms, jurisdiction and observation time; obtain fresh primary evidence.";
  if (type==="casino")
    return field==="license" ?
      "Verify operator identity, licence number, regulator, current status and jurisdiction from regulatory records." :
      "Obtain current operator/regulator evidence for the exact claim, territory and conditions; request editor approval.";
  if (type==="game" && field==="rtp")
    return "Check the original game, math/RTP configuration and operator edition; preserve variants and the reviewer decision.";
  return "Locate a primary source for this exact fact, compare values, retain observation date and request editorial approval.";
}
function validateBlocker(b) {
  if (!b || !["game","casino","author"].includes(b.type) ||
      typeof b.id!=="string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(b.id) ||
      typeof b.field!=="string" || !/^[A-Za-z][A-Za-z0-9.]*$/.test(b.field) ||
      !Array.isArray(b.codes) || !b.codes.length ||
      !b.codes.every(c=>typeof c==="string" && /^[a-z0-9-]+$/.test(c)))
    throw new Error("Malformed Stage 43 audit blocker");
}
export function buildRemediationQueue431(audit,{pilot=null,entity=null}={}) {
  if (!audit || audit.schemaVersion!==1 || !Array.isArray(audit.blockers))
    throw new Error("Expected a Stage 43 audit report");
  if (entity!==null && (typeof entity!=="string" ||
      !/^(game|casino|author):[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entity)))
    throw new Error("Entity filter must be type:stable-slug");
  if (pilot && (pilot.schemaVersion!==1 || pilot.status!=="research-leads-only" ||
      pilot.entity?.type!=="game" || !pilot.entity?.id || !Array.isArray(pilot.claims) ||
      pilot.approvalGranted!==false || pilot.autoPublish!==false))
    throw new Error("Invalid research lead pack; leads are not approved evidence");
  const used=new Set();
  const tasks=audit.blockers.map(b=>{
    validateBlocker(b);
    const id=b.type+":"+b.id+":"+b.field;
    if(used.has(id)) throw new Error("Duplicate blocker: "+id);
    used.add(id);
    const lead=(pilot && pilot.entity.id===b.id && pilot.entity.type===b.type)
      ?pilot.claims.find(c=>c.field===b.field):undefined;
    return {
      taskId:id,entityType:b.type,entityId:b.id,field:b.field,
      priority:priorityFor(b),workstream:workstreamFor(b),
      status:"needs-human-review",blockerCodes:[...b.codes],
      recommendedAction:nextActionFor(b),
      researchLead:lead?{
        status:"research-lead-only",assessment:lead.assessment,
        observedOn:pilot.observedOn??null,projectValueAtLookup:lead.projectValue??null,
        sourceIds:[...(lead.sourceIds||[])],notes:lead.notes,
        candidateValue:lead.candidateValue??null
      }:null,
      autoApprove:false,autoPublish:false
    };
  }).filter(t=>entity===null || t.entityType+":"+t.entityId===entity);
  if(entity!==null && !tasks.length) throw new Error("No pending blockers for "+entity);
  tasks.sort((a,b)=>PRIORITIES[a.priority]-PRIORITIES[b.priority] ||
    (ENTITY_ORDER[a.entityType]??99)-(ENTITY_ORDER[b.entityType]??99) ||
    a.entityId.localeCompare(b.entityId) || a.field.localeCompare(b.field));
  const byPriority={P0:0,P1:0,P2:0},byEntity={},byWorkstream={};
  for(const task of tasks){
    byPriority[task.priority]++;
    const key=task.entityType+":"+task.entityId;
    byEntity[key]=(byEntity[key]||0)+1;
    byWorkstream[task.workstream]=(byWorkstream[task.workstream]||0)+1;
  }
  return {
    schemaVersion:1,source:"stage43-audit",auditAt:audit.auditedAt??null,
    scope:entity??"all-current-audit-blockers",
    releaseAllowed:false,autoApprove:false,autoPublish:false,
    counts:{sourceBlockers:audit.blockers.length,scopedTasks:tasks.length,
      byPriority,byEntity,byWorkstream},
    tasks,
    caveat:"Work queue is not provenance, approval or permission to publish. Source leads are unreviewed."
  };
}
function mdEscape(value) {
  return String(value??"").replace(/\\/g,"\\\\").replace(/\|/g,"\\|")
    .replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\r?\n/g," ");
}
export function renderQueueMarkdown431(queue) {
  if(!queue?.counts || !Array.isArray(queue.tasks)) throw new Error("Invalid queue");
  const lines=[
    "# Stage 43.1 — Editorial remediation queue","",
    "- Audit: "+mdEscape(queue.auditAt||"unknown"),
    "- Scope: "+mdEscape(queue.scope),
    "- Tasks: "+queue.counts.scopedTasks+" / "+queue.counts.sourceBlockers+" audit blockers",
    "- Priorities: P0 "+queue.counts.byPriority.P0+", P1 "+queue.counts.byPriority.P1+", P2 "+queue.counts.byPriority.P2,
    "- **Release remains blocked.** No approval or publication action is performed.","",
    "| Priority | Entity | Field | Blocker code(s) | Required editorial action |",
    "|---|---|---|---|---|"
  ];
  for(const t of queue.tasks) lines.push("| "+mdEscape(t.priority)+" | "+
    mdEscape(t.entityType)+":"+mdEscape(t.entityId)+" | "+mdEscape(t.field)+" | "+
    t.blockerCodes.map(mdEscape).join(", ")+" | "+mdEscape(t.recommendedAction)+" |");
  lines.push("","Research lead candidates, if shown in the JSON report, are not evidence approvals.","");
  return lines.join("\n");
}
