import { useState, useEffect } from "react";
import { getEquipos, createEquipo, updateEquipo, deleteEquipo, getEquipoMantenciones } from "../services/api";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

const ESTADOS = ["operativo", "mantencion", "falla", "inactivo"];
const TIPOS = ["Camión de extracción", "Perforadora", "Excavadora", "Cargador frontal", "Bulldozer", "Grúa", "Compresora", "Otro"];

const estadoBadge = (e) => {
  const map = { operativo: "badge-green", mantencion: "badge-yellow", falla: "badge-red", inactivo: "badge-gray" };
  return map[e] || "badge-gray";
};

const estadoIcon = (e) => {
  const map = { operativo: "🟢", mantencion: "🟡", falla: "🔴", inactivo: "⚫" };
  return map[e] || "⚪";
};

function EquipoModal({ equipo, onClose, onSaved }) {
  const { addToast } = useToast();
  const [form, setForm] = useState(
    equipo || { codigo: "", nombre: "", tipo: TIPOS[0], estado: "operativo", ubicacion: "" }
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (equipo) {
        await updateEquipo(equipo.id, form);
        addToast("Equipo actualizado correctamente", "success");
      } else {
        await createEquipo(form);
        addToast("Equipo creado correctamente", "success");
      }
      onSaved();
    } catch (err) {
      addToast(err.response?.data?.error || "Error al guardar equipo", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{equipo ? "✏️ Editar Equipo" : "➕ Nuevo Equipo"}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Código *</label>
                <input name="codigo" className="form-control" value={form.codigo} onChange={handleChange} placeholder="Ej: CAM-001" required />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select name="estado" className="form-control" value={form.estado} onChange={handleChange}>
                  {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nombre del equipo *</label>
              <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} placeholder="Ej: Camión Komatsu 830E" required />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select name="tipo" className="form-control" value={form.tipo} onChange={handleChange}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Ubicación *</label>
              <input name="ubicacion" className="form-control" value={form.ubicacion} onChange={handleChange} placeholder="Ej: Pit Norte — Nivel 3480" required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : equipo ? "Actualizar" : "Crear Equipo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HistorialModal({ equipo, onClose }) {
  const { addToast } = useToast();
  const [mantenciones, setMantenciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEquipoMantenciones(equipo.id)
      .then((res) => setMantenciones(res.data))
      .catch(() => addToast("Error al cargar historial de mantenciones", "error"))
      .finally(() => setLoading(false));
  }, [equipo.id]);

  const getPriorityStyle = (priority) => {
    const map = { alta: "badge-red", normal: "badge-yellow", baja: "badge-blue" };
    return map[priority] || "badge-gray";
  };

  const getStatusClass = (status) => {
    const map = { terminado: "terminado", "en proceso": "en-proceso", pendiente: "pendiente" };
    return map[status] || "pendiente";
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 650 }}>
        <div className="modal-header">
          <div>
            <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>📅 Historial de Mantenimiento</span>
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
              Equipo: <strong style={{ color: "var(--yellow)" }}>{equipo.codigo}</strong> — {equipo.nombre}
            </p>
          </div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {loading ? (
            <div className="loading"><div className="spinner" /> Cargando historial...</div>
          ) : mantenciones.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 0" }}>
              <div className="empty-icon">🔧</div>
              <h3>Sin registros</h3>
              <p>Este equipo aún no registra órdenes de mantención en el sistema.</p>
            </div>
          ) : (
            <div className="timeline">
              {mantenciones.map((m) => (
                <div key={m.id} className={`timeline-item ${getStatusClass(m.estado)}`}>
                  <div className="timeline-marker" />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-title">🔧 {m.tipo}</span>
                      <span className="timeline-date">
                        {m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleDateString("es-CL") : "Sin fecha"}
                      </span>
                    </div>
                    <p className="timeline-body">{m.descripcion || "Sin descripción detallada del trabajo."}</p>
                    <div className="timeline-footer">
                      <div className="timeline-tech">
                        <span>👤 Técnico:</span>
                        <strong style={{ color: "var(--text-primary)" }}>
                          {m.tecnico_nombre || "No asignado"}
                        </strong>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <span className={`timeline-badge badge ${getPriorityStyle(m.prioridad)}`}>
                          {m.prioridad}
                        </span>
                        <span className={`timeline-badge badge ${
                          m.estado === "terminado" ? "badge-green" : m.estado === "en proceso" ? "badge-yellow" : "badge-red"
                        }`}>
                          {m.estado}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default function Equipos() {
  const { addToast } = useToast();
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [modal, setModal] = useState(null); // null | "crear" | equipo
  const [confirmar, setConfirmar] = useState(null); // equipo a eliminar
  const [historial, setHistorial] = useState(null); // equipo a ver historial

  const fetchEquipos = () => {
    setLoading(true);
    getEquipos()
      .then((res) => setEquipos(res.data))
      .catch(() => addToast("Error al cargar equipos", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEquipos(); }, []);

  const handleDelete = async () => {
    try {
      await deleteEquipo(confirmar.id);
      addToast("Equipo eliminado", "success");
      setConfirmar(null);
      fetchEquipos();
    } catch {
      addToast("Error al eliminar equipo", "error");
    }
  };

  const filtered = equipos.filter((e) => {
    const matchSearch = [e.codigo, e.nombre, e.ubicacion, e.tipo]
      .join(" ").toLowerCase().includes(search.toLowerCase());
    const matchEstado = filterEstado === "todos" || e.estado === filterEstado;
    return matchSearch && matchEstado;
  });

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <span className="title-icon">🚛</span>
          <div>
            <h2>Equipos</h2>
            <p className="page-subtitle">{equipos.length} equipos registrados</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div className="search-bar">
            <span className="icon">🔍</span>
            <input placeholder="Buscar equipo..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-control" style={{ width: "auto" }} value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
            <option value="todos">Todos los estados</option>
            {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className="btn btn-primary" onClick={() => setModal("crear")}>
            ➕ Nuevo Equipo
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Cargando equipos...</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🚛</div>
            <h3>Sin equipos</h3>
            <p>{search ? "No hay coincidencias con tu búsqueda" : "Crea el primer equipo del sistema"}</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Ubicación</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq) => (
                <tr key={eq.id}>
                  <td><strong style={{ color: "var(--yellow)", fontFamily: "monospace" }}>{eq.codigo}</strong></td>
                  <td>{eq.nombre}</td>
                  <td><span style={{ color: "var(--text-secondary)" }}>{eq.tipo}</span></td>
                  <td>
                    <span className={`badge ${estadoBadge(eq.estado)}`}>
                      {estadoIcon(eq.estado)} {eq.estado}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>📍 {eq.ubicacion}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {new Date(eq.creado_en).toLocaleDateString("es-CL")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setHistorial(eq)} title="Ver Historial">📅</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(eq)} title="Editar">✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmar(eq)} title="Eliminar">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <EquipoModal
          equipo={modal === "crear" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchEquipos(); }}
        />
      )}

      {confirmar && (
        <ConfirmModal
          title="Eliminar Equipo"
          message={`¿Estás seguro que deseas eliminar el equipo ${confirmar.codigo} — ${confirmar.nombre}? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmar(null)}
        />
      )}

      {historial && (
        <HistorialModal
          equipo={historial}
          onClose={() => setHistorial(null)}
        />
      )}
    </div>
  );
}
