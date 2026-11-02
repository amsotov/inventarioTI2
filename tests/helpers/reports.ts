import { execFileSync } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { Pool } from "pg";
import { AuthService } from "../../apps/server/auth/service.js";
import { Postgres } from "../../apps/server/auth/postgres.js";
import { Vault } from "../../apps/server/auth/crypto.js";
import { Authorization } from "../../apps/server/security/postgres.js";
import { Inventory } from "../../apps/server/inventory/service.js";
import { app } from "../../apps/server/app.js";
import type { Provider, Tokens } from "../../apps/server/auth/ports.js";
export const reader = "10000000-0000-4000-8000-000000000001",
  admin = "10000000-0000-4000-8000-000000000002",
  other = "10000000-0000-4000-8000-000000000003";
export class IdentityDouble implements Provider {
  async login(email: string) {
    const userId = email.startsWith("admin")
      ? admin
      : email.startsWith("other")
        ? other
        : reader;
    return {
      userId,
      access_token: userId,
      refresh_token: "synthetic",
      aal: "aal1" as const,
    };
  }
  async validate(t: Tokens) {
    return {
      ...t,
      userId: t.access_token.slice(0, 36),
      aal: t.access_token.endsWith("-mfa")
        ? ("aal2" as const)
        : ("aal1" as const),
    };
  }
  async verify() {
    return {
      userId: admin,
      access_token: admin + "-mfa",
      refresh_token: "synthetic",
      aal: "aal2" as const,
    };
  }
  async factors() {
    return [];
  }
  async enroll() {
    return { id: "factor", qr: "qr", secret: "secret" };
  }
  async link() {
    return { userId: reader, hash: "synthetic" };
  }
  async complete() {
    return reader;
  }
  async logout() {}
}
export async function fixture(
  origin = "https://inventario.test",
  webRoot?: string,
  options: { provider?: Provider; poolMax?: number } = {},
) {
  const name = "inventario-reports-" + randomUUID(),
    password = randomBytes(24).toString("hex");
  const docker = (...args: string[]) =>
    execFileSync("docker", args, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  docker(
    "run",
    "-d",
    "--name",
    name,
    "-e",
    "POSTGRES_PASSWORD=" + password,
    "-p",
    "127.0.0.1::5432",
    "postgres:17@sha256:31ba9c94a03ada9988f2bb493a22a75eef3a185884533e5cdbcd498ea835b08f",
  );
  const cfg = {
    host: "127.0.0.1",
    port: Number(docker("port", name, "5432/tcp").split(":").at(-1)),
    password,
    database: "postgres",
    max: options.poolMax ?? 3,
    connectionTimeoutMillis: 5000,
    statement_timeout: 15000,
  };
  const root = new Pool({ ...cfg, user: "postgres" }),
    authPool = new Pool({ ...cfg, user: "inventario_auth" }),
    business = new Pool({ ...cfg, user: "inventario_runtime" }),
    workerPool = new Pool({ ...cfg, user: "inventario_worker" });
  let server: ReturnType<typeof app> | undefined;
  const close = async () => {
    await server?.close();
    await Promise.all([root.end(), authPool.end(), business.end(), workerPool.end()]);
    docker("rm", "-f", "-v", name);
  };
  try {
    for (let i = 0; i < 100; i++) {
      try {
        await root.query("select 1");
        break;
      } catch (e) {
        if (i === 99) throw e;
        await new Promise((r) => setTimeout(r, 100));
      }
    }
    await root.query("create role anon;create role authenticated;");
    for (const file of readdirSync("supabase/migrations").sort())
      await root.query(readFileSync("supabase/migrations/" + file, "utf8"));
    await root.query(
      `alter role inventario_auth login password '${password}';alter role inventario_runtime login password '${password}';alter role inventario_worker login password '${password}'`,
    );
    await root.query(
      `insert into inventario.cuentas(id,proveedor_ref,nombre,correo,rol,estado,credencial_lista) values($1,$1,'Lectura','reader@example.invalid','lectura','activa',true),($2,$2,'Admin sintético','admin@example.invalid','administrador','activa',true),($3,$3,'Otro lector','other@example.invalid','lectura','activa',true)`,
      [reader, admin, other],
    );
    await root.query(
      "insert into inventario.configuracion_avisos(destinatario) values('encargado@example.invalid')",
    );
    const units = (
      await root.query(
        "insert into inventario.unidades(nombre) values('Unidad histórica'),('Unidad actual') returning id,nombre",
      )
    ).rows;
    const auth = new AuthService(
        new Postgres(authPool),
        options.provider ?? new IdentityDouble(),
        new Vault(randomBytes(32).toString("base64")),
        origin,
      ),
      security = new Authorization(auth, business);
    const r = await auth.login("reader@example.invalid", "synthetic"),
      o = await auth.login("other@example.invalid", "synthetic"),
      partial = await auth.login("admin@example.invalid", "synthetic"),
      a = await auth.verify(partial.sid, partial.csrf, "factor", "123456");
    server = app(auth, origin, new Inventory(security), webRoot, security);
    const headers = (s: { sid: string; csrf: string } = r) => ({
      cookie: "__Host-inventario=" + s.sid,
      origin,
      "x-csrf-token": s.csrf,
      "idempotency-key": randomUUID(),
    });
    const command = async (path: string, body: object, version?: string) => {
      const response = await server!.inject({
        method: "POST",
        url: "/api/v1/" + path,
        headers: {
          ...headers(a),
          ...(version ? { "if-match": `"v${version}"` } : {}),
        },
        payload: {
          motivo: "Ensayo sintético de reporte",
          confirmado: true,
          ...body,
        },
      });
      if (response.statusCode >= 300) throw Error(response.body);
      return response.json();
    };
    const f = await command("funcionarios", {
      documento_tipo: "ID",
      documento: "ID-PRIVADO",
      correo: "personal@example.invalid",
      nombre: "Ángela Sintética",
      cargo: "Analista",
      unidad_id: units[0].id,
    });
    await root.query(
      "insert into inventario.funcionarios(documento_tipo,documento,nombre,cargo,unidad_id,activo,alta_en) values('ID','ID-OCULTO','=HYPERLINK(\"https://example.invalid\",\"Prueba\")','Cargo sintético',$1,false,'2026-10-01T00:00:00Z')",
      [units[0].id],
    );
    await root.query(`insert into inventario.bienes(codigo,serie,motivo_sin_serie,tipo,marca,modelo,condicion,situacion,adquisicion,observaciones)
   select 'TI-'||lpad(n::text,4,'0'),null,'Sin serie sintética','Notebook','Marca sintética',case when n=2 then '=2+2' else 'Modelo' end,
    case when n%3=0 then 'malo' when n%3=1 then 'bueno' else 'regular' end,case when n=5 then 'baja' else 'activo' end,
    case when n=3 then null else '2026-10-01'::date end,'OBSERVACION-PRIVADA' from generate_series(1,32)n`);
    const b = (
      await root.query(
        "select id,version from inventario.bienes where codigo='TI-0001'",
      )
    ).rows[0];
    await command(
      "bienes/" + b.id + "/movimientos",
      { tipo: "asignacion", destino: f.ref },
      b.version,
    );
    await command(
      "funcionarios/" + f.ref + "/pertenencias",
      { unidad_id: units[1].id },
      f.version,
    );
    await root.query(
      "update inventario.unidades set nombre='Nombre actual diferente' where id=$1",
      [units[0].id],
    );
    return {
      containerName: name,
      root,
      authPool,
      business,
      workerPool,
      auth,
      security,
      server,
      r,
      o,
      a,
      partial,
      units,
      f,
      b,
      headers,
      close,
    };
  } catch (e) {
    await close();
    throw e;
  }
}
