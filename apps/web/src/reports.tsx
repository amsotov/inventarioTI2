import React, { useEffect, useRef, useState } from "react";
import { api, ApiError, message } from "./api";
const titles: Record<string, string> = {
  inventario: "Inventario general",
  "por-funcionario": "Bienes por funcionario",
  movimientos: "Movimientos",
  "por-condicion": "Bienes por condición",
  auditoria: "Auditoría",
  busqueda: "Buscador combinado",
};
const show = (value: unknown) =>
  value === null || value === undefined
    ? "—"
    : typeof value === "boolean"
      ? value
        ? "Sí"
        : "No"
      : String(value);
let pendingHash: string | null = null;
export function protectReportNavigation() {
  if (pendingHash !== null && location.hash !== pendingHash) {
    history.replaceState(null, "", pendingHash);
    return true;
  }
  return false;
}
type Command = {
  tipo: string;
  formato: string;
  filtros: Record<string, string>;
  key: string;
};
export function Reports({
  summary,
  admin,
  csrf,
  onExpired,
}: {
  summary: boolean;
  admin: boolean;
  csrf: string;
  onExpired: () => void;
}) {
  const [type, setType] = useState("inventario"),
    [filters, setFilters] = useState<Record<string, string>>({}),
    [cursors, setCursors] = useState<(string | null)[]>([null]),
    [revision, setRevision] = useState(0);
  const [data, setData] = useState<any>(null),
    [metrics, setMetrics] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [units, setUnits] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null),
    [command, setCommand] = useState<Command | null>(null),
    [sending, setSending] = useState(false);
  const active = useRef(true),
    errorFocus = useRef<HTMLDivElement>(null);
  const fail = (e: unknown) => {
    if (active.current) {
      setError(message(e));
      if (e instanceof ApiError && e.status === 401) onExpired();
    }
  };
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      pendingHash = null;
    };
  }, []);
  useEffect(() => {
    pendingHash = command ? (pendingHash ?? location.hash) : null;
    const guard = (e: BeforeUnloadEvent) => {
      if (command) e.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [command]);
  useEffect(() => {
    if (error) errorFocus.current?.focus();
  }, [error]);
  useEffect(() => {
    let current = true;
    api("unidades?limit=100")
      .then(({ body }) => {
        if (current) setUnits(body.items);
      })
      .catch(() => {});
    return () => {
      current = false;
    };
  }, []);
  useEffect(() => {
    let current = true;
    setError("");
    setBusy(true);
    setData(null);
    setMetrics(null);
    const q = new URLSearchParams({ ...filters, limit: "25" });
    if (cursors.at(-1)) q.set("cursor", cursors.at(-1)!);
    api(
      summary
        ? "resumen"
        : (type === "busqueda" ? "buscar" : "reportes/" + type) + "?" + q,
    )
      .then(({ body }) => {
        if (current) {
          if (summary) setMetrics(body);
          else setData(body);
        }
      })
      .catch((e) => {
        if (current) fail(e);
      })
      .finally(() => {
        if (current) setBusy(false);
      });
    return () => {
      current = false;
    };
  }, [summary, type, filters, cursors, revision]);
  useEffect(() => {
    if (!job || !["pendiente", "procesando"].includes(job.estado)) return;
    let current = true;
    const timer = setTimeout(() => {
      api("exportaciones/" + job.ref)
        .then(({ body }) => {
          if (current) setJob(body);
        })
        .catch((e) => {
          if (current) fail(e);
        });
    }, 1000);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [job]);
  async function send(c: Command) {
    setSending(true);
    setError("");
    try {
      const { body } = await api(
        "exportaciones",
        {
          method: "POST",
          headers: { "Idempotency-Key": c.key },
          body: JSON.stringify({
            tipo: c.tipo,
            formato: c.formato,
            filtros: c.filtros,
          }),
        },
        csrf,
      );
      if (active.current) {
        setJob(body);
        setCommand(null);
        pendingHash = null;
      }
    } catch (e) {
      fail(e);
      if (e instanceof ApiError && e.status < 500 && e.status !== 429) {
        setCommand(null);
        pendingHash = null;
      }
    } finally {
      if (active.current) setSending(false);
    }
  }
  function start(format: string) {
    if (!data || command) return;
    const c = {
      tipo: type,
      formato: format,
      filtros: data.filters,
      key: crypto.randomUUID(),
    };
    setCommand(c);
    pendingHash = location.hash;
    void send(c);
  }
  async function download() {
    setSending(true);
    setError("");
    try {
      if (import.meta.env.VITE_DEMO_MODE === "true") {
        const { downloadDemoExport } = await import("./demoData");
        await downloadDemoExport(job.ref);
        return;
      }
      const response = await fetch(
        "/api/v1/exportaciones/" + job.ref + "/archivo",
        { credentials: "same-origin" },
      );
      if (!response.ok) {
        const p = await response.json();
        throw new ApiError(response.status, p.code, p.requestId);
      }
      const blob = await response.blob();
      if (!active.current) return;
      const url = URL.createObjectURL(blob),
        link = document.createElement("a");
      link.href = url;
      link.download = "inventario-" + job.ref + "." + job.formato;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      fail(e);
    } finally {
      if (active.current) setSending(false);
    }
  }
  const move = type === "movimientos",
    audit = type === "auditoria",
    search = type === "busqueda";
  const textField = (key: string, label: string) => (
    <label key={key}>
      {label}
      <input name={key} maxLength={200} />
    </label>
  );
  return (
    <>
      <div className="title">
        <div>
          <h1>
            {summary ? "Resumen del inventario" : "Reportes y exportación"}
          </h1>
          <p>Inventario compartido · Fechas y horas en UTC</p>
        </div>
        <button onClick={() => setRevision((v) => v + 1)} disabled={busy}>
          Actualizar consulta
        </button>
      </div>
      {error && (
        <div className="error" role="alert" tabIndex={-1} ref={errorFocus}>
          {error}
        </div>
      )}
      {busy && <p role="status">Consultando datos…</p>}
      {summary && metrics && (
        <>
          <p>Calculado: {metrics.generatedAt} · UTC · Fotografía actual</p>
          <div className="report-metrics">
            {[
              ["Bienes registrados", "registrados", "Incluye activos y bajas"],
              ["Bienes asignados", "asignados", "Con custodia vigente"],
              [
                "Disponibles",
                "disponibles",
                "Activos, sin custodia, en bueno o regular",
              ],
              [
                "Funcionarios activos",
                "funcionarios_activos",
                "No son cuentas de acceso",
              ],
            ].map(([label, key, help]) => (
              <section className="card" key={key}>
                <h2>{label}</h2>
                <strong>{metrics.metrics[key]}</strong>
                <p>{help}</p>
              </section>
            ))}
          </div>
          <section className="card">
            <h2>Condición física actual</h2>
            <dl>
              {["bueno", "regular", "malo"].map((k) => (
                <React.Fragment key={k}>
                  <dt>{k}</dt>
                  <dd>{metrics.metrics[k]} bienes</dd>
                </React.Fragment>
              ))}
            </dl>
            <p>
              Bienes en malo con custodia: {metrics.metrics.malos_asignados}. La
              condición conserva al responsable.
            </p>
          </section>
          <section className="card">
            <h2>Últimos movimientos</h2>
            {metrics.recent.length ? (
              <ol>
                {metrics.recent.map((r: any) => (
                  <li key={r.referencia}>
                    {r.codigo} · {r.tipo} · {r.efectiva_en} UTC
                  </li>
                ))}
              </ol>
            ) : (
              <p>Sin movimientos registrados.</p>
            )}
            <a href="#reportes">Consultar reportes y buscador</a>
          </section>
        </>
      )}
      {!summary && (
        <>
          <label htmlFor="report-type">Tipo de reporte</label>
          <select
            id="report-type"
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setFilters({});
              setCursors([null]);
            }}
          >
            {Object.entries(titles)
              .filter(([k]) => admin || k !== "auditoria")
              .map(([k, label]) => (
                <option value={k} key={k}>
                  {label}
                </option>
              ))}
          </select>
          <form
            key={type}
            className="card filters"
            onSubmit={(e) => {
              e.preventDefault();
              setFilters(
                Object.fromEntries(
                  [...new FormData(e.currentTarget)]
                    .map(([k, v]) => [k, String(v).trim()])
                    .filter(([, v]) => v),
                ),
              );
              setCursors([null]);
            }}
          >
            {textField(
              "q",
              audit
                ? "Texto en entidad, referencia o acción"
                : move
                  ? "Texto en código, movimiento o personas"
                  : search
                    ? "Texto en bienes y funcionarios"
                    : "Texto en código, serie, tipo, marca o modelo",
            )}
            {!audit && (
              <>
                <label>
                  {move ? "Tipo de movimiento" : "Tipo de bien"}
                  <input name="tipo" maxLength={200} />
                </label>
                <label>
                  {move
                    ? "Unidad histórica de origen o destino"
                    : "Unidad actual"}
                  <input name="unidad_id" list="report-units" maxLength={36} />
                  <datalist id="report-units">
                    {units.map((u) => (
                      <option value={u.id} key={u.id}>
                        {u.nombre}
                      </option>
                    ))}
                  </datalist>
                </label>
                {textField(
                  "funcionario_id",
                  move
                    ? "Referencia de origen o destino"
                    : "Referencia de funcionario",
                )}
                {textField("bien_id", "Referencia de bien")}
                {!move && (
                  <>
                    <label>
                      Condición
                      <select name="condicion">
                        <option value="">Todas</option>
                        {["bueno", "regular", "malo"].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Estado administrativo
                      <select name="situacion">
                        <option value="">Todos</option>
                        <option value="activo">Activo</option>
                        <option value="baja">Baja</option>
                      </select>
                    </label>
                    <label>
                      Custodia
                      <select name="custodia">
                        <option value="">Todas</option>
                        <option value="asignado">Asignado</option>
                        <option value="sin-asignar">Sin asignar</option>
                      </select>
                    </label>
                  </>
                )}
                {search && (
                  <label>
                    Estado de funcionario
                    <select name="activo">
                      <option value="">Todos</option>
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </label>
                )}
              </>
            )}
            {audit && (
              <>
                {textField("actor_id", "Referencia de actor")}
                {textField("entidad", "Entidad")}
                {textField("entidad_ref", "Referencia de entidad")}
                {textField("accion", "Acción")}
              </>
            )}
            <label>
              Desde (día UTC)
              <input
                name="desde"
                type="date"
                min="0001-01-01"
                max="9999-12-30"
              />
            </label>
            <label>
              Hasta (día UTC, inclusive)
              <input
                name="hasta"
                type="date"
                min="0001-01-01"
                max="9999-12-30"
              />
            </label>
            <button disabled={busy}>Aplicar filtros</button>
          </form>
          <p>
            Inventario y condición muestran el estado actual. Las fechas
            seleccionan adquisición; por funcionario, inicio de custodia;
            movimientos, fecha efectiva; auditoría, fecha de registro. El
            buscador aplica alta a funcionarios y adquisición a bienes. Los
            filtros de bien solo afectan a bienes.
          </p>
          {data && (
            <>
              <p role="status">
                Total filtrado: {data.total} · Generado: {data.generatedAt} ·
                UTC
              </p>
              <p>Filtros aplicados: {JSON.stringify(data.filters)}</p>
              {data.subtotals && (
                <p>
                  Subtotales: bueno {data.subtotals.bueno} · regular{" "}
                  {data.subtotals.regular} · malo {data.subtotals.malo}
                </p>
              )}
              <div className="actions">
                <button
                  disabled={sending || Boolean(command)}
                  onClick={() => start("xlsx")}
                >
                  Exportar Excel
                </button>
                <button
                  disabled={sending || Boolean(command)}
                  onClick={() => start("pdf")}
                >
                  Exportar PDF
                </button>
              </div>
              <p>
                Se exporta todo el conjunto filtrado: máximo 10.000 filas Excel
                o 2.000 PDF. Archivo privado disponible durante una hora. Cada
                nueva consulta/exportación identifica su instante UTC.
              </p>
              {data.sections.map((s: any) => (
                <section className="card" key={s.name}>
                  <h2>
                    {s.name} · {s.total}
                  </h2>
                  <p>Campo temporal: {s.dateField} · UTC</p>
                  {s.items.length ? (
                    <div
                      className="table-wrap"
                      tabIndex={0}
                      role="region"
                      aria-label={"Resultados " + s.name}
                    >
                      <table>
                        <thead>
                          <tr>
                            {s.columns.map((c: any) => (
                              <th key={c.key} scope="col">
                                {c.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {s.items.map((r: any, i: number) => (
                            <tr key={i}>
                              {s.columns.map((c: any) => (
                                <td key={c.key}>{show(r[c.key])}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p>Sin filas en esta página.</p>
                  )}
                </section>
              ))}
              <div className="actions">
                <button
                  disabled={cursors.length < 2 || busy}
                  onClick={() => setCursors((c) => c.slice(0, -1))}
                >
                  Página anterior
                </button>
                <span>Página {cursors.length}</span>
                <button
                  disabled={
                    busy || !data.sections.some((s: any) => s.nextCursor)
                  }
                  onClick={() =>
                    setCursors((c) => [
                      ...c,
                      data.sections.find((s: any) => s.nextCursor).nextCursor,
                    ])
                  }
                >
                  Página siguiente
                </button>
              </div>
            </>
          )}
        </>
      )}
      {command && (
        <section className="card">
          <h2>Solicitud de exportación pendiente</h2>
          <p>
            Clave de reintento: {command.key}. Conserva esta vista para resolver
            el resultado.
          </p>
          <button disabled={sending} onClick={() => void send(command)}>
            Reintentar misma solicitud
          </button>
        </section>
      )}
      {job && (
        <section className="card" aria-label="Exportación">
          <h2>Exportación {job.formato.toUpperCase()}</h2>
          <p role="status">
            Estado: {job.estado} · Total: {job.total}
          </p>
          <p>Referencia: {job.ref}</p>
          <p>
            Generado: {job.generatedAt} UTC · Caduca: {job.expiresAt} UTC
          </p>
          {job.error && (
            <p role="alert">
              {job.error === "EXPORT_TIMEOUT"
                ? "La generación excedió su tiempo."
                : "No se pudo generar el archivo."}{" "}
              Revisa los filtros y solicita una nueva exportación.
            </p>
          )}
          {job.estado === "listo" && (
            <button disabled={sending} onClick={() => void download()}>
              Descargar archivo privado
            </button>
          )}
          {["pendiente", "procesando"].includes(job.estado) && (
            <button
              disabled={sending}
              onClick={() => {
                api("exportaciones/" + job.ref)
                  .then(({ body }) => setJob(body))
                  .catch(fail);
              }}
            >
              Consultar estado
            </button>
          )}
          {job.estado === "caducado" && (
            <p>El archivo caducó. Solicita una exportación nueva.</p>
          )}
        </section>
      )}
      <form
        className="card filters"
        onSubmit={(e) => {
          e.preventDefault();
          const id = String(new FormData(e.currentTarget).get("ref"));
          api("exportaciones/" + id)
            .then(({ body }) => setJob(body))
            .catch(fail);
        }}
      >
        <label>
          Referencia de exportación anterior
          <input
            name="ref"
            required
            pattern="[0-9a-fA-F-]{36}"
            maxLength={36}
          />
        </label>
        <button>Recuperar exportación propia</button>
      </form>
    </>
  );
}
