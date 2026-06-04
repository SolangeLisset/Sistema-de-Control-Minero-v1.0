import { useState, useEffect } from "react";
import {
  getMantenciones, createMantencion, updateMantencion, deleteMantencion
} from "../services/api";
import { getEquipos } from "../services/api";
import { getTecnicos } from "../services/api";
import { useToast } from "../components/Toast";

const ESTADOS  = ["pendiente", "en proceso", "terminado"];
const TIPOS    = ["Preventiva", "Correctiva", "Predictiva", "Inspección", "Cambio de aceite", "Reparación mayor", "Otro"];
const PRIORIDADES = ["baja", "normal", "alta"];

const estadoBadge = (e) => {
  const map = { pendiente: "badge-orange", "en proceso": "badge-blue", terminado: "badge-green" };
  return map[e] || "badge-gray";
};
const prioridadBadge = (p) => {
  const map = { alta: "badge-red", normal: "badge-blue", baja: "badge-gray" };
  return map[p] || "badge-gray";
};
const prioridadIcon = (p) => ({ alta: "🔴", normal: "🟡", baja: "🟢" }[p] || "⚪");

function MantencionModal({ mantencion, equipos, tecnicos, onClose, onSaved }) {
  const { addToast } = useToast();
  const [form, setForm] = useState(
    mantencion
      ? { ...mantencion }
      : {
          equipo_id: equipos[0]?.id || "",
          tecnico_id: "",
          tipo: TIPOS[0],
          descripcion: "",
          estado: "pendiente",
          prioridad: "normal",
          fecha_inicio: "",
          fecha_fin: "",
        }
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, tecnico_id: form.tecnico_id || null };
      if (mantencion) {
        await updateMantencion(mantencion.id, payload);
        addToast("Mantención actualizada", "success");
      } else {
        await createMantencion(payload);
        addToast("Orden de mantención creada", "success");
      }
      onSaved();
    } catch (err) {
      addToast(err.response?.data?.error || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <h3>{mantencion ? "✏️ Editar Mantención" : "➕ Nueva Orden de Mantención"}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Equipo *</label>
                <select name="equipo_id" className="form-control" value={form.equipo_id} onChange={handleChange} required>
                  <option value="">— Seleccionar —</option>
                  {equipos.map((eq) => (
                    <option key={eq.id} value={eq.id}>{eq.codigo} — {eq.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Técnico asignado</label>
                <select name="tecnico_id" className="form-control" value={form.tecnico_id || ""} onChange={handleChange}>
                  <option value="">Sin asignar</option>
                  {tecnicos.filter((t) => t.activo).map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Tipo de mantención</label>
                <select name="tipo" className="form-control" value={form.tipo} onChange={handleChange}>
                  {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Prioridad</label>
                <select name="prioridad" className="form-control" value={form.prioridad} onChange={handleChange}>
                  {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select name="estado" className="form-control" value={form.estado} onChange={handleChange}>
                {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción / Observaciones</label>
              <textarea
                name="descripcion"
                className="form-control"
                rows={3}
                value={form.descripcion || ""}
                onChange={handleChange}
                placeholder="Detalle del trabajo a realizar..."
                style={{ resize: "vertical" }}
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Fecha inicio</label>
                <input type="date" name="fecha_inicio" className="form-control"
                  value={form.fecha_inicio ? form.fecha_inicio.split("T")[0] : ""}
                  onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Fecha término</label>
                <input type="date" name="fecha_fin" className="form-control"
                  value={form.fecha_fin ? form.fecha_fin.split("T")[0] : ""}
                  onChange={handleChange} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : mantencion ? "Actualizar" : "Crear Orden"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Mantenciones() {
  const { addToast } = useToast();
  const [mantenciones, setMantenciones] = useState([]);
  const [equipos, setEquipos]   = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [filterPrioridad, setFilterPrioridad] = useState("todas");
  const [modal, setModal]       = useState(null);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([getMantenciones(), getEquipos(), getTecnicos()])
      .then(([mRes, eRes, tRes]) => {
        setMantenciones(mRes.data);
        setEquipos(eRes.data);
        setTecnicos(tRes.data);
      })
      .catch(() => addToast("Error al cargar datos", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const handleDelete = async (m) => {
    if (!confirm(`¿Eliminar esta orden de mantención?`)) return;
    try {
      await deleteMantencion(m.id);
      addToast("Mantención eliminada", "success");
      fetchAll();
    } catch {
      addToast("Error al eliminar", "error");
    }
  };

  const filtered = mantenciones.filter((m) => {
    const matchSearch = [m.equipo_codigo, m.equipo_nombre, m.tecnico_nombre || "", m.tipo, m.descripcion || ""]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === "todos" || m.estado === filterEstado;
    const matchPrio   = filterPrioridad === "todas" || m.prioridad === filterPrioridad;
    return matchSearch && matchEstado && matchPrio;
  });

  const pendientes  = mantenciones.filter((m) => m.estado === "pendiente").length;
  const enProceso   = mantenciones.filter((m) => m.estado === "en proceso").length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <span className="title-icon">🔧</span>
          <div>
            <h2>Mantenciones</h2>
            <p className="page-subtitle">
              {pendientes} pendientes · {enProceso} en proceso · {mantenciones.length} total
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="search-bar">
            <span className="icon">🔍</span>
            <input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: "auto" }} value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-control" style={{ width: "auto" }} value={filterPrioridad} onChange={(e) => setFilterPrioridad(e.target.value)}>
            <option value="todas">Todas las prioridades</option>
            {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setModal("crear")} disabled={equipos.length === 0}>
            ➕ Nueva Orden
          </button>
        </div>
      </div>

      {equipos.length === 0 && !loading && (
        <div className="card" style={{ marginBottom: 16, borderColor: "var(--yellow)", background: "var(--yellow-glow)" }}>
          <p style={{ fontSize: 13, color: "var(--yellow)" }}>
            ⚠️ Debes registrar al menos un equipo antes de crear órdenes de mantención.
          </p>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /> Cargando mantenciones...</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🔧</div>
            <h3>Sin órdenes de mantención</h3>
            <p>{search ? "Sin coincidencias con tu búsqueda" : "Crea la primera orden de trabajo"}</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Equipo</th>
                <th>Tipo</th>
                <th>Técnico</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha Inicio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>#{m.id}</td>
                  <td>
                    <div>
                      <strong style={{ color: "var(--yellow)", fontFamily: "monospace" }}>{m.equipo_codigo}</strong>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{m.equipo_nombre}</div>
                    </div>
                  </td>
                  <td>{m.tipo}</td>
                  <td style={{ color: m.tecnico_nombre ? "var(--text-primary)" : "var(--text-muted)", fontSize: 13 }}>
                    {m.tecnico_nombre ? `👷 ${m.tecnico_nombre}` : "Sin asignar"}
                  </td>
                  <td><span className={`badge ${estadoBadge(m.estado)}`}>{m.estado}</span></td>
                  <td>
                    <span className={`badge ${prioridadBadge(m.prioridad)}`}>
                      {prioridadIcon(m.prioridad)} {m.prioridad}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {m.fecha_inicio
                      ? new Date(m.fecha_inicio).toLocaleDateString("es-CL")
                      : <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(m)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <MantencionModal
          mantencion={modal === "crear" ? null : modal}
          equipos={equipos}
          tecnicos={tecnicos}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchAll(); }}
        />
      )}
    </div>
  );
}
