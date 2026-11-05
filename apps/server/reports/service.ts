import { randomUUID } from "node:crypto";
import { Worker } from "node:worker_threads";
import type { PoolClient } from "pg";
import { AuthError } from "../auth/service.js";
import type { Authorization } from "../security/postgres.js";
import { requirePermission } from "../security/policy.js";
import {
  fingerprint,
  normalize,
  selectReport,
  type ReportType,
  type Report,
} from "./selection.js";

export function renderFile(
  report: Report,
  format: "xlsx" | "pdf",
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./renderer.mjs", import.meta.url), {
      workerData: { report, format },
      resourceLimits: { maxOldGenerationSizeMb: 256 },
    });
    let settled = false;
    const finish = (error: Error | null, bytes?: Buffer) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      void worker.terminate();
      if (error) reject(error);
      else resolve(bytes!);
    };
    const timer = setTimeout(() => finish(new Error("EXPORT_TIMEOUT")), 60000);
    worker.once("message", (value: { error?: boolean; bytes?: Uint8Array }) => {
      if (value.error || !value.bytes || value.bytes.byteLength > 52428800)
        finish(new Error("EXPORT_FAILED"));
      else finish(null, Buffer.from(value.bytes));
    });
    worker.once("error", () => finish(new Error("EXPORT_FAILED")));
    worker.once("exit", () => {
      if (!settled) finish(new Error("EXPORT_FAILED"));
    });
  });
}
const metadata = (r: Record<string, any>) => ({
  ref: r.id,
  tipo: r.tipo,
  formato: r.formato,
  estado: r.estado,
  total: r.total,
  generatedAt: r.generado_en,
  expiresAt: r.vence_en,
  error: r.error ?? null,
});
type Job = { ref: string; sid: string };
export class Reports {
  private queue: Job[] = [];
  private scheduled = new Set<string>();
  private running: Promise<void> | null = null;
  private closing = false;
  constructor(
    private security: Authorization,
    private render = renderFile,
  ) {}
  list(
    sid: string,
    type: ReportType,
    filters: Record<string, unknown>,
    limit = 25,
    cursor?: string,
  ) {
    const f = normalize(type, filters);
    return this.security.run(
      sid,
      type === "auditoria"
        ? "auditoria.consultar"
        : type === "movimientos"
          ? "historial.consultar"
          : "inventario.consultar",
      (db) => selectReport(db, type, f, { limit, cursor }),
      undefined,
      true,
    );
  }
  summary(sid: string) {
    return this.security.run(
      sid,
      "inventario.consultar",
      async (db) => {
        const counts = (
          await db.query(`select count(*)::int registrados,count(*) filter(where c.id is not null)::int asignados,
   count(*) filter(where c.id is null and b.situacion='activo' and b.condicion in ('bueno','regular'))::int disponibles,
   count(*) filter(where c.id is not null and b.condicion='malo')::int malos_asignados,
   count(*) filter(where b.condicion='bueno')::int bueno,count(*) filter(where b.condicion='regular')::int regular,count(*) filter(where b.condicion='malo')::int malo
   from inventario.bienes b left join inventario.custodias c on c.bien_id=b.id and c.fin_en is null`)
        ).rows[0];
        const funcionarios = (
          await db.query(
            "select count(*)::int n from inventario.funcionarios where activo",
          )
        ).rows[0].n;
        const recent = (
          await db.query(
            "select m.id referencia,b.codigo,m.tipo,m.efectiva_en from inventario.movimientos m join inventario.bienes b on b.id=m.bien_id order by m.efectiva_en desc,m.id desc limit 5",
          )
        ).rows;
        return {
          metrics: { ...counts, funcionarios_activos: funcionarios },
          recent,
          timezone: "UTC",
          generatedAt: (
            await db.query("select transaction_timestamp() t")
          ).rows[0].t.toISOString(),
        };
      },
      undefined,
      true,
    );
  }
  private async expire(db: PoolClient) {
    // Solo artefactos técnicos del solicitante visible por RLS; nunca historia/comandos.
    await db.query(
      "update inventario.exportaciones set estado='caducado',archivo=null,instantanea=null where vence_en<=clock_timestamp() and estado<>'caducado'",
    );
  }
  async create(
    sid: string,
    csrf: string,
    key: string,
    type: ReportType,
    format: "xlsx" | "pdf",
    filters: Record<string, unknown>,
  ) {
    const f = normalize(type, filters),
      hash = fingerprint([type, format, f]);
    const result = await this.security.run(
      sid,
      type === "auditoria" ? "auditoria.exportar" : "reportes.exportar",
      async (db) => {
        await this.expire(db);
        const old = (
          await db.query(
            "select id,tipo,formato,estado,total,generado_en,vence_en,error,huella from inventario.exportaciones where clave=$1",
            [key],
          )
        ).rows[0];
        if (old) {
          if (old.huella !== hash)
            throw new AuthError(409, "IDEMPOTENCY_MISMATCH");
          return metadata(old);
        }
        const n = (
          await db.query(
            "select count(*)::int n from inventario.exportaciones where creado_en>clock_timestamp()-interval '1 hour'",
          )
        ).rows[0].n;
        if (n >= 20 || this.scheduled.size >= 16)
          throw new AuthError(429, "EXPORT_BUSY");
        const report = await selectReport(
          db,
          type,
          f,
          null,
          format === "xlsx" ? 10000 : 2000,
        );
        if (Buffer.byteLength(JSON.stringify(report)) > 33554432)
          throw new AuthError(422, "EXPORT_SIZE");
        const row = (
          await db.query(
            `insert into inventario.exportaciones(solicitante,clave,huella,tipo,formato,filtros,total,instantanea,generado_en)
    values((select actor_id from seguridad.principal()),$1,$2,$3,$4,$5,$6,$7,$8)
    returning id,tipo,formato,estado,total,generado_en,vence_en,error`,
            [
              key,
              hash,
              type,
              format,
              f,
              report.total,
              report,
              report.generatedAt,
            ],
          )
        ).rows[0];
        return metadata(row);
      },
      csrf,
      true,
    );
    this.kick(sid, result.ref);
    return result;
  }
  private async withJob<T>(
    sid: string,
    id: string,
    fn: (db: PoolClient, row: Record<string, any>) => Promise<T>,
  ) {
    return this.security.run(sid, "reportes.exportar", async (db) => {
      await this.expire(db);
      const row = (
        await db.query(
          "select id,tipo,formato,estado,total,generado_en,vence_en,error from inventario.exportaciones where id=$1",
          [id],
        )
      ).rows[0];
      if (!row) throw new AuthError(404, "NOT_FOUND");
      if (row.tipo === "auditoria") {
        const p = (await db.query("select * from seguridad.principal()"))
          .rows[0];
        requirePermission(p.rol, "auditoria.exportar");
        await db.query(
          "insert into seguridad.eventos(actor_id,permiso,permitido) values($1,'auditoria.exportar',true)",
          [p.actor_id],
        );
      }
      return fn(db, row);
    });
  }
  async status(sid: string, id: string) {
    const result = await this.withJob(sid, id, async (_db, row) =>
      metadata(row),
    );
    if (["pendiente", "procesando"].includes(result.estado)) this.kick(sid, id);
    return result;
  }
  download(sid: string, id: string) {
    return this.withJob(sid, id, async (db, row) => {
      if (row.estado === "caducado") throw new AuthError(410, "EXPORT_EXPIRED");
      if (row.estado !== "listo") throw new AuthError(409, "EXPORT_NOT_READY");
      const content = (
        await db.query(
          "select archivo from inventario.exportaciones where id=$1 and vence_en>clock_timestamp()",
          [id],
        )
      ).rows[0];
      if (!content) throw new AuthError(410, "EXPORT_EXPIRED");
      return {
        bytes: content.archivo as Buffer,
        format: row.formato as "xlsx" | "pdf",
      };
    });
  }
  private kick(sid: string, ref: string) {
    if (this.closing || this.scheduled.has(ref) || this.scheduled.size >= 16)
      return;
    this.scheduled.add(ref);
    this.queue.push({ sid, ref });
    if (!this.running) {
      this.running = Promise.resolve()
        .then(async () => {
          while (this.queue.length) {
            const job = this.queue.shift()!;
            try {
              await this.process(job);
            } catch {
              /* No revelar errores ni persistir archivos sin permiso vigente. Arrendamiento permite recuperar. */
            } finally {
              this.scheduled.delete(job.ref);
            }
          }
        })
        .finally(() => {
          this.running = null;
        });
    }
  }
  private async process({ sid, ref }: Job) {
    const attempt = randomUUID();
    const row = await this.withJob(sid, ref, async (db, job) => {
      if (!["pendiente", "procesando"].includes(job.estado)) return null;
      return (
        (
          await db.query(
            `update inventario.exportaciones set estado='procesando',intento=$2,arrendamiento_hasta=clock_timestamp()+interval '75 seconds'
    where id=$1 and vence_en>clock_timestamp() and (estado='pendiente' or (estado='procesando' and arrendamiento_hasta<clock_timestamp())) returning instantanea,formato`,
            [ref, attempt],
          )
        ).rows[0] ?? null
      );
    });
    if (!row) return;
    let bytes: Buffer | undefined, error: string | undefined;
    try {
      bytes = await this.render(row.instantanea, row.formato);
      if (bytes.length > 52428800) throw Error("EXPORT_FAILED");
    } catch (e) {
      error =
        e instanceof Error && e.message === "EXPORT_TIMEOUT"
          ? "EXPORT_TIMEOUT"
          : "EXPORT_FAILED";
    }
    // Nueva autorización después de generar. Ningún archivo se guarda si la cuenta fue revocada.
    await this.withJob(sid, ref, async (db, job) => {
      if (job.estado !== "procesando") return;
      await db.query(
        `update inventario.exportaciones set estado=$3,archivo=$4,instantanea=null,error=$5
    where id=$1 and intento=$2 and estado='procesando' and vence_en>clock_timestamp()`,
        [
          ref,
          attempt,
          error ? "fallido" : "listo",
          bytes ?? null,
          error ?? null,
        ],
      );
    });
  }
  /** Mantiene trabajos autorizados vivos en runtimes de peticiones efímeras. */
  async whenIdle() {
    await this.running;
  }
  async close() {
    this.closing = true;
    await this.running;
  }
}
