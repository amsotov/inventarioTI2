// Dos paquetes separados: interfaz conectada en raíz y demo conservada en /demo/.
import {execFileSync}from'node:child_process';
import fs from'node:fs';import path from'node:path';import{createHash}from'node:crypto';
const endpoint='https://yhsfotxhaptinjtmrinn.supabase.co/functions/v1/inventarioti2-pages-api';
if(process.env.VITE_DEMO_MODE!=='false'||process.env.VITE_API_BASE!==endpoint||process.env.VITE_EMAIL_AUTH!=='true'||process.env.VITE_PAGES_CONNECTED!=='true')throw Error('CONNECTED_BUILD_REQUIRED');
const output='dist/web';if(!fs.existsSync(output+'/index.html'))throw Error('BUILD_REQUIRED');
execFileSync(process.execPath,['node_modules/vite/bin/vite.js','build','apps/web','--config','vite.config.js','--outDir','../../dist/web/demo','--emptyOutDir'],{stdio:'inherit',env:{...process.env,VITE_DEMO_MODE:'true',VITE_API_BASE:'',VITE_PAGES_CONNECTED:'false',VITE_PAGES_PREVIEW:'true',VITE_BASE_PATH:'/inventarioTI2/demo/'}});
execFileSync(process.execPath,['scripts/build-pages.mjs'],{stdio:'inherit',env:{...process.env,VITE_DEMO_MODE:'true',VITE_PAGES_PREVIEW:'true',PAGES_OUTPUT_DIR:'dist/web/demo'}});
fs.cpSync(output+'/demo/modernizacion',output+'/modernizacion',{recursive:true});
const sha=process.env.GITHUB_SHA??process.env.PUBLICATION_SOURCE_SHA??null;if(sha!==null&&!/^[a-f0-9]{40}$/.test(sha))throw Error('INVALID_SOURCE_SHA');
const files={};function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(f!==output+'/publicacion.json')files[path.relative(output,f).split(path.sep).join('/')]=createHash('sha256').update(fs.readFileSync(f)).digest('hex');}}walk(output);
fs.writeFileSync(output+'/publicacion.json',JSON.stringify({kind:'INTERFAZ_CONECTADA_SUPABASE_PRUEBAS',source_sha:sha,built_at:new Date().toISOString(),interactive_model_demo:false,entry:'modelo/equipos',database_connected:true,authentication:'email-link-pkce',api:endpoint,demo:'demo/',target_model_ready:false,files},null,2)+'\n');
console.log('Pages conectado: interfaz real y demo aislada conservada.');
