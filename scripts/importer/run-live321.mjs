import {liveImport,fetchRobots} from './live321.mjs';
const args=process.argv.slice(2);
const option=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
if(!args.includes('--confirm-permission')){
 console.error('Network requests require --confirm-permission after checking source terms and authorization.');process.exit(2);
}
const maxMaps=Number(option('--maps')??1),limit=Number(option('--limit')??3);
try{
 const robotsText=await fetchRobots();
 const result=await liveImport({robotsText,maxMaps,limit,write:args.includes('--write'),statePath:option('--state')||undefined,outDir:option('--out')||undefined});
 console.log(JSON.stringify(result,null,2));
 if(result.fetch.errors.length)process.exitCode=1;
}catch(e){console.error('Live import failed:',e.message);process.exitCode=1;}
