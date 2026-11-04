import {execFileSync} from 'node:child_process';
import {cpSync,mkdirSync,readFileSync,rmSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
// Recompilar explícitamente sin transporte demo ni base de Pages.
execFileSync('npm',['run','build'],{stdio:'inherit',env:{...process.env,VITE_DEMO_MODE:'false',VITE_PAGES_PREVIEW:'false',VITE_BASE_PATH:'/',VITE_MODERNIZATION_ENTRY:'true'}});
const target='staging/release';rmSync(target,{recursive:true,force:true});mkdirSync(target+'/dist/apps',{recursive:true});
for(const file of ['package.json','package-lock.json'])cpSync(file,target+'/'+file);
cpSync('dist/apps/server',target+'/dist/apps/server',{recursive:true});cpSync('dist/web',target+'/dist/web',{recursive:true});
cpSync('scripts/staging/preflight.mjs',target+'/preflight.mjs');
const hashes={};
function walk(path){for(const item of readdirSync(path,{withFileTypes:true})){const name=join(path,item.name);if(item.isDirectory())walk(name);else hashes[name.slice(target.length+1)]=createHash('sha256').update(readFileSync(name)).digest('hex');}}
walk(target);
const assets=Object.keys(hashes).filter(x=>x.startsWith('dist/web/')&&x.endsWith('.js'));
if(assets.some(x=>/demoModel|demo-/.test(x)))throw new Error('DEMO_CHUNK_IN_STAGING');
writeFileSync(target+'/release.json',JSON.stringify({kind:'connected-staging',demo:false,project:'yhsfotxhaptinjtmrinn',files:hashes},null,2)+'\n');
console.log('Paquete conectado preparado; sin secretos, SQL, pruebas ni worker iniciado.');
