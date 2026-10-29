import {workflow40,writeWorkflow40} from './workflow40.mjs';
const args=process.argv.slice(2),command=args.shift()??'report';
const opts={};for(let i=0;i<args.length;i+=2){if(!args[i]?.startsWith('--')||args[i+1]==null)throw new Error('Expected --option value');const key=args[i].slice(2).replace(/-([a-z])/g,(_,c)=>c.toUpperCase());if(!['stagingDir','draftDir','publishedDir','factsDir','threshold','outFile'].includes(key))throw new Error('Unknown option: '+key);opts[key]=key==='threshold'?Number(args[i+1]):args[i+1];}
if(command!=='report'&&command!=='export')throw new Error('Commands: report | export');
console.log(JSON.stringify(command==='report'?await workflow40(opts):await writeWorkflow40(opts),null,2));
