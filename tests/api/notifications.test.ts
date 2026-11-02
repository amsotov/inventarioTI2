import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, admin } from "../helpers/reports.js";
import { NotificationWorker } from "../../apps/server/notifications/worker.js";
import { ResendMail, template } from "../../apps/server/notifications/mail.js";
import { assertDatabaseRole } from "../../apps/server/security/postgres.js";
import type {
  MailPort,
  MailResult,
} from "../../apps/server/notifications/ports.js";

test("Fase 12: contrato del adaptador HTTP, sin conexión ni correo externo", async () => {
  const sent: Parameters<MailPort["send"]>[0] = {
    to: "synthetic@example.invalid",
    subject: "Sintético",
    text: "Solo ensayo",
    correlation: "aviso-" + randomUUID(),
  };
  let payload: any, headers: any;
  const request: typeof fetch = async (_url, init) => {
    payload = JSON.parse(String(init?.body));
    headers = init?.headers;
    return Response.json({ id: "provider-synthetic" });
  };
  const mail = new ResendMail(
    "secret-synthetic",
    "system@example.invalid",
    request,
  );
  assert.deepEqual(await mail.send(sent), {
    result: "aceptado",
    providerRef: "provider-synthetic",
  });
  assert.deepEqual(payload.to, [sent.to]);
  assert.equal(headers["idempotency-key"], sent.correlation);
  await mail.send(sent);
  assert.equal(headers["idempotency-key"], sent.correlation);
  for (const [status, result] of [
    [429, "transitorio"],
    [422, "permanente"],
    [401, "permanente"],
    [503, "incierto"],
    [409, "incierto"],
    [408, "incierto"],
  ] as const) {
    const adapter = new ResendMail(
      "synthetic",
      "system@example.invalid",
      async () => new Response("SECRET-RAW-PROVIDER", { status }),
    );
    assert.deepEqual(await adapter.send(sent), { result });
  }
  for (const request of [
    async () => {
      throw Error("SECRET-RAW-PROVIDER");
    },
    async () => Response.json({ id: "\nsecret" }),
    async () => Response.json({ wrong: true }),
  ])
    assert.deepEqual(
      await new ResendMail("synthetic", "system@example.invalid", request).send(
        sent,
      ),
      { result: "incierto" },
    );
});

test("Fase 12: outbox, workers, administración y RLS con PostgreSQL sintético", async (t) => {
  const x = await fixture(),
    { root, workerPool, server, a, r, partial, headers } = x;
  const capture: Parameters<MailPort["send"]>[0][] = [];
  let outcome: MailResult = {
    result: "aceptado",
    providerRef: "provider-synthetic",
  };
  const mail: MailPort = {
    async send(m) {
      capture.push(m);
      return outcome;
    },
  };
  const worker = new NotificationWorker(
    workerPool,
    mail,
    "https://inventario.test",
  );
  const row = async (id: string) =>
    (await root.query("select * from inventario.outbox where id=$1", [id]))
      .rows[0];
  const quiet = () =>
    root.query(
      "update inventario.outbox set siguiente_en=clock_timestamp()+interval '1 day' where estado='pendiente'",
    );
  async function queue(key = randomUUID()) {
    const response = await server.inject({
      method: "POST",
      url: "/api/v1/bienes",
      headers: { ...headers(a), "idempotency-key": key },
      payload: {
        codigo: "TI-" + key,
        serie: key,
        tipo: "Notebook",
        marca: "MARCA-LIBRE",
        modelo: "MODELO-LIBRE",
        condicion: "bueno",
        observaciones: "OBSERVACION-PRIVADA",
        motivo: "MOTIVO-PRIVADO",
      },
    });
    assert.equal(response.statusCode, 201, response.body);
    const job = (
      await root.query(
        "select o.* from inventario.outbox o join inventario.auditoria a on a.id=o.auditoria_id where a.entidad_ref=$1",
        [response.json().ref],
      )
    ).rows[0];
    return { job, response };
  }
  async function action(
    id: string,
    body: Record<string, unknown>,
    key = randomUUID(),
    version?: string,
    s = a,
  ) {
    const current = await row(id);
    return server.inject({
      method: "POST",
      url: "/api/v1/avisos/" + id + "/acciones",
      headers: {
        ...headers(s),
        "idempotency-key": key,
        "if-match": '"v' + (version ?? current.version) + '"',
      },
      payload: {
        motivo: "Motivo administrativo sintético",
        confirmado: true,
        ...body,
      },
    });
  }
  try {
    await quiet();
    await t.test(
      "catálogo y minimización: proyección positiva, identidad separada y consultas sin avisos",
      async () => {
        const original = (
          await root.query("select * from inventario.outbox order by creado_en")
        ).rows;
        for (const job of original) {
          await root.query(
            "update inventario.outbox set siguiente_en=clock_timestamp() where id=$1",
            [job.id],
          );
          assert.equal(await worker.tick(), true);
        }
        const { job } = await queue();
        assert.equal(await worker.tick(), true);
        const text = capture.map((m) => m.subject + " " + m.text).join("\n");
        for (const forbidden of [
          "ID-PRIVADO",
          "personal@example.invalid",
          "OBSERVACION-PRIVADA",
          "MOTIVO-PRIVADO",
          "MARCA-LIBRE",
          "MODELO-LIBRE",
          "proveedor_ref",
          "access_token",
        ])
          assert(!text.includes(forbidden), forbidden);
        assert(text.includes(admin));
        assert(text.includes("UTC"));
        assert(text.includes("campos") || text.includes("Campos"));
        assert.equal((await row(job.id)).estado, "aceptado");
        const before = (
          await root.query("select count(*) from inventario.outbox")
        ).rows[0].count;
        for (const path of [
          "bienes",
          "funcionarios",
          "resumen",
          "reportes/inventario",
        ])
          assert.equal(
            (
              await server.inject({
                url: "/api/v1/" + path,
                headers: headers(r),
              })
            ).statusCode,
            200,
          );
        assert.equal(
          (await root.query("select count(*) from inventario.outbox")).rows[0]
            .count,
          before,
        );
        assert.equal(
          (await root.query("select count(*) from acceso.entregas")).rows[0]
            .count,
          "0",
        );
      },
    );
    await t.test(
      "destino fijado, cambio encargado y plantillas mínimas sin dirección nueva al anterior",
      async () => {
        const { job } = await queue();
        await quiet();
        const version = (
          await root.query(
            "select version from inventario.configuracion_avisos",
          )
        ).rows[0].version;
        const response = await server.inject({
          method: "POST",
          url: "/api/v1/admin/avisos",
          headers: { ...headers(a), "if-match": '"v' + version + '"' },
          payload: {
            destinatario: "nuevo@example.invalid",
            motivo: "Cambio sintético",
            confirmado: true,
          },
        });
        assert.equal(response.statusCode, 201, response.body);
        const jobs = (
          await root.query(
            "select * from inventario.outbox where proposito in ('activacion_avisos','sustitucion_avisos') order by proposito",
          )
        ).rows;
        assert.equal(jobs.length, 2);
        await worker.tick();
        await worker.tick();
        assert(
          capture.some(
            (m) =>
              m.to === "nuevo@example.invalid" &&
              m.subject.includes("activados"),
          ),
        );
        const replacement = capture.find((m) =>
          m.subject.includes("sustituido"),
        )!;
        assert.equal(replacement.to, "encargado@example.invalid");
        assert(!replacement.text.includes("nuevo@example.invalid"));
        assert(!replacement.text.includes("Cambio sintético"));
        outcome = { result: "transitorio" };
        await root.query(
          "update inventario.outbox set siguiente_en=clock_timestamp() where id=$1",
          [job.id],
        );
        await worker.tick();
        assert.equal(
          (await row(job.id)).destinatario,
          "encargado@example.invalid",
        );
        await root.query(
          "update inventario.outbox set siguiente_en=clock_timestamp() where id=$1",
          [job.id],
        );
        outcome = {
          result: "aceptado",
          providerRef: "old-recipient-synthetic",
        };
        await worker.tick();
        assert.equal(capture.at(-1)!.to, "encargado@example.invalid");
        assert.equal(capture.at(-1)!.correlation, "aviso-" + job.id);
      },
    );
    await t.test(
      "catálogo completo de acciones y bloqueo explícito de eventos no admitidos",
      async () => {
        const source = (
          await root.query(
            "select * from inventario.auditoria order by id limit 1",
          )
        ).rows[0];
        for (const [entity, purpose, actions] of [
          ["bien", "cambio_bien", ["alta", "edicion"]],
          ["cuentas", "cambio_cuenta", ["alta", "edicion", "forzar_clave"]],
          [
            "funcionario",
            "proceso_empresarial",
            ["funcionario", "pertenencia", "estado"],
          ],
          [
            "bien",
            "proceso_empresarial",
            [
              "asignacion",
              "devolucion",
              "traslado",
              "condicion",
              "baja",
              "reactivacion",
              "anotacion",
            ],
          ],
        ] as const)
          for (const action of actions) {
            const event = (
              await root.query(
                `insert into inventario.auditoria(actor_id,comando_id,entidad,entidad_ref,accion,nuevo,motivo)
          values($1,$2,$3,$4,$5,$6,'MOTIVO-PRIVADO') returning id`,
                [
                  admin,
                  source.comando_id,
                  entity,
                  randomUUID(),
                  action,
                  {
                    documento: "RUT-PRIVADO",
                    correo: "personal@example.invalid",
                    observaciones: "OBSERVACION-PRIVADA",
                    password: "SECRET",
                  },
                ],
              )
            ).rows[0].id;
            const n = (
              await root.query("select inventario.contenido_aviso($1,$2) n", [
                event,
                purpose,
              ])
            ).rows[0].n;
            assert(n, action);
            const rendered = JSON.stringify(
              template(n, "https://inventario.test"),
            );
            for (const forbidden of [
              "RUT-PRIVADO",
              "personal@example.invalid",
              "OBSERVACION-PRIVADA",
              "SECRET",
              "MOTIVO-PRIVADO",
            ])
              assert(!rendered.includes(forbidden));
            assert(n.campos.includes("documento"));
            assert(n.campos.includes("correo"));
          }
        const { job } = await queue();
        // Solo fixture root: propósito fuera del catálogo, sin cambiar eventos originales.
        const rejected = (
          await root.query(
            "insert into inventario.outbox(auditoria_id,destinatario,proposito) values($1,'synthetic@example.invalid','no_aprobado') returning id",
            [job.auditoria_id],
          )
        ).rows[0].id;
        await quiet();
        await root.query(
          "update inventario.outbox set siguiente_en=clock_timestamp() where id=$1",
          [rejected],
        );
        const before = capture.length;
        assert.equal(await worker.tick(), false);
        assert.equal(capture.length, before);
        assert.equal((await row(rejected)).estado, "fallido");
        assert.equal(
          (await row(rejected)).ultimo_error_codigo,
          "CATALOG_REJECTED",
        );
        assert.equal(
          (await action(rejected, { accion: "reintentar" })).statusCode,
          422,
        );
        assert.equal(
          (await action(job.id, { accion: "cancelar" })).statusCode,
          200,
        );
      },
    );
    await t.test(
      "intento inicial y tres reintentos a 1/5/15 min, agotamiento y correlación estable",
      async () => {
        const { job } = await queue();
        outcome = { result: "transitorio" };
        for (let attempt = 1; attempt <= 4; attempt++) {
          assert.equal(await worker.tick(), true);
          const current = await row(job.id);
          assert.equal(current.intentos, attempt);
          if (attempt < 4) {
            assert.equal(current.estado, "pendiente");
            const last = (
              await root.query(
                "select registrado_en from inventario.intentos_aviso where outbox_id=$1 and numero=$2",
                [job.id, attempt],
              )
            ).rows[0];
            const delay =
              (current.siguiente_en.getTime() - last.registrado_en.getTime()) /
              1000;
            assert(
              Math.abs(delay - [60, 300, 900][attempt - 1]) < 1,
              String(delay),
            );
            assert.equal(await worker.tick(), false);
            await root.query(
              "update inventario.outbox set siguiente_en=clock_timestamp() where id=$1",
              [job.id],
            );
          } else {
            assert.equal(current.estado, "fallido");
            assert.equal(current.ultimo_error_codigo, "RETRIES_EXHAUSTED");
          }
        }
        assert.equal(
          new Set(
            capture
              .filter((m) => m.correlation === "aviso-" + job.id)
              .map((m) => m.correlation),
          ).size,
          1,
        );
        assert.equal(
          (await action(job.id, { accion: "reintentar" })).statusCode,
          200,
        );
        outcome = { result: "aceptado", providerRef: "recovered" };
        await worker.tick();
        assert.equal((await row(job.id)).intentos, 5);
        assert.equal((await row(job.id)).ciclo_intentos, 1);
      },
    );
    await t.test(
      "fallo permanente detiene; operación empresarial y evidencia no se revierten",
      async () => {
        const { job, response } = await queue();
        outcome = { result: "permanente" };
        await worker.tick();
        assert.equal((await row(job.id)).estado, "fallido");
        assert.equal(await worker.tick(), false);
        assert.equal(
          (
            await root.query(
              "select count(*) from inventario.bienes where id=$1",
              [response.json().ref],
            )
          ).rows[0].count,
          "1",
        );
        assert.equal(
          (
            await root.query(
              "select count(*) from inventario.auditoria where id=$1",
              [job.auditoria_id],
            )
          ).rows[0].count,
          "1",
        );
      },
    );
    await t.test(
      "exclusión entre workers y token: una reclamación, una aceptación",
      async () => {
        const { job } = await queue();
        const claims = await Promise.all(
          Array.from(
            { length: 5 },
            async () =>
              (await workerPool.query("select inventario.reclamar_aviso() job"))
                .rows[0].job,
          ),
        );
        const claimed = claims.filter(Boolean);
        assert.equal(claimed.length, 1);
        assert.equal(claimed[0].id, job.id);
        assert.equal(
          (
            await workerPool.query(
              "select inventario.finalizar_aviso($1,$2,'aceptado','synthetic') ok",
              [job.id, randomUUID()],
            )
          ).rows[0].ok,
          false,
        );
        assert.equal(
          (
            await workerPool.query(
              "select inventario.finalizar_aviso($1,$2,'aceptado','synthetic') ok",
              [job.id, claimed[0].token],
            )
          ).rows[0].ok,
          true,
        );
        assert.equal(
          (
            await workerPool.query(
              "select inventario.finalizar_aviso($1,$2,'aceptado','synthetic') ok",
              [job.id, claimed[0].token],
            )
          ).rows[0].ok,
          false,
        );
      },
    );
    await t.test(
      "caída tras posible envío: expira a incierto, no reenvía y rechaza finalización tardía",
      async () => {
        const { job } = await queue();
        const claim = (
          await workerPool.query("select inventario.reclamar_aviso() job")
        ).rows[0].job;
        await root.query(
          "update inventario.outbox set arrendamiento_hasta=clock_timestamp()-interval '1 second' where id=$1",
          [job.id],
        );
        const before = capture.length;
        assert.equal(await worker.tick(), false);
        assert.equal(capture.length, before);
        assert.equal((await row(job.id)).estado, "incierto");
        assert.equal((await row(job.id)).ultimo_error_codigo, "LEASE_EXPIRED");
        assert.equal(
          (
            await workerPool.query(
              "select inventario.finalizar_aviso($1,$2,'aceptado','late') ok",
              [job.id, claim.token],
            )
          ).rows[0].ok,
          false,
        );
        assert.equal(
          (await action(job.id, { accion: "reintentar" })).statusCode,
          422,
        );
        assert.equal(
          (await action(job.id, { accion: "cancelar" })).statusCode,
          422,
        );
        assert.equal(
          (
            await action(job.id, {
              accion: "conciliar",
              resultado: "no_enviado",
            })
          ).statusCode,
          400,
        );
        assert.equal(
          (
            await action(job.id, {
              accion: "conciliar",
              resultado: "no_enviado",
              evidencia: "Proveedor doble confirma ausencia",
            })
          ).statusCode,
          200,
        );
        assert.equal(
          (await action(job.id, { accion: "reintentar" })).statusCode,
          200,
        );
        outcome = { result: "aceptado", providerRef: "conciliated" };
        await worker.tick();
        assert.equal((await row(job.id)).estado, "aceptado");
        assert.equal(
          (
            await action(job.id, {
              accion: "conciliar",
              resultado: "entregado",
              evidencia: "Confirmación sintética de entrega",
            })
          ).statusCode,
          200,
        );
        assert.equal((await row(job.id)).estado, "entregado");
      },
    );
    await t.test(
      "timeout de proveedor saneado y conciliación aceptada sin duplicar mensaje",
      async () => {
        const { job } = await queue();
        const failing = new NotificationWorker(
          workerPool,
          {
            async send() {
              throw Error("SECRET-PROVIDER-DETAIL");
            },
          },
          "https://inventario.test",
        );
        await failing.tick();
        assert.equal((await row(job.id)).estado, "incierto");
        assert.equal(await worker.tick(), false);
        assert.equal(
          (
            await action(job.id, {
              accion: "conciliar",
              resultado: "aceptado",
              evidencia: "Consulta manual al proveedor doble",
            })
          ).statusCode,
          200,
        );
        const response = await server.inject({
          url: "/api/v1/avisos/" + job.id,
          headers: headers(a),
        });
        assert.equal(response.statusCode, 200);
        assert(!response.body.includes("SECRET-PROVIDER-DETAIL"));
        assert.equal(response.json().attempts[0].codigo, "PROVIDER_UNCERTAIN");
      },
    );
    await t.test(
      "cancelación, replay, concurrencia, motivos y auditoría sin nuevos avisos",
      async () => {
        const key = randomUUID(),
          { job } = await queue(),
          body = { accion: "cancelar" };
        const before = (
          await root.query("select count(*) from inventario.outbox")
        ).rows[0].count;
        const first = await action(job.id, body, key, job.version);
        assert.equal(first.statusCode, 200, first.body);
        const replay = await action(job.id, body, key, job.version);
        assert.deepEqual(replay.json(), first.json());
        assert.equal(
          (await action(job.id, { accion: "reintentar" }, key, job.version))
            .statusCode,
          409,
        );
        assert.equal(
          (await action(job.id, body, randomUUID(), job.version)).statusCode,
          412,
        );
        assert.equal(
          (await action(job.id, { accion: "cancelar", motivo: " " }))
            .statusCode,
          400,
        );
        assert.equal(
          (await action(job.id, { accion: "cancelar", confirmado: false }))
            .statusCode,
          400,
        );
        assert.equal(
          (
            await root.query(
              "select count(*) from inventario.auditoria where entidad='aviso' and entidad_ref=$1",
              [job.id],
            )
          ).rows[0].count,
          "1",
        );
        assert.equal(
          (await root.query("select count(*) from inventario.outbox")).rows[0]
            .count,
          before,
        );
        const q = await queue();
        const results = await Promise.all([
          action(q.job.id, body, randomUUID(), q.job.version),
          action(q.job.id, body, randomUUID(), q.job.version),
        ]);
        assert.deepEqual(results.map((r) => r.statusCode).sort(), [200, 412]);
      },
    );
    await t.test(
      "RBAC, sesión/MFA/Origin/CSRF y ausencia de DML/lectura general en worker",
      async () => {
        const { job } = await queue();
        await quiet();
        for (const s of [r, partial]) {
          assert.equal(
            (
              await server.inject({
                url: "/api/v1/avisos",
                headers: headers(s),
              })
            ).statusCode,
            s === r ? 403 : 401,
          );
          assert.equal(
            (
              await action(
                job.id,
                { accion: "cancelar" },
                randomUUID(),
                job.version,
                s,
              )
            ).statusCode,
            s === r ? 403 : 401,
          );
        }
        assert.equal(
          (await server.inject({ url: "/api/v1/avisos" })).statusCode,
          401,
        );
        for (const bad of [
          { "x-csrf-token": "bad" },
          { origin: "https://evil.invalid" },
        ])
          assert.equal(
            (
              await server.inject({
                method: "POST",
                url: "/api/v1/avisos/" + job.id + "/acciones",
                headers: {
                  ...headers(a),
                  "if-match": '"v' + job.version + '"',
                  ...bad,
                },
                payload: {
                  accion: "cancelar",
                  motivo: "Prueba",
                  confirmado: true,
                },
              })
            ).statusCode,
            403,
          );
        const noVersion = await server.inject({
          method: "POST",
          url: "/api/v1/avisos/" + job.id + "/acciones",
          headers: headers(a),
          payload: {
            accion: "cancelar",
            motivo: "Sin versión",
            confirmado: true,
          },
        });
        assert.equal(noVersion.statusCode, 428);
        for (const role of ["anon", "authenticated"])
          for (const fn of [
            "inventario.reclamar_aviso()",
            "inventario.finalizar_aviso(uuid,uuid,text,text)",
            "inventario.accion_aviso(uuid,uuid,bigint,jsonb)",
            "inventario.contenido_aviso(bigint,text)",
          ])
            assert.equal(
              (
                await root.query(
                  "select has_function_privilege($1,$2,'execute') ok",
                  [role, fn],
                )
              ).rows[0].ok,
              false,
            );
        await assertDatabaseRole(workerPool, "inventario_worker");
        await assert.rejects(() =>
          assertDatabaseRole(root, "inventario_worker"),
        );
        for (const sql of [
          "select * from inventario.outbox",
          "select * from inventario.auditoria",
          "select * from acceso.entregas",
          "update inventario.outbox set estado='aceptado'",
          "select inventario.accion_aviso(null,null,null,null)",
        ])
          await assert.rejects(
            () => workerPool.query(sql),
            /permission denied/,
          );
        for (const sql of [
          "select inventario.reclamar_aviso()",
          "update inventario.outbox set estado='aceptado'",
          "delete from inventario.intentos_aviso",
        ])
          await assert.rejects(
            () => x.business.query(sql),
            /permission denied/,
          );
        await assert.rejects(
          () =>
            root.query(
              "update inventario.outbox set destinatario=$1 where id=$2",
              ["redirect@example.invalid", job.id],
            ),
          /DESTINATARIO_EVENTO_INMUTABLE/,
        );
        await assert.rejects(
          () =>
            root.query("update inventario.intentos_aviso set codigo='changed'"),
          /EVIDENCIA_INMUTABLE/,
        );
      },
    );
    await t.test(
      "unicidad lógica y replay empresarial; listado paginado/filtros/errores administrativos",
      async () => {
        const key = randomUUID(),
          { job } = await queue(key);
        const replay = await queue(key);
        assert.equal(replay.job.id, job.id);
        await assert.rejects(
          () =>
            root.query(
              "insert into inventario.outbox(auditoria_id,destinatario,proposito) values($1,$2,$3)",
              [job.auditoria_id, job.destinatario, job.proposito],
            ),
          /duplicate key/,
        );
        for (let i = 0; i < 51; i++) await queue();
        await quiet();
        const first = await server.inject({
          url: "/api/v1/avisos?estado=pendiente",
          headers: headers(a),
        });
        assert.equal(first.statusCode, 200);
        assert.equal(first.json().items.length, 50);
        assert(first.json().nextCursor);
        const next = await server.inject({
          url:
            "/api/v1/avisos?estado=pendiente&cursor=" + first.json().nextCursor,
          headers: headers(a),
        });
        assert.equal(next.statusCode, 200);
        const ids = [...first.json().items, ...next.json().items].map(
          (r) => r.id,
        );
        assert.equal(new Set(ids).size, ids.length);
        assert.equal(
          (
            await server.inject({
              url: "/api/v1/avisos?estado=bad",
              headers: headers(a),
            })
          ).statusCode,
          400,
        );
        assert.equal(
          (
            await server.inject({
              url: "/api/v1/avisos/" + randomUUID(),
              headers: headers(a),
            })
          ).statusCode,
          404,
        );
      },
    );
    await t.test(
      "fallo de auditoría revierte acción, comando y estado",
      async () => {
        const { job } = await queue();
        const before = (
          await root.query("select count(*) from inventario.comandos")
        ).rows[0].count;
        await root.query(`create function inventario.rechazar_accion_sintetica() returns trigger language plpgsql as $$
        begin if new.entidad='aviso' then raise exception 'SYNTHETIC_AUDIT_FAILURE'; end if;return new;end $$;
        create trigger rechazo_sintetico before insert on inventario.auditoria for each row execute function inventario.rechazar_accion_sintetica()`);
        try {
          const response = await action(job.id, { accion: "cancelar" });
          assert.equal(response.statusCode, 503);
          assert(!response.body.includes("SYNTHETIC_AUDIT_FAILURE"));
          const after = await row(job.id);
          assert.equal(after.estado, "pendiente");
          assert.equal(after.version, job.version);
          assert.equal(
            (await root.query("select count(*) from inventario.comandos"))
              .rows[0].count,
            before,
          );
        } finally {
          await root.query(
            "drop trigger rechazo_sintetico on inventario.auditoria;drop function inventario.rechazar_accion_sintetica()",
          );
        }
      },
    );
    await t.test(
      "revocación vigente bloquea seguimiento y acciones con una sesión antigua",
      async () => {
        await root.query(
          "update inventario.cuentas set version_autorizacion=version_autorizacion+1 where id=$1",
          [admin],
        );
        assert.equal(
          (await server.inject({ url: "/api/v1/avisos", headers: headers(a) }))
            .statusCode,
          401,
        );
      },
    );
  } finally {
    await x.close();
  }
});
