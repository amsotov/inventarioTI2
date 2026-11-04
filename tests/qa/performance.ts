// Ensayo explícito, solo fixture efímero propio. No acepta DSN ni proveedor externos.
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import os from "node:os";
import { fixture, IdentityDouble, admin } from "../helpers/reports.js";
import type { Tokens } from "../../apps/server/auth/ports.js";
import { NotificationWorker } from "../../apps/server/notifications/worker.js";

const output = "docs/evidencias/fase13";
mkdirSync(output, {recursive:true});
const users = Array.from({length:22}, (_,i)=>({id:randomUUID(),email:`qa${i}@example.invalid`,role:i<5?"administrador":"lectura"}));
class LoadIdentity extends IdentityDouble {
  override async login(email:string) {
    const u=users.find(u=>u.email===email);
    return u ? {userId:u.id,access_token:u.id,refresh_token:"synthetic",aal:"aal1" as const} : super.login(email);
  }
  override async verify(tokens?:Tokens) {
    const id=tokens?.access_token.slice(0,36)??admin;
    return {userId:id,access_token:id+"-mfa",refresh_token:"synthetic",aal:"aal2" as const};
  }
}
type Sample = {kind:string;ms:number;status:number};
const samples:Sample[]=[], attempted=new Map<string,number>();
const stats=(items:Sample[])=>{
  const values=items.map(v=>v.ms).sort((a,b)=>a-b);
  const quant=(q:number)=>values[Math.max(0,Math.ceil(values.length*q)-1)]??null;
  return {count:values.length,p50:quant(.5),p95:quant(.95),p99:quant(.99),max:values.at(-1)??null,statuses:items.reduce((a,v)=>(a[v.status]=(a[v.status]??0)+1,a),{} as Record<string,number>)};
};
const started=new Date().toISOString();
const base=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
// Se reserva puerto loopback efímero antes de construir el origen exacto.
const {createServer}=await import("node:net");
const reserve=createServer(); await new Promise<void>(r=>reserve.listen(0,"127.0.0.1",r));
const port=(reserve.address() as {port:number}).port;
await new Promise<void>((r,j)=>reserve.close(e=>e?j(e):r()));
const origin=`http://127.0.0.1:${port}`;
const x=await fixture(origin,undefined,{provider:new LoadIdentity(),poolMax:3});
let stop=false, polling:Promise<void>|undefined;
try {
  const {root}=x;
  // Solo preparación SQL de la muestra grande; las peticiones conservan 15 s.
  await root.query("set statement_timeout=120000");
  for(const u of users) await root.query("insert into inventario.cuentas(id,proveedor_ref,nombre,correo,rol,estado,credencial_lista) values($1,$1,'QA sintética',$2,$3,'activa',true)",[u.id,u.email,u.role]);
  await root.query("insert into inventario.funcionarios(documento_tipo,documento,nombre,cargo,unidad_id,activo) select 'ID','QA-'||n,'Funcionario QA '||n,'Analista',$1,n%10<>0 from generate_series(1,498)n",[x.units[1].id]);
  await root.query("insert into inventario.bienes(codigo,serie,tipo,marca,modelo,condicion,situacion,adquisicion) select 'QA-'||lpad(n::text,5,'0'),'QA-SERIE-'||n,'Notebook','Marca QA','Modelo QA','bueno','activo','2026-10-01' from generate_series(1,2968)n");
  // Historia coherente de cambios alternados; sin deshabilitar triggers/RLS/controles.
  await root.query(`create temp table qa_seed as
    with goods as (select id,row_number() over(order by id) rn from inventario.bienes),
    rows as (select n,g.id bien_id,row_number() over(partition by g.id order by n) step
    from generate_series(1,99999)n join goods g on g.rn=((n-1)%3000)+1)
    select *,gen_random_uuid() cmd,case when step%2=1 then 'bueno' else 'regular' end anterior,
    case when step%2=1 then 'regular' else 'bueno' end nueva from rows;
    insert into inventario.comandos(id,actor_id,operacion,recurso,clave,huella,resultado)
      select cmd,'${admin}','qa_seed',bien_id::text,cmd,repeat('a',64),'{}' from qa_seed;
    insert into inventario.movimientos(bien_id,tipo,condicion_anterior,condicion_nueva,actor_id,comando_id,motivo)
      select bien_id,'condicion',anterior,nueva,'${admin}',cmd,'Carga sintética QA' from qa_seed order by n;
    update inventario.bienes b set condicion=q.nueva from
      (select distinct on(bien_id) bien_id,nueva from qa_seed order by bien_id,n desc)q where q.bien_id=b.id;
    insert into inventario.auditoria(actor_id,comando_id,entidad,entidad_ref,accion,anterior,nuevo,motivo)
      select '${admin}',cmd,'bien',bien_id::text,case when n<=10000 then 'qa_xlsx' when n<=12000 then 'qa_pdf' else 'condicion' end,
      jsonb_build_object('condicion',anterior),jsonb_build_object('condicion',nueva),'Carga sintética QA'
      from qa_seed where n<=100000-(select count(*) from inventario.auditoria);
    analyze inventario.bienes; analyze inventario.funcionarios; analyze inventario.movimientos; analyze inventario.auditoria; analyze inventario.comandos;`);
  const counts=async()=>(await root.query(`select (select count(*)::int from inventario.bienes) bienes,(select count(*)::int from inventario.funcionarios) funcionarios,(select count(*)::int from inventario.cuentas) cuentas,(select count(*)::int from inventario.movimientos) movimientos,(select count(*)::int from inventario.auditoria) auditorias,(select count(*)::int from inventario.comandos) comandos,(select count(*)::int from inventario.outbox) avisos`)).rows[0];
  const before=await counts();
  await root.query("set statement_timeout=15000");
  assert.deepEqual([before.bienes,before.funcionarios,before.cuentas,before.movimientos,before.auditorias],[3000,500,25,100000,100000]);
  const sessions:{sid:string;csrf:string}[]=[];
  for(const u of users.slice(0,10)) {
    const s=await x.auth.login(u.email,"synthetic");
    sessions.push(u.role==="administrador"?await x.auth.verify(s.sid,s.csrf,"factor","123456"):s);
  }
  const targets=(await root.query("select id,condicion,version from inventario.bienes where codigo like 'QA-%' order by codigo limit 200")).rows;
  await x.server.listen({host:"127.0.0.1",port});
  async function request(index:number,path:string,body?:object,version?:string,key?:string) {
    const start=performance.now();
    const response=await fetch(origin+"/api/v1/"+path,{method:body?"POST":"GET",headers:{...x.headers(sessions[index]),...(body?{"content-type":"application/json"}:{}),...(version?{"if-match":`"v${version}"`}:{}),...(key?{"idempotency-key":key}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(90000)});
    const bytes=Buffer.from(await response.arrayBuffer());
    return {ms:performance.now()-start,status:response.status,bytes,json:()=>JSON.parse(bytes.toString())};
  }
  const paths=["bienes?limit=50","bienes?q=QA-00&limit=50","bienes?condicion=bueno&limit=50","funcionarios?limit=50","funcionarios?q=QA&limit=50","reportes/inventario?limit=50","buscar?q=Modelo&limit=50","reportes/movimientos?limit=50&bien_id="+x.b.id,"reportes/por-condicion?limit=50","bienes/"+x.b.id];
  // Calentamiento fuera de las 1.000 muestras medidas, con los mismos controles.
  for(let i=0;i<100;i++) assert.equal((await request(i%10,paths[i%10])).status,200);
  const worker=new NotificationWorker(x.workerPool,{async send(message){attempted.set(message.correlation.slice(6),Date.now());return {result:"aceptado",providerRef:"synthetic-"+randomUUID()};}},"https://inventario.test");
  polling=(async()=>{while(!stop){while(!stop&&await worker.tick()){} if(!stop) await new Promise(r=>setTimeout(r,1000));}})();
  const measurementStart=performance.now();
  await Promise.all(sessions.map(async(_,user)=>{
    for(let i=0;i<100;i++) {
      const route=(i+user)%paths.length;
      const path=route===8&&user<5?"reportes/auditoria?limit=50":paths[route];
      const res=await request(user,path);
      samples.push({kind:"read:"+(route===8&&user<5?"auditoria":String(route)),ms:res.ms,status:res.status});
      if(user<5&&i%5<2) {
        const target=targets[user*40+Math.floor(i/5)*2+i%5];
        const res=await request(user,`bienes/${target.id}/movimientos`,{tipo:"condicion",condicion:target.condicion==="bueno"?"regular":"bueno",motivo:"QA carga sintética",confirmado:true},target.version);
        samples.push({kind:"write",ms:res.ms,status:res.status});
      }
    }
  }));
  const measurementMs=performance.now()-measurementStart,after=await counts();
  const exports=[];
  for(const [format,n,action] of [["xlsx",10000,"qa_xlsx"],["pdf",2000,"qa_pdf"]] as const) {
    const begin=performance.now();
    const create=await request(0,"exportaciones",{tipo:"auditoria",formato:format,filtros:{accion:action}});
    assert.equal(create.status,202,create.bytes.toString()); assert.equal(create.json().total,n);
    const ref=create.json().ref;
    let state="pendiente";
    while(performance.now()-begin<90000) {
      const status=await request(0,"exportaciones/"+ref); assert.equal(status.status,200); state=status.json().estado;
      if(!["pendiente","procesando"].includes(state))break;
      await new Promise(r=>setTimeout(r,100));
    }
    assert.equal(state,"listo");
    const download=await request(0,"exportaciones/"+ref+"/archivo");
    assert.equal(download.status,200);
    assert.equal(download.bytes.subarray(0,format==="pdf"?4:2).toString(),format==="pdf"?"%PDF":"PK");
    exports.push({format,rows:n,ms:performance.now()-begin,bytes:download.bytes.length});
  }
  stop=true; await polling;
  const notices=(await root.query("select id,creado_en,estado,intentos from inventario.outbox")).rows;
  const delays=notices.map(v=>({kind:"notice",ms:(attempted.get(v.id)??Infinity)-v.creado_en.getTime(),status:v.estado==="aceptado"?200:500}));
  // Conflictos/rechazos fuera de las escrituras válidas; nunca ocultos en percentiles.
  const target=targets[0],body={tipo:"condicion",condicion:target.condicion==="bueno"?"regular":"bueno",motivo:"QA conflicto",confirmado:true};
  const stale=await request(0,`bienes/${target.id}/movimientos`,body,target.version);
  const forbidden=await request(5,`bienes/${target.id}/movimientos`,body,target.version);
  const read=samples.filter(v=>v.kind.startsWith("read:")),writes=samples.filter(v=>v.kind==="write");
  const result={started,finished:new Date().toISOString(),base,environment:{node:process.version,platform:os.platform(),arch:os.arch(),cpu:os.cpus()[0].model,cpuQuota:readFileSync("/sys/fs/cgroup/cpu.max","utf8").trim(),memoryMax:readFileSync("/sys/fs/cgroup/memory.max","utf8").trim(),network:"HTTP TCP loopback, PostgreSQL Docker loopback; sin TLS/WAN; proveedor identidad y correo dobles inmediatos",pools:{auth:3,business:3,worker:3},users:10,roles:{administrador:5,lectura:5},warmup:100,seed:"fixtures sintéticos por SQL propietario; carga medida solo por HTTP con permisos/RLS intactos"},before,after,measurementMs,read:stats(read),write:stats(writes),byRoute:Object.fromEntries([...new Set(read.map(v=>v.kind))].map(k=>[k,stats(read.filter(v=>v.kind===k))])),routes:paths,exports,notices:stats(delays),rejections:{stale:stale.status,readerWrite:forbidden.status},samples};
  writeFileSync(output+"/rendimiento.json",JSON.stringify(result,null,2)+"\n");
  console.log(JSON.stringify({...result,samples:undefined},null,2));
  assert.equal(read.length,1000);assert.equal(writes.length,200);
  assert(samples.every(v=>v.status===200),"Fallos de carga: ver todas las muestras");
  for(const key of ["movimientos","auditorias","comandos","avisos"]) assert.equal(after[key]-before[key],200,key);
  assert(stats(read).p95!<=2000);assert(stats(writes).p95!<=3000);
  assert(exports.every(v=>v.ms<=60000));assert.equal(notices.length,attempted.size);assert(delays.every(v=>v.status===200&&v.ms<=60000));
  assert.equal(stale.status,412);assert.equal(forbidden.status,403);
} finally {stop=true;await polling;await x.close();}
