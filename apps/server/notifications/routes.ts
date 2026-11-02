import type { FastifyInstance, FastifyRequest } from "fastify";
import type { Authorization } from "../security/postgres.js";
import { AuthError } from "../auth/service.js";
const uuid = {
  type: "string",
  pattern:
    "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$",
};
const states = [
  "pendiente",
  "procesando",
  "aceptado",
  "entregado",
  "fallido",
  "incierto",
  "cancelado",
];
const columns =
  "id,auditoria_id,destinatario,proposito,estado,siguiente_en,arrendamiento_hasta,proveedor_ref,ultimo_error_codigo,creado_en,version,intentos,ciclo_intentos";
const params = {
  type: "object",
  additionalProperties: false,
  required: ["ref"],
  properties: { ref: uuid },
};
export function notificationRoutes(
  server: FastifyInstance,
  security: Authorization,
  sid: (r: FastifyRequest) => string,
  csrf: (r: FastifyRequest) => string,
) {
  server.get<{ Querystring: { estado?: string; cursor?: string } }>(
    "/api/v1/avisos",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          properties: { estado: { enum: states }, cursor: uuid },
        },
      },
    },
    async (req) =>
      security.run(sid(req), "auditoria.consultar", async (db) => {
        const rows = (
          await db.query(
            `select ${columns} from inventario.outbox where ($1::text is null or estado=$1) and ($2::uuid is null or id>$2) order by id limit 51`,
            [req.query.estado ?? null, req.query.cursor ?? null],
          )
        ).rows;
        const more = rows.length > 50;
        if (more) rows.pop();
        return {
          items: rows,
          nextCursor: more ? rows.at(-1).id : null,
          timezone: "UTC",
        };
      }),
  );
  server.get<{ Params: { ref: string } }>(
    "/api/v1/avisos/:ref",
    { schema: { params } },
    async (req) =>
      security.run(sid(req), "auditoria.consultar", async (db) => {
        const row = (
          await db.query(
            `select ${columns} from inventario.outbox where id=$1`,
            [req.params.ref],
          )
        ).rows[0];
        if (!row) throw new AuthError(404, "NOT_FOUND");
        const attempts = (
          await db.query(
            "select numero,resultado,codigo,registrado_en from inventario.intentos_aviso where outbox_id=$1 order by numero",
            [req.params.ref],
          )
        ).rows;
        return { ...row, attempts, timezone: "UTC" };
      }),
  );
  server.post<{ Params: { ref: string }; Body: Record<string, unknown> }>(
    "/api/v1/avisos/:ref/acciones",
    {
      schema: {
        params,
        headers: {
          type: "object",
          required: ["idempotency-key"],
          properties: {
            "idempotency-key": uuid,
            "if-match": { type: "string", pattern: '^"v[1-9][0-9]{0,14}"$' },
          },
        },
        body: {
          type: "object",
          additionalProperties: false,
          required: ["accion", "motivo", "confirmado"],
          properties: {
            accion: { enum: ["cancelar", "reintentar", "conciliar"] },
            motivo: {
              type: "string",
              minLength: 1,
              maxLength: 2000,
              pattern: "\\S",
            },
            confirmado: { const: true },
            resultado: {
              enum: ["aceptado", "entregado", "no_enviado", "permanente"],
            },
            evidencia: {
              type: "string",
              minLength: 1,
              maxLength: 2000,
              pattern: "\\S",
            },
          },
        },
      },
    },
    async (req, res) => {
      try {
        const result = await security.run(
          sid(req),
          "configuracion.administrar",
          async (db) =>
            (
              await db.query(
                "select inventario.accion_aviso($1,$2,$3,$4) result",
                [
                  req.params.ref,
                  req.headers["idempotency-key"],
                  (req.headers["if-match"] as string | undefined)?.slice(
                    2,
                    -1,
                  ) ?? null,
                  req.body,
                ],
              )
            ).rows[0].result,
          csrf(req),
        );
        return res.header("etag", '"v' + result.version + '"').send(result);
      } catch (e) {
        const code = (e as Error).message;
        const statuses: Record<string, number> = {
          FORBIDDEN: 403,
          NOT_FOUND: 404,
          VERSION_REQUIRED: 428,
          VERSION_MISMATCH: 412,
          IDEMPOTENCY_MISMATCH: 409,
          BUSINESS_RULE: 422,
          INVALID_REQUEST: 400,
        };
        if (statuses[code]) throw new AuthError(statuses[code], code);
        throw e;
      }
    },
  );
}
