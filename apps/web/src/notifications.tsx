import React, { useEffect, useRef, useState } from "react";
import { api, message } from "./api";
type Notice = {
  id: string;
  destinatario: string;
  proposito: string;
  estado: string;
  version: string;
  intentos: number;
  ciclo_intentos: number;
  siguiente_en: string;
  creado_en: string;
  proveedor_ref: string | null;
  ultimo_error_codigo: string | null;
  attempts?: {
    numero: number;
    resultado: string;
    codigo: string | null;
    registrado_en: string;
  }[];
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
export function Notifications({
  csrf,
  onExpired,
  onBack,
}: {
  csrf: string;
  onExpired: () => void;
  onBack: () => void;
}) {
  const [rows, setRows] = useState<Notice[]>([]),
    [state, setState] = useState(""),
    [cursor, setCursor] = useState<string | null>(null),
    [next, setNext] = useState<string | null>(null),
    [selected, setSelected] = useState<Notice | null>(null),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(false),
    [uncertain, setUncertain] = useState(false),
    [revision, setRevision] = useState(0),
    [action, setAction] = useState("");
  const pending = useRef<{
    path: string;
    body: string;
    key: string;
    version: string;
  } | null>(null);
  function failure(e: unknown) {
    setError(message(e));
    if ((e as { status?: number }).status === 401) onExpired();
  }
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    setRows([]);
    setSelected(null);
    const query = new URLSearchParams();
    if (state) query.set("estado", state);
    if (cursor) query.set("cursor", cursor);
    api("avisos?" + query)
      .then((r) => {
        if (live) {
          setRows(r.body.items);
          setNext(r.body.nextCursor);
        }
      })
      .catch((e) => {
        if (live) failure(e);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [state, cursor, revision]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (pending.current) e.preventDefault();
    };
    const capture = (e: MouseEvent) => {
      if (pending.current && (e.target as Element).closest("a")) {
        e.preventDefault();
        setError("Resuelve la operación pendiente antes de navegar.");
      }
    };
    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", capture, true);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", capture, true);
    };
  }, []);
  async function detail(id: string) {
    setBusy(true);
    setError("");
    setSelected(null);
    try {
      const r = await api("avisos/" + id);
      setSelected(r.body);
      setAction(
        r.body.estado === "pendiente"
          ? "cancelar"
          : r.body.estado === "fallido"
            ? "reintentar"
            : "conciliar",
      );
    } catch (e) {
      failure(e);
    } finally {
      setBusy(false);
    }
  }
  async function send() {
    const p = pending.current;
    if (!p) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await api(
        p.path,
        {
          method: "POST",
          body: p.body,
          headers: {
            "Idempotency-Key": p.key,
            "If-Match": '"v' + p.version + '"',
          },
        },
        csrf,
      );
      pending.current = null;
      setUncertain(false);
      setSelected(null);
      setNotice("Acción registrada y auditada.");
      setRevision((x) => x + 1);
    } catch (e) {
      failure(e);
      if (
        !(e as { status?: number }).status ||
        (e as { status: number }).status >= 500
      )
        setUncertain(true);
      else {
        pending.current = null;
        setUncertain(false);
      }
    } finally {
      setBusy(false);
    }
  }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected || pending.current) return;
    const d = Object.fromEntries(new FormData(e.currentTarget));
    delete d.confirmacion;
    pending.current = {
      path: "avisos/" + selected.id + "/acciones",
      body: JSON.stringify({ ...d, accion: action, confirmado: true }),
      key: crypto.randomUUID(),
      version: selected.version,
    };
    void send();
  }
  const locked = busy || uncertain;
  return (
    <section className="card admin-panel notifications-panel">
      <h1>Seguimiento de avisos</h1>
      <button disabled={locked} onClick={onBack}>
        Volver a parámetros y cuentas
      </button>
      <p>
        Fechas en UTC. Aceptado por el proveedor no acredita entrega ni lectura.
      </p>
      <p>
        Invitaciones, recuperación y MFA se gestionan por el canal de acceso del
        titular.
      </p>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {uncertain && (
        <p role="alert">
          La respuesta de esta acción es incierta. Conserva esta página y
          recupera el resultado con la misma operación.{" "}
          <button disabled={busy} onClick={() => void send()}>
            Recuperar resultado de la acción
          </button>
        </p>
      )}
      <label>
        Estado del aviso
        <select
          aria-label="Estado del aviso"
          disabled={locked}
          value={state}
          onChange={(e) => {
            setState(e.target.value);
            setCursor(null);
            setSelected(null);
          }}
        >
          <option value="">Todos los estados</option>
          {states.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </label>
      <button
        disabled={locked || loading}
        onClick={() => setRevision((x) => x + 1)}
      >
        Actualizar avisos
      </button>
      {loading ? (
        <p role="status">Cargando avisos…</p>
      ) : rows.length === 0 ? (
        <p role="status">Sin avisos para este filtro.</p>
      ) : (
        <div
          className="table"
          role="region"
          aria-label="Avisos registrados"
          tabIndex={0}
        >
          <table>
            <caption>Avisos empresariales</caption>
            <thead>
              <tr>
                <th>Referencia / propósito</th>
                <th>Destinatario fijado</th>
                <th>Estado / intentos</th>
                <th>Registro UTC</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.id}
                    <br />
                    {r.proposito}
                  </td>
                  <td>{r.destinatario}</td>
                  <td>
                    {r.estado} · {r.intentos}
                  </td>
                  <td>{r.creado_en}</td>
                  <td>
                    <button
                      disabled={locked}
                      onClick={() => void detail(r.id)}
                      aria-label={"Ver aviso " + r.id}
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="actions">
        <button
          disabled={locked || !cursor || loading}
          onClick={() => setCursor(null)}
        >
          Primera página de avisos
        </button>
        <button
          disabled={locked || !next || loading}
          onClick={() => setCursor(next)}
        >
          Siguiente página de avisos
        </button>
      </div>
      {selected && (
        <section aria-label="Detalle de aviso">
          <h2>Detalle del aviso</h2>
          <p>
            Referencia: {selected.id} · versión {selected.version}
          </p>
          <p>
            Destino original: {selected.destinatario} · Estado:{" "}
            {selected.estado}
          </p>
          <p>
            Intentos totales: {selected.intentos} · Intentos del ciclo:{" "}
            {selected.ciclo_intentos}/4
          </p>
          <p>
            Próximo intento UTC:{" "}
            {selected.estado === "pendiente"
              ? selected.siguiente_en
              : "No programado"}
          </p>
          <p>
            Resultado técnico:{" "}
            {selected.ultimo_error_codigo ?? "Sin error registrado"} ·
            Referencia del proveedor:{" "}
            {selected.proveedor_ref ?? "Sin referencia"}
          </p>
          {(selected.attempts ?? []).length === 0 ? (
            <p>Sin intentos registrados.</p>
          ) : (
            <ol>
              {selected.attempts!.map((a) => (
                <li key={a.numero}>
                  Intento {a.numero}: {a.resultado} · {a.codigo ?? "sin error"}{" "}
                  · {a.registrado_en}
                </li>
              ))}
            </ol>
          )}
          {selected.estado === "incierto" && (
            <p role="status">
              Verifica la evidencia del proveedor antes de conciliar. No se
              reenviará automáticamente.
            </p>
          )}
          {["pendiente", "fallido", "incierto", "aceptado"].includes(
            selected.estado,
          ) && (
            <form key={selected.id} onSubmit={submit}>
              <h3>Registrar acción administrativa</h3>
              <label>
                Acción sobre aviso
                <select
                  aria-label="Acción sobre aviso"
                  value={action}
                  disabled={locked}
                  onChange={(e) => setAction(e.target.value)}
                >
                  {selected.estado === "pendiente" && (
                    <option value="cancelar">Cancelar pendiente</option>
                  )}
                  {selected.estado === "fallido" && (
                    <>
                      <option value="reintentar">Reintentar fallo</option>
                      <option value="cancelar">Cancelar fallo</option>
                    </>
                  )}
                  {["incierto", "aceptado"].includes(selected.estado) && (
                    <option value="conciliar">Conciliar con evidencia</option>
                  )}
                </select>
              </label>
              {action === "conciliar" && (
                <>
                  <label>
                    Resultado verificado
                    <select
                      aria-label="Resultado verificado"
                      name="resultado"
                      required
                      disabled={locked}
                    >
                      {selected.estado === "incierto" && (
                        <option value="aceptado">Aceptado por proveedor</option>
                      )}
                      <option value="entregado">
                        Entregado según evidencia
                      </option>
                      {selected.estado === "incierto" && (
                        <option value="no_enviado">
                          Ausencia de envío confirmada
                        </option>
                      )}
                      <option value="permanente">
                        Fallo permanente confirmado
                      </option>
                    </select>
                  </label>
                  <label>
                    Evidencia de conciliación
                    <textarea
                      name="evidencia"
                      required
                      maxLength={2000}
                      disabled={locked}
                    />
                  </label>
                  <p>
                    Registra la referencia de evidencia verificada, sin
                    secretos. Confirmar ausencia de envío habilita un reintento
                    manual separado.
                  </p>
                </>
              )}
              <label>
                Motivo de la acción
                <textarea
                  name="motivo"
                  required
                  maxLength={2000}
                  disabled={locked}
                />
              </label>
              <label className="confirmation">
                <input
                  type="checkbox"
                  name="confirmacion"
                  required
                  disabled={locked}
                />
                Confirmo la acción sobre este aviso y su destinatario original
              </label>
              <div className="actions">
                <button type="submit" disabled={locked}>
                  Confirmar acción del aviso
                </button>
                <button
                  type="button"
                  disabled={locked}
                  onClick={() => setSelected(null)}
                >
                  Cerrar detalle
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </section>
  );
}
