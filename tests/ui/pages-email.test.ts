import{test}from'node:test';import assert from'node:assert/strict';import{execFileSync}from'node:child_process';
import{mkdtempSync,readFileSync,rmSync}from'node:fs';import{tmpdir}from'node:os';import{join,resolve,extname,sep}from'node:path';
import{chromium}from'@playwright/test';import{app}from'../../apps/server/app.js';import{emailFixture}from'../helpers/email-link.js';
const{pagesHandler}=await import('data:text/javascript;base64,'+Buffer.from(readFileSync('staging/pages/handler.mjs')).toString('base64'));
test('Pages: correo desde otro origen activa y conserva la sesión',async()=>{
 const site='https://inventarioti2-prueba-20261104.alejandrosotovivar.chatgpt.site',pages='https://amsotov.github.io/inventarioTI2/',api='https://yhsfotxhaptinjtmrinn.supabase.co/functions/v1/inventarioti2-pages-api';
 const fixture=emailFixture(site),server=app(fixture.auth,site),dir=mkdtempSync(join(tmpdir(),'inventario-pages-'));
 execFileSync('node',['node_modules/vite/bin/vite.js','build','apps/web','--config','vite.config.js','--outDir',dir,'--emptyOutDir'],{env:{...process.env,VITE_EMAIL_AUTH:'true',VITE_DEMO_MODE:'false',VITE_API_BASE:api,VITE_PAGES_CONNECTED:'true',VITE_MODERNIZATION_ENTRY:'false',VITE_PAGES_PREVIEW:'false',VITE_BASE_PATH:'/inventarioTI2/'},stdio:'pipe'});
 const handle=pagesHandler({initialize:async()=>({server,reports:{whenIdle:async()=>{}}}),envelope:'test-only',appOrigin:site});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH??'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const setup=async(context:any)=>context.route('**/*',async(route:any)=>{
   const request=route.request(),url=new URL(request.url());
   if(request.url().startsWith(pages)){
    const file=resolve(dir,url.pathname.slice('/inventarioTI2/'.length)||'index.html');if(!file.startsWith(dir+sep))return route.abort();
    try{return await route.fulfill({body:readFileSync(file),contentType:({'.html':'text/html','.js':'application/javascript','.css':'text/css'} as any)[extname(file)]??'application/octet-stream'});}catch{return route.fulfill({status:404,body:''});}
   }
   if(request.url().startsWith(api)){
    const response=await handle(new Request(request.url(),{method:request.method(),headers:await request.allHeaders(),body:request.postDataBuffer()??undefined}));
    const headers=Object.fromEntries(response.headers);const cookies=response.headers.getSetCookie();if(cookies.length)headers['set-cookie']=cookies.join('\n');
    return route.fulfill({status:response.status,headers,body:Buffer.from(await response.arrayBuffer())});
   }
   if(url.origin===site){const result=await server.inject({method:request.method() as any,url:url.pathname+url.search,headers:await request.allHeaders(),payload:request.postDataBuffer()??undefined});return route.fulfill({status:result.statusCode,headers:result.headers,body:result.rawPayload});}
   return route.abort();
  });
  const original=await browser.newContext();await setup(original);const page=await original.newPage();page.setDefaultTimeout(15000);
  await page.goto(pages);await page.getByRole('heading',{name:'Acceso por correo',exact:true}).waitFor();
  await page.getByLabel('Correo',{exact:true}).fill('owner@example.invalid');await page.getByRole('button',{name:'Enviar enlace de autorización',exact:true}).click();
  await page.getByRole('status').getByText(/Revisa tu correo|Esperando tu autorización/).waitFor();assert(fixture.sent());assert.equal(fixture.sessions.size,0);
  const mail=await browser.newContext();await setup(mail);const confirmation=await mail.newPage();await confirmation.goto(fixture.sent()!.url+'&code=valid-auth-code-1234567890');await confirmation.getByRole('status').getByText(/Correo autorizado/).waitFor();
  await page.getByRole('button',{name:'Cerrar sesión',exact:true}).waitFor({timeout:20000});
  assert.equal(fixture.sessions.size,1);assert.equal((await mail.cookies()).some(c=>c.name==='__Host-inventario'),false);
  const cookies=await original.cookies(api);const session=cookies.find(c=>c.name==='__Host-inventario');assert(session?.httpOnly&&session.secure);assert.equal(session.sameSite,'None');assert(!cookies.some(c=>c.name==='__Host-inventario-correo'));
  await page.reload();await page.getByRole('button',{name:'Cerrar sesión',exact:true}).waitFor();
 }finally{await browser.close();await server.close();rmSync(dir,{recursive:true,force:true});}
});
