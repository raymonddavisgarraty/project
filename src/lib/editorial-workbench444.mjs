// Stage 44.4: offline render. Static template contains no audit data.
import {readFileSync} from "node:fs";
const TEMPLATE=readFileSync(new URL("../../private-templates/editorial-workbench444.template.txt",import.meta.url),"utf8");
function escapeHtml(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");}
function renderEditorialWorkbench444({audit,queue}={}){
 if(!audit||audit.schemaVersion!==1||!Array.isArray(audit.items)||!Array.isArray(audit.blockers)||
 !audit.counts||audit.autoApprove!==false||audit.autoPublish!==false||
 !queue||queue.schemaVersion!==1||queue.source!=="stage43-audit"||
 queue.scope!=="all-current-audit-blockers"||queue.autoApprove!==false||queue.autoPublish!==false||
 !Array.isArray(queue.tasks)||queue.tasks.length!==audit.blockers.length||
 queue.counts?.scopedTasks!==queue.tasks.length)
 throw Error("Expected matching, unmodified Stage 43 / 43.1 private audit and queue");
 const types=new Set(["game","casino","author"]),priorities=["P0","P1","P2"];
 const items=audit.items.map(it=>{
  if(!it||!types.has(it.type)||typeof it.id!=="string"||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(it.id)||
    !Array.isArray(it.blockers)||typeof it.releaseReady!=="boolean")throw Error("Invalid entity in Stage 43 audit");
  return {id:it.id,type:it.type,key:`${it.type}:${it.id}`,blockers:it.blockers.length,ready:it.releaseReady};
 });
 const keys=new Set(items.map(x=>x.key)),blockers=new Set(audit.blockers.map(x=>`${x.type}:${x.id}:${x.field}`));
 if(keys.size!==items.length||blockers.size!==audit.blockers.length)throw Error("Invalid or duplicate audit entities or blockers");
 const counts={P0:0,P1:0,P2:0},seen=new Set();
 for(const t of queue.tasks){
  if(!t||!types.has(t.entityType)||!keys.has(`${t.entityType}:${t.entityId}`)||!priorities.includes(t.priority)||
  typeof t.field!=="string"||typeof t.taskId!=="string"||!Array.isArray(t.blockerCodes)||
  typeof t.recommendedAction!=="string"||t.autoApprove!==false||t.autoPublish!==false||
  t.status!=="needs-human-review"||t.taskId!==`${t.entityType}:${t.entityId}:${t.field}`||
  !blockers.has(t.taskId)||seen.has(t.taskId))throw Error("Invalid or duplicate private review task");
  seen.add(t.taskId);counts[t.priority]++;
 }
 if(!queue.counts.byPriority||priorities.some(p=>queue.counts.byPriority[p]!==counts[p])||
 audit.counts.blockers!==queue.tasks.length)throw Error("Audit and queue blocker counts disagree");
 const cards=items.map(x=>`<button class="entity-card" type="button" data-choose-entity="${escapeHtml(x.key)}" aria-label="Show ${escapeHtml(x.key)} tasks"><span class="entity-type">${escapeHtml(x.type)}</span><strong>${escapeHtml(x.id)}</strong><span class="entity-count">${x.blockers} unresolved tasks</span><span class="entity-status">${x.ready?"No entity blockers":"Review pending"}</span></button>`).join("\n");
 const options=items.map(x=>`<option value="${escapeHtml(x.key)}">${escapeHtml(x.key)}</option>`).join("\n");
 const rows=queue.tasks.map((t,i)=>{
  const id=escapeHtml(`${t.entityType}:${t.entityId}`),search=escapeHtml(`${t.entityType} ${t.entityId} ${t.field} ${t.blockerCodes.join(" ")} ${t.recommendedAction}`.toLowerCase());
  return `<tr data-priority="${escapeHtml(t.priority)}" data-entity="${id}" data-search="${search}"><td><span class="priority priority--${escapeHtml(t.priority.toLowerCase())}">${escapeHtml(t.priority)}</span></td><td><strong>${id}</strong><span class="muted mobile-label">Task ${i+1}</span></td><td>${escapeHtml(t.field)}</td><td><code>${escapeHtml(t.blockerCodes.join(", "))}</code></td><td>${escapeHtml(t.recommendedAction)}</td></tr>`;
 }).join("\n");
 const metrics=`<section class="metrics" aria-label="Audit summary"><div class="metric"><b>${queue.tasks.length}</b><span>Open review actions</span></div><div class="metric"><b>${counts.P0}</b><span>Priority P0</span></div><div class="metric"><b>${counts.P1}</b><span>Priority P1</span></div><div class="metric"><b>${Number.isInteger(audit.counts.verified)?audit.counts.verified:0}</b><span>Verified field claims</span></div></section>`;
 const entities=`<section id="entities"><div class="section-head"><h2>Entities requiring review</h2><p>${items.length} audited entity records</p></div><div class="entities">${cards}</div></section>`;
 const tasks=`<section id="tasks"><div class="section-head"><h2>Remediation queue</h2><p id="result-count" role="status" aria-live="polite">${queue.tasks.length} tasks shown</p></div><div class="controls"><div class="field field--search"><label for="query">Search task, field or blocker</label><input type="search" id="query" placeholder="e.g. sweet-bonanza, rtp, licence" autocomplete="off"></div><div class="field"><label for="priority">Priority</label><select id="priority"><option value="">All priorities</option><option>P0</option><option>P1</option><option>P2</option></select></div><div class="field"><label for="entity">Entity</label><select id="entity"><option value="">All entities</option>${options}</select></div><button type="button" id="clear" class="clear">Clear filters</button></div><div class="table-wrap"><table><thead><tr><th scope="col">Priority</th><th scope="col">Entity</th><th scope="col">Field</th><th scope="col">Blocker codes</th><th scope="col">Required human action</th></tr></thead><tbody id="task-rows">${rows}</tbody></table></div><p id="empty" class="empty" hidden>No tasks match the selected filters.</p></section>`;
 const date=Number.isFinite(Date.parse(audit.auditedAt))?new Date(audit.auditedAt).toISOString().replace("T"," ").slice(0,19)+" UTC":"not recorded";
 return TEMPLATE.replace("@@DATE@@",escapeHtml(date))
 .replace("@@GATE@@",audit.productionReleaseAllowed?"Publication gates must be independently confirmed":"Production publication is blocked.")
 .replace("@@DATA@@",metrics+"\n"+entities+"\n"+tasks+"\n");
}
export {renderEditorialWorkbench444};
