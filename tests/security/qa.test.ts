import { test } from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../helpers/reports.js";

test("Fase 13: catálogo completo de RLS, funciones privilegiadas y roles", async (t) => {
  const x=await fixture();
  try {
    await t.test("cada tabla privada tiene RLS; Data API carece de acceso",async()=>{
      const tables=(await x.root.query(`select n.nspname schema,c.relname name,c.relrowsecurity rls,
        has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') anon,
        has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') authenticated
        from pg_class c join pg_namespace n on n.oid=c.relnamespace
        where n.nspname in ('inventario','acceso','seguridad') and c.relkind='r'`)).rows;
      assert.deepEqual(tables.map(v=>v.name).sort(),["unidades","cuentas","funcionarios","bienes","comandos","pertenencias","movimientos","custodias","anotaciones","auditoria","configuracion_avisos","outbox","intentos_aviso","sesiones","intenciones","entregas","limites","eventos","exportaciones"].sort());
      assert.deepEqual(tables.filter(v=>!v.rls||v.anon||v.authenticated),[]);
    });
    await t.test("SECURITY DEFINER privado, search_path fijo, PUBLIC/Data API sin EXECUTE y dueño mínimo",async()=>{
      const functions=(await x.root.query(`select n.nspname schema,p.proname name,p.proconfig,
        r.rolsuper,r.rolbypassrls,r.rolcanlogin,
        has_function_privilege('anon',p.oid,'EXECUTE') anon,
        has_function_privilege('authenticated',p.oid,'EXECUTE') authenticated,
        exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE') public
        from pg_proc p join pg_namespace n on n.oid=p.pronamespace join pg_roles r on r.oid=p.proowner
        where n.nspname in ('inventario','acceso','seguridad','public') and p.prosecdef`)).rows;
      assert(functions.length>=5);
      assert.deepEqual(functions.filter(v=>v.schema==='public'||v.rolsuper||v.rolbypassrls||v.rolcanlogin||v.anon||v.authenticated||v.public||!v.proconfig?.some((s:string)=>s.startsWith('search_path=pg_catalog'))),[]);
    });
    await t.test("Auth, negocio y worker no son propietarios ni miembros privilegiados",async()=>{
      const roles=(await x.root.query(`select r.rolname,r.rolsuper,r.rolbypassrls,r.rolcreatedb,r.rolcreaterole,
        exists(select 1 from pg_auth_members where member=r.oid) member,
        exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relowner=r.oid and n.nspname in ('inventario','acceso','seguridad')) owner
        from pg_roles r where r.rolname in ('inventario_auth','inventario_runtime','inventario_worker')`)).rows;
      assert.equal(roles.length,3);
      assert.deepEqual(roles.filter(r=>r.rolsuper||r.rolbypassrls||r.rolcreatedb||r.rolcreaterole||r.member||r.owner),[]);
    });
  } finally {await x.close();}
});
