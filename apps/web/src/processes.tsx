import React, { useEffect, useRef, useState } from "react";
import { api, message } from "./api";
type Row = Record<string, any>;
let activeProcessHash: string | null = null;
export function protectProcessNavigation() {
  if (activeProcessHash !== null && location.hash !== activeProcessHash) {
    window.history.replaceState(null, "", activeProcessHash);
    return true;
  }
  return false;
}
export function Processes({
  resource,
  record,
  csrf,
  canWrite,
  onExpired,
  onSaved,
  onStart,
}: {
  resource: string;
  record: Row | null;
  csrf: string;
  canWrite: boolean;
  onExpired: () => void;
  onSaved: () => void;
  onStart: () => void;
}) {
  const [op, setOp] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [uncertain, setUncertain] = useState(false),
    [history, setHistory] = useState<Row | null>(null),
    [editing, setEditing] = useState<Row | null>(null),
    [units, setUnits] = useState<Row[]>([]),
    [unitCursor, setUnitCursor] = useState<string | null>(null);
  const container = useRef<HTMLElement>(null);
  const pending = useRef<{
    path: string;
    body: string;
    key: string;
    version: string | null;
    method: string;
  } | null>(null);
  useEffect(() => {
    let live = true;
    setHistory(null);
    if (record && resource !== "movimientos")
      api(`${resource}/${record.id}/historia`)
        .then((r) => {
          if (live) setHistory(r.body);
        })
        .catch((e) => {
          if (live) {
            setError(message(e));
            if (e.status === 401) onExpired();
          }
        });
    return () => {
      live = false;
    };
  }, [resource, record]);
  useEffect(() => {
    const capture = (e: MouseEvent) => {
      if (
        pending.current &&
        ((e.target as Element).closest("a") ||
          ((e.target as Element).closest("button") &&
            !container.current?.contains(e.target as Node)))
      ) {
        e.preventDefault();
        setError("Resuelve la operación pendiente antes de navegar.");
      }
    };
    const warn = (e: BeforeUnloadEvent) => {
      if (pending.current) e.preventDefault();
    };
    document.addEventListener("click", capture, true);
    window.addEventListener("beforeunload", warn);
    return () => {
      document.removeEventListener("click", capture, true);
      window.removeEventListener("beforeunload", warn);
      activeProcessHash = null;
    };
  }, []);
  async function choose(value: string) {
    onStart();
    setError("");
    setNotice("");
    setEditing(null);
    setOp(value);
    setBusy(true);
    try {
      if (value === "funcionario" || value === "pertenencia") {
        const r = await api("unidades?limit=100");
        setUnits(r.body.items);
        setUnitCursor(r.body.nextCursor);
      }
      if (value === "funcionario" && record)
        setEditing((await api(`funcionarios/${record.id}/edicion`)).body);
    } catch (e: any) {
      setError(message(e));
      setOp("");
      if (e.status === 401) onExpired();
    } finally {
      setBusy(false);
    }
  }
  async function send() {
    const p = pending.current;
    if (!p) return;
    onStart();
    setBusy(true);
    setError("");
    try {
      await api(
        p.path,
        {
          method: p.method,
          body: p.body,
          headers: {
            "Idempotency-Key": p.key,
            ...(p.version ? { "If-Match": `"v${p.version}"` } : {}),
          },
        },
        csrf,
      );
      pending.current = null;
      activeProcessHash = null;
      setUncertain(false);
      setOp("");
      setNotice("");
      onSaved();
    } catch (e: any) {
      setError(message(e));
      if (e.status === 401) onExpired();
      if (!e.status || e.status >= 500) setUncertain(true);
      else {
        pending.current = null;
        activeProcessHash = null;
        setUncertain(false);
      }
    } finally {
      setBusy(false);
    }
  }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending.current) return;
    const d: Row = Object.fromEntries(new FormData(e.currentTarget));
    delete d.confirmacion;
    d.confirmado = true;
    let path = "",
      method = "POST";
    if (op === "funcionario") {
      path = "funcionarios" + (record ? "/" + record.id : "");
      method = record ? "PATCH" : "POST";
      if (!d.correo) d.correo = null;
    } else if (op === "pertenencia")
      path = `funcionarios/${record!.id}/pertenencias`;
    else if (op === "estado") {
      path = `funcionarios/${record!.id}/estado`;
      d.activo = !record!.activo;
    } else if (op === "anotacion") {
      path = `movimientos/${d.movimiento}/anotaciones`;
      delete d.movimiento;
    } else {
      path = `bienes/${record!.id}/movimientos`;
      d.tipo = op;
      for (const k of ["destino", "origenEsperado", "condicion", "corrige_id"])
        if (!d[k]) delete d[k];
    }
    activeProcessHash = location.hash;
    pending.current = {
      path,
      method,
      body: JSON.stringify(d),
      key: crypto.randomUUID(),
      version: record?.version ?? null,
    };
    void send();
  }
  const field = (name: string, label: string, value = "", required = true) => (
    <label key={name}>
      {label}
      <input
        name={name}
        defaultValue={value}
        required={required}
        maxLength={2000}
      />
    </label>
  );
  return (
    <section ref={container} className="card">
      <h2>Procesos e historia</h2>
      {canWrite && (
        <div className="actions">
          {(resource === "funcionarios"
            ? ["funcionario", ...(record ? ["pertenencia", "estado"] : [])]
            : resource === "bienes" && record
              ? [
                  "asignacion",
                  "devolucion",
                  "traslado",
                  "condicion",
                  "baja",
                  "reactivacion",
                  "anotacion",
                ]
              : []
          ).map((x) => (
            <button
              key={x}
              disabled={busy || uncertain}
              onClick={() => void choose(x)}
            >
              {(
                {
                  funcionario: record
                    ? "Editar funcionario"
                    : "Nuevo funcionario",
                  pertenencia: "Cambiar unidad",
                  estado: record?.activo
                    ? "Inactivar funcionario"
                    : "Reactivar funcionario",
                  anotacion: "Anotar corrección",
                } as Row
              )[x] ?? x}
            </button>
          ))}
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {uncertain && (
        <>
          <p>
            Resultado incierto. Conserva esta página; reintenta la misma
            operación o concilia antes de repetirla.
          </p>
          <button disabled={busy} onClick={() => void send()}>
            Reintentar proceso
          </button>
        </>
      )}
      {op && (
        <form onSubmit={submit} key={op + JSON.stringify(editing)}>
          <fieldset disabled={busy || uncertain}>
            <legend>{op} · fecha automática UTC</legend>
            {op === "funcionario" && (
              <>
                <label>
                  Tipo de documento
                  <select
                    name="documento_tipo"
                    defaultValue={editing?.documento_tipo ?? "ID"}
                  >
                    <option>ID</option>
                    <option>RUT</option>
                  </select>
                </label>
                {field("documento", "RUT / ID", editing?.documento)}
                {field("nombre", "Nombre del funcionario", editing?.nombre)}
                {field("cargo", "Cargo", editing?.cargo)}
                {field(
                  "correo",
                  "Correo opcional",
                  editing?.correo ?? "",
                  false,
                )}
              </>
            )}
            {(op === "pertenencia" || (op === "funcionario" && !record)) && (
              <>
                <label>
                  Unidad destino
                  <select name="unidad_id" required>
                    <option value="">Selecciona unidad</option>
                    {units
                      .filter((u) => u.activa)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nombre}
                        </option>
                      ))}
                  </select>
                </label>
                {unitCursor && (
                  <button
                    type="button"
                    onClick={() =>
                      void api(
                        "unidades?limit=100&cursor=" +
                          encodeURIComponent(unitCursor),
                      )
                        .then((r) => {
                          setUnits((x) => [...x, ...r.body.items]);
                          setUnitCursor(r.body.nextCursor);
                        })
                        .catch((e) => setError(message(e)))
                    }
                  >
                    Más unidades
                  </button>
                )}
              </>
            )}
            {(op === "asignacion" || op === "traslado") &&
              field("destino", "Referencia de funcionario destino")}
            {(op === "devolucion" || op === "traslado") &&
              field(
                "origenEsperado",
                "Referencia de custodio actual",
                history?.vigentes[0]?.funcionario_id ?? "",
              )}
            {op === "condicion" && (
              <label>
                Nueva condición
                <select name="condicion">
                  <option>bueno</option>
                  <option>regular</option>
                  <option>malo</option>
                </select>
              </label>
            )}
            {op === "anotacion" && (
              <>
                {field("movimiento", "Movimiento original")}
                {field("texto", "Texto de corrección")}
              </>
            )}
            {[
              "asignacion",
              "devolucion",
              "traslado",
              "condicion",
              "baja",
              "reactivacion",
            ].includes(op) &&
              field(
                "corrige_id",
                "Movimiento que compensa (opcional)",
                "",
                false,
              )}
            {field("motivo", "Motivo del proceso")}
            <label>
              <input type="checkbox" name="confirmacion" required />
              Confirmo el proceso y su motivo
            </label>
            <button>Confirmar proceso</button>
            <button
              type="button"
              onClick={() => {
                setOp("");
                setError("");
              }}
            >
              Cancelar proceso
            </button>
          </fieldset>
        </form>
      )}
      {history && (
        <>
          <p>
            Historia UTC. La unidad actual del custodio puede diferir de la
            instantánea del movimiento.
          </p>
          {["custodias", "pertenencias", "movimientos", "anotaciones"].map(
            (k) => (
              <div key={k}>
                <h3>{k}</h3>
                {history[k].length ? (
                  <div className="table">
                    <table aria-label={k}>
                      <tbody>
                        {history[k].map((r: Row) => (
                          <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>
                              {Object.entries(r)
                                .filter(([key]) => key !== "id")
                                .map(
                                  ([key, value]) =>
                                    `${({ bien_id: "Bien", funcionario_id: "Funcionario", inicio_en: "Inicio UTC", fin_en: "Fin UTC", nombre: "Nombre", unidad_id: "Unidad actual", unidad_actual: "Nombre unidad actual", tipo: "Operación", origen_id: "Origen", destino_id: "Destino", unidad_origen_nombre: "Unidad de origen", unidad_destino_nombre: "Unidad de destino", condicion_anterior: "Condición anterior", condicion_nueva: "Condición nueva", corrige_id: "Compensa movimiento", efectiva_en: "Fecha efectiva UTC", registrada_en: "Fecha de registro UTC", unidad_nombre: "Unidad histórica", movimiento_id: "Movimiento original", texto: "Anotación", motivo: "Motivo" } as Row)[key] ?? key}: ${value ?? "—"}`,
                                )
                                .join(" · ")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Sin registros</p>
                )}
                {history.next[k] && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      void api(
                        `${resource}/${record!.id}/historia?${k}=${history.next[k]}`,
                      )
                        .then((r) =>
                          setHistory((h) =>
                            h
                              ? {
                                  ...h,
                                  [k]: [...h[k], ...r.body[k]],
                                  next: { ...h.next, [k]: r.body.next[k] },
                                }
                              : h,
                          ),
                        )
                        .catch((e) => {
                          setError(message(e));
                          if (e.status === 401) onExpired();
                        })
                    }
                  >
                    Más {k}
                  </button>
                )}
              </div>
            ),
          )}
        </>
      )}
    </section>
  );
}
