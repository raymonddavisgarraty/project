import assert from 'node:assert/strict';
import {previewContentWorkflowV1} from '../src/lib/content-workflow-v1.mjs';
const sha='a'.repeat(64);
const game={id:'synthetic-game',slug:'synthetic-game',title:'Synthetic title',description:'Original summary',
  author:'review-team',globalFacts:{sourceStatus:'editorially-verified'},rating:4.9,affiliateId:'hidden',bonus:'hidden'};
const route={type:'game',entityId:game.id,path:'/en/games/synthetic-game/'};
const audit={schemaVersion:1,autoApprove:false,autoPublish:false,items:[
 {type:'game',id:game.id,releaseReady:true,blockers:[],claims:[{status:'verified'}]},
 {type:'author',id:'review-team',releaseReady:true,blockers:[]},
 {type:'game',id:'unrelated',releaseReady:false,blockers:[{field:'rtp'}],claims:[{status:'unverified'}]}
]};
const state={type:'game',id:game.id,status:'published',contentSha256:sha,reviewedBy:'editor-one',
  reviewedAt:'2026-11-05T10:00:00Z',informationRightsApproved:true};
const base={games:[game],casinos:[],states:[state],routes:[route],audit,globalInformationApproved:true,
  measuredRevisionHashes:{[route.path]:sha},now:Date.parse('2026-11-05T12:00:00Z')};
const clone=()=>structuredClone(base);
const valid=previewContentWorkflowV1(base);
assert.equal(valid.ok,true,valid.errors.join(';'));
assert.equal(valid.entities.games.length,1);
for(const k of ['previewOnly','publicationApproved','indexabilityApproved','publicExportApproved'])
  assert.equal(valid[k],k==='previewOnly',k);
const result=JSON.stringify(valid);
for(const s of ['affiliateId','hidden','bonus','rating','editor-one'])
  assert(!result.includes(s),'private/unsafe field: '+s);
const bad=[
 ['not globally allowed',o=>o.globalInformationApproved=false],
 ['rights not approved',o=>o.states[0].informationRightsApproved=false],
 ['wrong revision hash',o=>o.measuredRevisionHashes[route.path]='b'.repeat(64)],
 ['missing revision',o=>o.states[0].contentSha256=null],
 ['unreviewed author',o=>o.audit.items=o.audit.items.filter(x=>x.type!=='author')],
 ['unverified claim',o=>o.audit.items[0].claims[0].status='unverified'],
 ['audit blocker',o=>o.audit.items[0].blockers.push({field:'rtp'})],
 ['not release ready',o=>o.audit.items[0].releaseReady=false],
 ['future review',o=>o.states[0].reviewedAt='2099-01-01T00:00:00Z'],
 ['missing reviewer',o=>o.states[0].reviewedBy=null],
 ['route unknown',o=>o.routes=[]],
 ['wrong route id',o=>o.routes[0].entityId='other'],
 ['source unverified',o=>o.games[0].globalFacts.sourceStatus='legacy-unverified'],
 ['duplicate states',o=>o.states.push({...o.states[0]})],
 ['unexpected publish field',o=>o.states[0].affiliateUrl='https://bad.example'],
 ['injected audit autoApprove',o=>o.audit.autoApprove=true],
 ['nonexistent entity',o=>o.states[0].id='ghost'],
 ['invalid unknown status',o=>o.states[0].status='instant-publish'],
 ['missing title',o=>o.games[0].title=''],
 ['unsafe summary',o=>o.games[0].description='<script>bad</script>'],
];
for(const [name,change] of bad){
 const o=clone();change(o);const r=previewContentWorkflowV1(o);
 assert.equal(r.ok,false,name);assert.equal(r.entities.games.length,0,name);
 assert.equal(r.publicExportApproved,false,name);
}
for(const status of ['draft','review','archived']){
 const o=clone();o.states=[{type:'game',id:game.id,status}];
 const r=previewContentWorkflowV1(o);
 assert.equal(r.ok,true,status);assert.equal(r.entities.games.length,0,status);
}
const missing=clone();missing.states=[];
assert.equal(previewContentWorkflowV1(missing).counts.draft,1);
console.log('Simple publication workflow tests OK ('+bad.length+
 ' negative cases, 3 unpublished states, strict fields, preview-only).');
