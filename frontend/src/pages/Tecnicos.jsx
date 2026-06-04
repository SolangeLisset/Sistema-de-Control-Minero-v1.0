import { useState, useEffect } from "react";
import { getTecnicos, createTecnico, updateTecnico, deleteTecnico } from "../services/api";
import { useToast } from "../components/Toast";

const ESPECIALIDADES = [
  "Mecánica Pesada", "Mecánica de Precisión", "Electricidad Industrial",
  "Hidráulica y Neumática", "Soldadura", "Instrumentación", "Lubricación", "Otro"
];

function TecnicoModal({ tecnico, onClose, onSaved }) {
  const { addToast } = useToast();
  const [form, setForm] = useState(
    tecnico || { nombre: "", especialidad: ESPECIALIDADES[0], telefono: "", activo: 1 }
  );
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? (e.target.checked ? 1 : 0) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (tecnico) {
        await updateTecnico(tecnico.id, form);
        addToast("Técnico actualizado", "success");
      } else {
        await createTecnico(form);
        addToast("Técnico creado correctamente", "success");
      }
      onSaved();
    } catch (err) {
      addToast(err.response?.data?.error || "Error al guardar técnico", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{tecnico ? "✏️ Editar Técnico" : "➕ Nuevo Técnico"}</h3>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nombre completo *</label>
              <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} placeholder="Ej: Juan Pérez Mamani" required />
            </div>
            <div className="form-group">
              <label className="form-label">Especialidad *</label>
              <select name="especialidad" className="form-control" value={form.especialidad} onChange={handleChange}>
                {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input name="telefono" className="form-control" value={form.telefono || ""} onChange={handleChange} placeholder="+56 9 XXXX XXXX" />
            </div>
            {tecnico && (
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" id="activo" name="activo" checked={form.activo === 1} onChange={handleChange} />
                <label htmlFor="activo" style={{ fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
                  Técnico activo
                </label>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : tecnico ? "Actualizar" : "Crear Técnico"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Tecnicos() {
  const { addToast } = useToast();
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);

  const fetchTecnicos = () => {
    setLoading(true);
    getTecnicos()
      .then((res) => setTecnicos(res.data))
      .catch(() => addToast("Error al cargar técnicos", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTecnicos(); }, []);

  const handleDelete = async (tec) => {
    if (!confirm(`¿Eliminar al técnico ${tec.nombre}?`)) return;
    try {
      await deleteTecnico(tec.id);
      addToast("Técnico eliminado", "success");
      fetchTecnicos();
    } catch {
      addToast("Error al eliminar técnico", "error");
    }
  };

  const filtered = tecnicos.filter((t) =>
    [t.nombre, t.especialidad, t.telefono || ""]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const activos = tecnicos.filter((t) => t.activo).length;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <span className="title-icon">👷</span>
          <div>
            <h2>Técnicos</h2>
            <p className="page-subtitle">{activos} activos de {tecnicos.length} registrados</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="search-bar">
            <span className="icon">🔍</span>
            <input placeholder="Buscar técnico..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setModal("crear")}>
            ➕ Nuevo Técnico
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /> Cargando técnicos...</div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">👷</div>
            <h3>Sin técnicos</h3>
            <p>{search ? "No hay coincidencias" : "Registra el primer técnico"}</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tec, i) => (
                <tr key={tec.id}>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>{i + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "var(--yellow-glow)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, flexShrink: 0
                      }}>👷</div>
                      <strong>{tec.nombre}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-blue">{tec.especialidad}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    {tec.telefono || <span style={{ color: "var(--text-muted)" }}>—</span>}
                  </td>
                  <td>
                    {tec.activo
                      ? <span className="badge badge-green">🟢 Activo</span>
                      : <span className="badge badge-gray">⚫ Inactivo</span>}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: 12 }}>
                    {new Date(tec.creado_en).toLocaleDateString("es-CL")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(tec)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(tec)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <TecnicoModal
          tecnico={modal === "crear" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); fetchTecnicos(); }}
        />
      )}
    </div>
  );
}
