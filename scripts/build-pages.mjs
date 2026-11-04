// Paquete estático de revisión. No incorpora repositorios dobles ni datos reales.
import {copyFileSync,existsSync,mkdirSync,readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {join,relative} from 'node:path';

if(process.env.VITE_DEMO_MODE!=='true'||process.env.VITE_PAGES_PREVIEW!=='true')throw Error('PAGES_REQUIRES_DEMO_PREVIEW_BUILD');
const root=fileURLToPath(new URL('../',import.meta.url)),output=join(root,'dist/web');
if(!existsSync(join(output,'index.html')))throw Error('PAGES_BUILD_MISSING');
const sourceSha=process.env.GITHUB_SHA??process.env.PUBLICATION_SOURCE_SHA??null;
if(sourceSha!==null&&!/^[0-9a-f]{40}$/.test(sourceSha))throw Error('INVALID_SOURCE_SHA');
const preview=join(output,'modernizacion'),prototype=join(preview,'prototipo');
mkdirSync(prototype,{recursive:true});mkdirSync(join(preview,'capturas'),{recursive:true});
for(const file of ['index.html','base.css','propuesta.css','propuesta.js'])copyFileSync(join(root,'docs/migracion/prototipo-fase3',file),join(prototype,file));
const sha=data=>createHash('sha256').update(data).digest('hex');
const evidence=JSON.parse(readFileSync(join(root,'docs/migracion/evidencias/fase7/navegador.json'),'utf8'));
if(evidence.resultado!=='APROBADA'||evidence.screenshots.length!==6)throw Error('INVALID_REVIEW_EVIDENCE');
const figures=evidence.screenshots.map(item=>{
 const name=item.path.split('/').at(-1);
 if(!/^(1440|768|390)-(administrador|lectura)\.png$/.test(name)||item.path!=='docs/migracion/evidencias/fase7/'+name)throw Error('INVALID_REVIEW_IMAGE');
 const data=readFileSync(join(root,item.path));if(sha(data)!==item.sha256)throw Error('REVIEW_IMAGE_HASH_MISMATCH');
 copyFileSync(join(root,item.path),join(preview,'capturas',name));
 const label=(item.role==='administrador'?'Administrador':'Solo lectura')+' · '+item.width+' px';
 return `<figure><a href="capturas/${name}"><img src="capturas/${name}" alt="Interfaz de equipos y relaciones: ${label}" loading="lazy" width="${item.width}"></a><figcaption>${label}. Captura del ensayo de interfaz; abrir para ampliar.</figcaption></figure>`;
}).join('\n');
writeFileSync(join(preview,'index.html'),`<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'">
<title>Inventario TI · Modernización</title><link rel="stylesheet" href="review.css"></head>
<body><a class="skip" href="#contenido">Saltar al contenido</a><header><a href="../">← Volver a la demo de inventario</a><p>Inventario TI</p><h1>Modernización</h1><p>Vistas para revisar los avances del nuevo modelo de inventario.</p></header>
<main id="contenido"><section class="card"><h2>Prototipo navegable</h2><p>Explora equipos, fichas técnicas, asignaciones, funcionarios, mantenciones y catálogos. Es una propuesta de diseño con datos ficticios; sus acciones son simulaciones y se reinician al recargar.</p><a class="button" href="prototipo/">Abrir prototipo de modernización</a></section>
<section class="card"><h2>Interfaz implementada · capturas</h2><p>Capturas de las pantallas React verificadas en escritorio, tablet y móvil, para administrador y lectura. Son imágenes del ensayo local de interfaz; no una conexión activa a la base de datos.</p><div class="gallery">${figures}</div></section>
<section class="card"><h2>Estado de la integración</h2><p>La integración del nuevo modelo de datos sigue pendiente. Esta publicación permite revisar el diseño y las pantallas; las operaciones reales requieren el backend y las validaciones de destino.</p><p>La demo de inventario existente continúa disponible con datos ficticios en memoria.</p></section></main></body></html>\n`);
writeFileSync(join(preview,'review.css'),`:root{font:16px system-ui,sans-serif;color:#20323c;background:#f4f6f7}*{box-sizing:border-box}body{margin:0}header,main{max-width:1120px;margin:auto;padding:24px}header{border-bottom:4px solid #08766b}h1{font-size:2.3rem}a{color:#08675e}a:focus-visible{outline:3px solid #08766b;outline-offset:4px}.card{padding:24px;background:white;border:1px solid #d4dce0;border-radius:8px;margin-bottom:24px}.button{display:inline-block;background:#08766b;color:white;padding:12px 18px;border-radius:6px}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:20px}figure{margin:0;min-width:0}img{max-width:100%;height:auto;border:1px solid #d4dce0}figcaption{padding:12px 0;font-size:.9rem}.skip{position:absolute;top:-100px}.skip:focus{top:8px;background:white;padding:12px}@media(max-width:480px){header,main{padding:16px}.card{padding:16px}}\n`);
const files={};
function inventory(dir){for(const item of readdirSync(dir,{withFileTypes:true})){const path=join(dir,item.name);if(item.isDirectory())inventory(path);else if(item.isFile()&&relative(output,path)!=='publicacion.json')files[relative(output,path).split('\\').join('/')]=sha(readFileSync(path));}}
inventory(output);
writeFileSync(join(output,'publicacion.json'),JSON.stringify({kind:'DEMO_Y_REVISION_ESTATICA',source_sha:sourceSha,built_at:new Date().toISOString(),database_connected:false,target_model_ready:false,prototype:'modernizacion/prototipo/',review:'modernizacion/',files},null,2)+'\n');
console.log('Pages: demo, prototipo y seis capturas verificados; '+Object.keys(files).length+' archivos estáticos.');
