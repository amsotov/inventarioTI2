// Comprueba el paquete real contra el backend, sin solicitar correos ni abrir sesiones.
import{chromium,expect}from'@playwright/test';import assert from'node:assert/strict';
import{readFile,stat}from'node:fs/promises';import{existsSync}from'node:fs';import{resolve,extname,sep}from'node:path';
const origin='https://amsotov.github.io',base=origin+'/inventarioTI2/',root=resolve('dist/web');
const api='https://yhsfotxhaptinjtmrinn.supabase.co/functions/v1/inventarioti2-pages-api';
const manifest=JSON.parse(await readFile(root+'/publicacion.json','utf8'));assert.equal(manifest.database_connected,true);assert.equal(manifest.interactive_model_demo,false);assert.equal(manifest.api,api);
const proxy=process.env.HTTPS_PROXY||process.env.https_proxy;
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox'],...(proxy?{proxy:{server:proxy}}:{})});
try{
 const page=await browser.newPage(),errors=[],responses=[];
 page.on('pageerror',e=>errors.push(e.message));if(process.env.PAGES_DIAGNOSTIC==='true'){page.on('requestfailed',r=>console.log('FAILED',new URL(r.url()).pathname,r.failure()?.errorText));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text());});page.on('response',r=>{if(r.url().startsWith(api))console.log('RESPONSE',r.status(),new URL(r.url()).pathname);});}page.on('response',r=>{if(r.url().startsWith(api))responses.push({path:new URL(r.url()).pathname,status:r.status()});});
 if(process.env.PAGES_LIVE!=='true')await page.route(base+'**',async route=>{
  const name=decodeURIComponent(new URL(route.request().url()).pathname.slice('/inventarioTI2/'.length));const file=resolve(root,name||'index.html');
  if(!file.startsWith(root+sep)){await route.abort();return;}
  try{const target=(await stat(file)).isDirectory()?file+'/index.html':file;await route.fulfill({status:200,body:await readFile(target),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json'})[extname(target)]||'application/octet-stream'});}catch{await route.fulfill({status:404,body:'Not found'});}
 });
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:60000});
 await expect(page.getByRole('heading',{name:'Acceso por correo',exact:true})).toBeVisible({timeout:30000});
 await expect(page.getByLabel('Rol demo',{exact:true})).toHaveCount(0);await expect(page.locator('input[type=password]')).toHaveCount(0);
 await page.waitForResponse(r=>r.url()===api+'/api/v1/sesion/correo/estado'&&r.status()===401,{timeout:30000}).catch(()=>{assert(responses.some(r=>r.path.endsWith('/sesion/correo/estado')&&r.status===401));});
 const checks=await page.evaluate(async api=>{
  const r=await fetch(api+'/api/v2/equipos',{credentials:'include'});return{status:r.status,code:(await r.json()).code};
 },api);assert.equal(checks.status,401);assert.equal(checks.code,'SESSION_REQUIRED');assert.deepEqual(errors,[]);
 if(process.env.PAGES_COOKIE_PROBE==='true'){
  const sent=await page.evaluate(async api=>{const r=await fetch(api+'/api/v1/sesion/correo/solicitar',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'codex-pages-probe@example.invalid'})});return r.status;},api);
  assert.equal(sent,202);const cdp=await page.context().newCDPSession(page);const jar=await cdp.send('Network.getAllCookies');const cookie=jar.cookies.find(c=>c.name==='__Host-inventario-correo');assert(cookie?.httpOnly&&cookie.secure);assert.equal(cookie.sameSite,'None');assert.equal(cookie.partitionKey?.topLevelSite,origin);console.log('PASS: cookie real HttpOnly/Secure/SameSite=None/Partitioned; dirección sintética inexistente, sin envío de correo.');
 }
 console.log(JSON.stringify({result:'PASS',published:process.env.PAGES_LIVE==='true',emailAccess:true,demo:false,anonymousInventoryDenied:true,corsWorks:true,errors}));
}finally{await browser.close();}
