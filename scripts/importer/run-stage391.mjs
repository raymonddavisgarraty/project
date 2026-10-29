import {auditEditorial391} from './editorial391.mjs';
const args=process.argv.slice(2),val=k=>{const i=args.indexOf(k);return i>=0?args[i+1]:undefined;};
try{
 if(args[0]!=='audit')throw new Error('Usage: audit --editorial FILE --slug SLUG --staging FILE [--published-dir DIR] [--compare-dir DIR] [--threshold 0.88]');
 const result=await auditEditorial391({editorialFile:val('--editorial'),slug:val('--slug'),stagingFile:val('--staging'),publishedDir:val('--published-dir')??'src/content/locales/en/games',existingEditorialDir:val('--compare-dir'),threshold:val('--threshold')===undefined?0.88:Number(val('--threshold'))});
 console.log(JSON.stringify(result,null,2));if(!result.ready)process.exitCode=2;
}catch(e){console.error('Stage 39.1:',e.message);process.exitCode=1;}
