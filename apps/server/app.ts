import Fastify from 'fastify';
import { AuthError, AuthService } from './auth/service.js';
const str = {type:'string',minLength:1,maxLength:320};
const schema = (props: Record<string,unknown>) => ({body:{type:'object',additionalProperties:false,required:Object.keys(props),properties:props}});
export function app(auth: AuthService, origin: string) {
  const server=Fastify({logger:false,bodyLimit:8192,trustProxy:false,ajv:{customOptions:{removeAdditional:false,coerceTypes:false}}});
  server.addHook('onRequest',async(req,res)=>{
    res.header('cache-control','no-store').header('referrer-policy','no-referrer').header('x-content-type-options','nosniff');
    if(req.method!=='GET' && req.headers.origin!==origin) throw new AuthError(403,'FORBIDDEN');
  });
  server.setErrorHandler((err,req,res)=>{
    const e=err as Error & {validation?:unknown};
    const status=err instanceof AuthError?err.status:e.validation?400:503;
    res.code(status).type('application/problem+json').send({type:'about:blank',title:'No se pudo completar la solicitud',status,code:err instanceof AuthError?err.code:e.validation?'INVALID_REQUEST':'DEPENDENCY_UNAVAILABLE',requestId:req.id});
  });
  const sid=(req:{headers:{cookie?:string}})=>req.headers.cookie?.split(';').map(x=>x.trim()).find(x=>x.startsWith('__Host-inventario='))?.slice(18)??'';
  const csrf=(req:{headers:Record<string,unknown>})=>typeof req.headers['x-csrf-token']==='string'?req.headers['x-csrf-token']:'';
  const cookie=(id:string)=>`__Host-inventario=${id}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
  server.post<{Body:{email:string;password:string}}>('/api/v1/sesion',{schema:schema({email:{...str,pattern:'^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'},password:{...str,maxLength:1024}})},async(req,res)=>{
    await auth.rate(req.ip,req.body.email);const result=await auth.login(req.body.email,req.body.password);
    res.header('set-cookie',cookie(result.sid));return {csrf:result.csrf,mfaRequired:result.mfaRequired};
  });
  server.get('/api/v1/sesion',async req=>auth.status(sid(req)));
  server.post('/api/v1/sesion/actividad',{schema:schema({})},async(req,res)=>{await auth.activity(sid(req),csrf(req));return res.code(204).send();});
  server.post('/api/v1/sesion/salir',{schema:schema({})},async(req,res)=>{await auth.logout(sid(req),csrf(req));return res.header('set-cookie',cookie('').replace('Max-Age=28800','Max-Age=0')).code(204).send();});
  server.post('/api/v1/sesion/mfa/enrolar',{schema:schema({})},async req=>{await auth.rate(req.ip,'mfa:'+sid(req));return auth.enroll(sid(req),csrf(req));});
  server.post<{Body:{factor:string;code:string}}>('/api/v1/sesion/mfa/verificar',{schema:schema({factor:{...str,maxLength:64},code:{type:'string',pattern:'^[0-9]{6}$'}})},async(req,res)=>{
    await auth.rate(req.ip,'mfa:'+sid(req));const result=await auth.verify(sid(req),csrf(req),req.body.factor,req.body.code);
    res.header('set-cookie',cookie(result.sid));return {csrf:result.csrf};
  });
  server.post<{Body:{email:string}}>('/api/v1/acceso/recuperar',{schema:schema({email:{...str,pattern:'^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'}})},async(req,res)=>{
    await auth.rate(req.ip,req.body.email);
    try {await auth.issue(req.body.email,'recovery');} catch { /* respuesta genérica, tampoco expone fallos del proveedor */ }
    return res.code(202).send({message:'Si corresponde, recibirás instrucciones de acceso.'});
  });
  server.post<{Body:{token:string;password:string}}>('/api/v1/acceso/completar',{schema:schema({token:{type:'string',pattern:'^[A-Za-z0-9_-]{43}$'},password:{type:'string',minLength:12,maxLength:128}})},async(req,res)=>{
    await auth.rate(req.ip);await auth.complete(req.body.token,req.body.password);return res.code(204).send();
  });
  // Pantalla exclusiva de recepción: GET/escáneres no consumen enlaces; fragmento borrado antes de otra petición.
  server.get('/acceso',async(_req,res)=>res.type('text/html').header('content-security-policy',"default-src 'none'; script-src 'self'; connect-src 'self'; form-action 'none'; frame-ancestors 'none'").send(`<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Completar acceso</title><h1>Completar acceso</h1><form><label>Nueva contraseña (12–128 caracteres)<input type="password" minlength="12" maxlength="128" autocomplete="new-password" required></label><button>Confirmar nueva contraseña</button></form><p role="status"></p><script src="/acceso.js"></script></html>`));
  server.get('/acceso.js',async(_req,res)=>res.type('application/javascript').send(`const token=new URLSearchParams(location.hash.slice(1)).get('token');history.replaceState(null,'','/acceso');document.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const p=document.querySelector('p');try{const r=await fetch('/api/v1/acceso/completar',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,password:document.querySelector('input').value})});p.textContent=r.ok?'Contraseña actualizada. Inicia sesión de nuevo.':'No se pudo completar el acceso. Solicita un enlace nuevo o contacta al responsable.';}catch{p.textContent='Servicio no disponible.'}document.querySelector('input').value='';});`));
  return server;
}
