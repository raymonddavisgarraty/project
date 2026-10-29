import {createBrief39,auditEditorial39} from './editorial39.mjs';
const args=process.argv.slice(2);const val=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:undefined;};
try{
 let result;
 if(args[0]==='brief')result=await createBrief39({stagingFile:val('--staging'),slug:val('--slug'),outFile:val('--out')});
 else if(args[0]==='audit')result=await auditEditorial39({editorialFile:val('--editorial'),slug:val('--slug'),stagingFile:val('--staging'),existingEditorialDir:val('--compare-dir')});
 else throw new Error('Usage: brief --staging FILE --slug SLUG --out FILE | audit --editorial FILE --slug SLUG [--staging FILE] [--compare-dir DIR]');
 console.log(JSON.stringify(result,null,2));if(result.ready===false)process.exitCode=2;
}catch(e){console.error('Stage 39:',e.message);process.exitCode=1;}
