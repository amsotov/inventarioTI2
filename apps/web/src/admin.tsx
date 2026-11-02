import React, { useEffect, useRef, useState } from "react";
import { api, message } from "./api";
import { Notifications } from "./notifications";
type Row = Record<string, any>;
export function Admin({
  csrf,
  onExpired,
}: {
  csrf: string;
  onExpired: () => void;
}) {
  const [tab, setTab] = useState("cuentas"),
    [rows, setRows] = useState<Row[]>([]),
    [editing, setEditing] = useState<Row | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0),
    [cursor, setCursor] = useState<string | null>(null),
    [next, setNext] = useState<string | null>(null);
  const pending = useRef<{
    path: string;
    method: string;
    body: string;
    key: string;
    version?: string;
  } | null>(null);
  const [uncertain, setUncertain] = useState(false);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    setRows([]);
    setEditing(null);
    if (tab === "entregas") {
      setLoading(false);
      return;
    }
    api(
      "admin/" + tab + (cursor ? "?cursor=" + encodeURIComponent(cursor) : ""),
    )
      .then((r) => {
        if (live) {
          setRows(r.body.items);
          setNext(r.body.nextCursor);
        }
      })
      .catch((e) => {
        if (live) {
          setError(message(e));
          if (e.status === 401) onExpired();
        }
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [tab, revision, cursor]);
  useEffect(() => {
    const capture = (e: MouseEvent) => {
      if (pending.current && (e.target as Element).closest("a")) {
        e.preventDefault();
        setError(
          "Concilia o reintenta la operación pendiente antes de navegar.",
        );
      }
    };
    document.addEventListener("click", capture, true);
    const warn = (e: BeforeUnloadEvent) => {
      if (pending.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", capture, true);
    };
  }, []);
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
          method: p.method,
          body: p.body,
          headers: {
            "Idempotency-Key": p.key,
            ...(p.version ? { "If-Match": '"v' + p.version + '"' } : {}),
          },
        },
        csrf,
      );
      pending.current = null;
      setUncertain(false);
      setNotice("Cambio guardado y auditado.");
      setRevision((x) => x + 1);
    } catch (e: any) {
      setError(message(e));
      if (e.status === 401) onExpired();
      if (!e.status || e.status >= 500) {
        setUncertain(true);
      } else {
        pending.current = null;
        setUncertain(false);
      }
    } finally {
      setBusy(false);
    }
  }
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending.current) return;
    const d = Object.fromEntries(new FormData(e.currentTarget));
    const data: Row = { ...d, confirmado: true };
    if (tab === "unidades" && editing) data.activa = d.activa === "true";
    if (tab === "cuentas" && editing) data.forzar = d.forzar === "on";
    delete data.confirmacion;
    pending.current = {
      path:
        "admin/" + tab + (editing && tab !== "avisos" ? "/" + editing.id : ""),
      method: editing && tab !== "avisos" ? "PATCH" : "POST",
      body: JSON.stringify(data),
      key: crypto.randomUUID(),
      version: editing?.version,
    };
    void send();
  }
  if (tab === "entregas")
    return <Notifications csrf={csrf} onExpired={onExpired} onBack={() => setTab("avisos")} />;
  return (
    <section className="card admin-panel">
      <h1>Administración</h1>
      <p>Cuentas separadas de funcionarios · dos roles · zona UTC</p>
      <nav aria-label="Administración">
        {["cuentas", "unidades", "avisos", "entregas"].map((t) => (
          <button
            key={t}
            disabled={busy || uncertain}
            aria-pressed={tab === t}
            onClick={() => {
              setLoading(true);
              setTab(t);
              setCursor(null);
              setNotice("");
            }}
          >
            {t === "entregas"
              ? "Seguimiento de avisos"
              : t === "avisos"
                ? "Parámetros de avisos"
                : t === "cuentas"
                  ? "Cuentas"
                  : "Catálogo de unidades"}
          </button>
        ))}
      </nav>
      {error && <p role="alert">{error}</p>}
      {notice && <p role="status">{notice}</p>}
      {uncertain && (
        <p role="alert">
          Resultado incierto. Conserva esta página y reintenta la misma
          operación antes de efectuar otro cambio.{" "}
          <button onClick={() => void send()} disabled={busy}>
            Reintentar operación
          </button>
        </p>
      )}
      {loading ? (
        <p role="status">Cargando administración…</p>
      ) : (
        <>
          <button
            disabled={busy || uncertain}
            onClick={() => setRevision((x) => x + 1)}
          >
            Recargar administración
          </button>
          {rows.length === 0 ? (
            <p role="status">Sin registros administrativos.</p>
          ) : (
            <div
              className="table"
              role="region"
              aria-label="Registros administrativos"
              tabIndex={0}
            >
              <table>
                <caption>
                  {tab === "cuentas"
                    ? "Cuentas de acceso"
                    : tab === "unidades"
                      ? "Unidades registradas"
                      : "Destinatario vigente"}
                </caption>
                <thead>
                  <tr>
                    <th>Nombre / destino</th>
                    <th>Estado / rol</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={String(r.id)}>
                      <td>
                        {r.nombre ?? r.destinatario}
                        {r.correo && <small> · {r.correo}</small>}
                      </td>
                      <td>
                        {r.estado ??
                          (r.activa === undefined
                            ? "Vigente"
                            : r.activa
                              ? "Activa"
                              : "Inactiva")}{" "}
                        {r.rol}
                      </td>
                      <td>
                        <button
                          disabled={busy || uncertain}
                          onClick={() => {
                            setEditing(r);
                            setError("");
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {cursor && (
            <button
              disabled={busy || uncertain}
              onClick={() => setCursor(null)}
            >
              Primera página
            </button>
          )}
          {next && (
            <button
              disabled={busy || uncertain}
              onClick={() => setCursor(next)}
            >
              Siguiente página
            </button>
          )}
          <h2>
            {editing
              ? "Editar registro"
              : tab === "avisos"
                ? "Configurar avisos"
                : "Nuevo registro"}
          </h2>
          {tab === "avisos" && rows.length > 0 && !editing ? (
            <p>Selecciona Editar para cargar la versión vigente.</p>
          ) : (
            <form key={tab + editing?.id + revision} onSubmit={submit}>
              <fieldset disabled={busy || uncertain}>
                <legend>
                  {editing
                    ? "Datos vigentes y cambio solicitado"
                    : "Datos del alta"}
                </legend>
                {tab === "avisos" ? (
                  <label>
                    Destinatario
                    <input
                      name="destinatario"
                      type="email"
                      required
                      maxLength={320}
                      defaultValue={editing?.destinatario ?? ""}
                    />
                  </label>
                ) : (
                  <label>
                    Nombre
                    <input
                      name="nombre"
                      required
                      maxLength={200}
                      defaultValue={editing?.nombre ?? ""}
                    />
                  </label>
                )}
                {tab === "cuentas" && (
                  <>
                    {!editing && (
                      <label>
                        Correo de la cuenta
                        <input
                          name="correo"
                          type="email"
                          required
                          maxLength={320}
                        />
                      </label>
                    )}
                    <label>
                      Rol
                      <select
                        name="rol"
                        defaultValue={editing?.rol ?? "lectura"}
                      >
                        <option value="lectura">Lectura</option>
                        <option value="administrador">Administrador</option>
                      </select>
                    </label>
                    {editing && (
                      <>
                        <label>
                          Estado
                          <select name="estado" defaultValue={editing.estado}>
                            {["pendiente", "activa", "inactiva"].map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <input name="forzar" type="checkbox" />
                          Exigir cambio de contraseña (bloquea el acceso hasta
                          completar recuperación)
                        </label>
                      </>
                    )}
                  </>
                )}
                {tab === "unidades" && editing && (
                  <label>
                    Estado de unidad
                    <select name="activa" defaultValue={String(editing.activa)}>
                      <option value="true">Activa</option>
                      <option value="false">Inactiva</option>
                    </select>
                  </label>
                )}
                <label>
                  Motivo
                  <textarea name="motivo" required maxLength={2000} />
                </label>
                <label>
                  <input name="confirmacion" type="checkbox" required />
                  Confirmo el cambio y su motivo
                </label>
                <button>Guardar cambio</button>{" "}
                <button type="button" onClick={() => setEditing(null)}>
                  Cancelar
                </button>
              </fieldset>
            </form>
          )}
          {tab === "cuentas" && editing && (
            <button
              disabled={busy || uncertain}
              onClick={async () => {
                if (
                  !window.confirm(
                    "¿Solicitar un enlace de acceso para esta cuenta? No implica correo enviado.",
                  )
                )
                  return;
                setBusy(true);
                setError("");
                try {
                  const r = await api(
                    "admin/cuentas/" + editing.id + "/enlace",
                    {
                      method: "POST",
                      body: JSON.stringify({ confirmado: true }),
                    },
                    csrf,
                  );
                  setNotice(r.body.message);
                } catch (e: any) {
                  setError(message(e));
                  if (e.status === 401) onExpired();
                } finally {
                  setBusy(false);
                }
              }}
            >
              Solicitar invitación o recuperación
            </button>
          )}
          <p>
            El propio registro está protegido. No se puede degradar, desactivar
            ni bloquear al último administrador habilitado. Los avisos quedan
            pendientes; este panel no los envía.
          </p>
          <p>
            Sesión: 30 minutos de inactividad / 8 horas absolutas. Respaldo
            definido: semanal, UTC; operación pendiente.
          </p>
        </>
      )}
    </section>
  );
}
