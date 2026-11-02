import type { Pool } from "pg";
import { assertDatabaseRole } from "../security/postgres.js";
import type { MailPort, MailResult, Notice } from "./ports.js";
import { template } from "./mail.js";

export class NotificationWorker {
  constructor(
    private pool: Pool,
    private mail: MailPort,
    private origin: string,
  ) {}
  async tick() {
    await assertDatabaseRole(this.pool, "inventario_worker");
    const job = (
      await this.pool.query("select inventario.reclamar_aviso() job")
    ).rows[0].job as {
      id: string;
      token: string;
      destinatario: string;
      contenido: Notice;
    } | null;
    if (!job) return false;
    let result: MailResult;
    try {
      result = await this.mail.send({
        to: job.destinatario,
        correlation: "aviso-" + job.id,
        ...template(job.contenido, this.origin),
      });
    } catch {
      result = { result: "incierto" };
    }
    // Si falla este commit, el arrendamiento vence a incierto. Nunca reenviar aquí.
    await this.pool.query("select inventario.finalizar_aviso($1,$2,$3,$4)", [
      job.id,
      job.token,
      result.result,
      result.result === "aceptado" ? result.providerRef : null,
    ]);
    return true;
  }
}
