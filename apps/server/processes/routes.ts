import type { FastifyInstance } from "fastify";
import { AuthError } from "../auth/service.js";
import type { Authorization } from "../security/postgres.js";
const uuid = { type: "string", format: "uuid" },
  text = { type: "string", minLength: 1, maxLength: 2000, pattern: "\\S" },
  number = { type: "string", pattern: "^[1-9][0-9]{0,17}$" };
export function processRoutes(
  server: FastifyInstance,
  security: Authorization,
  sid: (r: any) => string,
  csrf: (r: any) => string,
) {
  const employee = {
    documento_tipo: { enum: ["RUT", "ID"] },
    documento: text,
    nombre: text,
    cargo: text,
    correo: {
      anyOf: [
        {
          type: "string",
          maxLength: 320,
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
        },
        { type: "null" },
      ],
    },
  };
  const routes = [
    [
      "POST",
      "funcionarios",
      "funcionario",
      { ...employee, unidad_id: uuid },
      ["documento_tipo", "documento", "nombre", "cargo", "unidad_id"],
    ],
    [
      "PATCH",
      "funcionarios/:ref",
      "funcionario",
      employee,
      ["documento_tipo", "documento", "nombre", "cargo"],
    ],
    [
      "POST",
      "funcionarios/:ref/pertenencias",
      "pertenencia",
      { unidad_id: uuid },
      ["unidad_id"],
    ],
    [
      "POST",
      "funcionarios/:ref/estado",
      "estado",
      { activo: { type: "boolean" } },
      ["activo"],
    ],
    [
      "POST",
      "bienes/:ref/movimientos",
      "movimiento",
      {
        tipo: {
          enum: [
            "asignacion",
            "devolucion",
            "traslado",
            "condicion",
            "baja",
            "reactivacion",
          ],
        },
        destino: uuid,
        origenEsperado: uuid,
        condicion: { enum: ["bueno", "regular", "malo"] },
        corrige_id: number,
      },
      ["tipo"],
    ],
    [
      "POST",
      "movimientos/:ref/anotaciones",
      "anotacion",
      { texto: text },
      ["texto"],
    ],
  ] as const;
  for (const [method, path, op, props, required] of routes) {
    server.route<{ Params: { ref?: string }; Body: Record<string, unknown> }>({
      method,
      url: "/api/v1/" + path,
      schema: {
        headers: {
          type: "object",
          required: ["idempotency-key"],
          properties: {
            "idempotency-key": uuid,
            "if-match": { type: "string", pattern: '^"v[1-9][0-9]{0,14}"$' },
          },
        },
        ...(path.includes(":ref")
          ? {
              params: {
                type: "object",
                required: ["ref"],
                properties: { ref: op === "anotacion" ? number : uuid },
              },
            }
          : {}),
        body: {
          type: "object",
          additionalProperties: false,
          required: [...required, "motivo", "confirmado"],
          properties: { ...props, motivo: text, confirmado: { const: true } },
        },
      },
      handler: async (req, res) => {
        try {
          const result = await security.run(
            sid(req),
            "inventario.modificar",
            async (db) =>
              (
                await db.query(
                  "select inventario.procesar($1,$2,$3,$4,$5) result",
                  [
                    op,
                    req.params.ref ?? null,
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
          return res
            .code(path === "funcionarios" ? 201 : 200)
            .header("etag", `"v${result.version}"`)
            .send(result);
        } catch (e) {
          const err = e as { message: string; code?: string };
          const errors: Record<string, number> = {
            FORBIDDEN: 403,
            NOT_FOUND: 404,
            VERSION_REQUIRED: 428,
            VERSION_MISMATCH: 412,
            IDEMPOTENCY_MISMATCH: 409,
            BUSINESS_RULE: 422,
            INVALID_REQUEST: 400,
            NOTIFICATION_NOT_CONFIGURED: 503,
          };
          if (errors[err.message])
            throw new AuthError(errors[err.message], err.message);
          if (err.code === "23505")
            throw new AuthError(409, "DUPLICATE_IDENTIFIER");
          if (
            ["23514", "23502", "23503", "22P02", "22003"].includes(
              err.code ?? "",
            )
          )
            throw new AuthError(422, "BUSINESS_RULE");
          throw e;
        }
      },
    });
  }
  // Documento/correo exclusivamente para edición administrativa, fuera de proyecciones compartidas.
  server.get<{ Params: { ref: string } }>(
    "/api/v1/funcionarios/:ref/edicion",
    {
      schema: {
        params: {
          type: "object",
          required: ["ref"],
          properties: { ref: uuid },
        },
      },
    },
    (req) =>
      security.run(sid(req), "auditoria.consultar", async (db) => {
        const row = (
          await db.query(
            "select id,documento_tipo,documento,nombre,cargo,correo,unidad_id,activo,version from inventario.funcionarios where id=$1",
            [req.params.ref],
          )
        ).rows[0];
        if (!row) throw new AuthError(404, "NOT_FOUND");
        return row;
      }),
  );
  server.get<{
    Params: { resource: string; ref: string };
    Querystring: {
      custodias?: string;
      movimientos?: string;
      pertenencias?: string;
      anotaciones?: string;
    };
  }>(
    "/api/v1/:resource/:ref/historia",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          properties: {
            custodias: uuid,
            movimientos: number,
            pertenencias: number,
            anotaciones: number,
          },
        },
        params: {
          type: "object",
          required: ["resource", "ref"],
          properties: {
            resource: { enum: ["bienes", "funcionarios"] },
            ref: uuid,
          },
        },
      },
    },
    (req) =>
      security.run(sid(req), "historial.consultar", async (db) => {
        const { resource, ref } = req.params;
        const exists = (
          await db.query(
            `select id from inventario.${resource === "bienes" ? "bienes" : "funcionarios"} where id=$1`,
            [ref],
          )
        ).rowCount;
        if (!exists) throw new AuthError(404, "NOT_FOUND");
        const custodias = (
          await db.query(
            `select c.id,c.bien_id,c.funcionario_id,c.inicio_en,c.fin_en,f.nombre,f.unidad_id,u.nombre unidad_actual from inventario.custodias c join inventario.funcionarios f on f.id=c.funcionario_id join inventario.unidades u on u.id=f.unidad_id where c.${resource === "bienes" ? "bien_id" : "funcionario_id"}=$1 and ($2::uuid is null or c.id>$2) order by c.id limit 101`,
            [ref, req.query.custodias ?? null],
          )
        ).rows;
        const movimientos = (
          await db.query(
            `select id,bien_id,tipo,origen_id,destino_id,unidad_origen_nombre,unidad_destino_nombre,condicion_anterior,condicion_nueva,corrige_id,efectiva_en,registrada_en from inventario.movimientos where ${resource === "bienes" ? "bien_id=$1" : "(origen_id=$1 or destino_id=$1)"} and id>coalesce($2::bigint,0) order by id limit 101`,
            [ref, req.query.movimientos ?? null],
          )
        ).rows;
        const pertenencias =
          resource === "funcionarios"
            ? (
                await db.query(
                  "select id,unidad_id,unidad_nombre,efectiva_en,registrada_en from inventario.pertenencias where funcionario_id=$1 and id>coalesce($2::bigint,0) order by id limit 101",
                  [ref, req.query.pertenencias ?? null],
                )
              ).rows
            : [];
        const anotaciones = (
          await db.query(
            `select a.id,a.movimiento_id,a.texto,a.motivo,a.registrada_en from inventario.anotaciones a join inventario.movimientos m on m.id=a.movimiento_id where ${resource === "bienes" ? "m.bien_id=$1" : "(m.origen_id=$1 or m.destino_id=$1)"} and a.id>coalesce($2::bigint,0) order by a.id limit 101`,
            [ref, req.query.anotaciones ?? null],
          )
        ).rows;
        const next: Record<string, string | null> = {};
        for (const [k, rows] of Object.entries({
          custodias,
          movimientos,
          pertenencias,
          anotaciones,
        })) {
          const more = rows.length > 100;
          if (more) rows.pop();
          next[k] = more ? String(rows.at(-1).id) : null;
        }
        const vigentes = (
          await db.query(
            `select bien_id,funcionario_id from inventario.custodias where ${resource === "bienes" ? "bien_id" : "funcionario_id"}=$1 and fin_en is null`,
            [ref],
          )
        ).rows;
        return {
          custodias,
          movimientos,
          pertenencias,
          anotaciones,
          vigentes,
          next,
          timezone: "UTC",
        };
      }),
  );
}
