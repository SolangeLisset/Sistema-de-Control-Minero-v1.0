import { useState, useEffect } from "react";
import {
  getMantenciones, createMantencion, updateMantencion, deleteMantencion
} from "../services/api";
import { getEquipos } from "../services/api";
import { getTecnicos } from "../services/api";
import { useToast } from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

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
  const [confirmar, setConfirmar] = useState(null);

  const printPDF = (m) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      addToast("Por favor, permite las ventanas emergentes (popups) para imprimir el reporte.", "error");
      return;
    }
    const html = `
      <html>
        <head>
          <title>Reporte de Mantención - Orden #${m.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 3px solid #f0b429; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 20px; font-weight: bold; color: #1c2333; display: flex; align-items: center; gap: 8px; font-family: sans-serif; }
            .title { font-size: 26px; font-weight: bold; margin: 0; color: #1c2333; }
            .meta-info { margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .info-box { background: #f7fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
            .info-box h3 { margin-top: 0; border-bottom: 1px solid #cbd5e0; padding-bottom: 5px; color: #4a5568; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13.5px; }
            .info-row span { font-weight: bold; color: #2d3748; }
            .description { background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
            .description h3 { margin-top: 0; color: #1c2333; border-bottom: 1px solid #cbd5e0; padding-bottom: 5px; font-size: 15px; }
            .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #718096; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 60px; text-align: center; }
            .signature-line { border-top: 1px solid #a0aec0; margin-top: 50px; padding-top: 8px; font-size: 11.5px; color: #4a5568; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">⛏️ SISTEMA DE CONTROL MINERO</div>
            <div style="text-align: right;">
              <strong>ORDEN DE TRABAJO #${m.id}</strong><br/>
              <span style="color:#718096;font-size:11px;">Fecha: ${new Date().toLocaleDateString("es-CL")}</span>
            </div>
          </div>
          
          <h2 class="title">Ficha Técnica de Mantención</h2>
          <p style="color:#718096; margin-bottom: 25px; margin-top: 5px;">Tipo de servicio: <strong style="color: #2d3748;">${m.tipo}</strong></p>

          <div class="meta-info">
            <div class="info-box">
              <h3>Información del Equipo</h3>
              <div class="info-row">Código: <span>${m.equipo_codigo}</span></div>
              <div class="info-row">Nombre: <span>${m.equipo_nombre}</span></div>
            </div>
            <div class="info-box">
              <h3>Detalles de la Orden</h3>
              <div class="info-row">Estado: <span style="text-transform: capitalize;">${m.estado}</span></div>
              <div class="info-row">Prioridad: <span style="text-transform: capitalize;">${m.prioridad}</span></div>
              <div class="info-row">Fecha de Inicio: <span>${m.fecha_inicio ? new Date(m.fecha_inicio).toLocaleDateString("es-CL") : '—'}</span></div>
              <div class="info-row">Fecha de Fin: <span>${m.fecha_fin ? new Date(m.fecha_fin).toLocaleDateString("es-CL") : '—'}</span></div>
            </div>
          </div>

          <div class="description">
            <h3>Descripción del Trabajo / Diagnóstico</h3>
            <p style="margin: 0; white-space: pre-wrap;">${m.descripcion || 'Sin observaciones o detalles técnicos descritos.'}</p>
          </div>

          <div class="info-box" style="margin-bottom: 40px;">
            <h3>Personal Responsable</h3>
            <div class="info-row" style="margin-bottom: 0;">Técnico Asignado: <span>${m.tecnico_nombre || 'No asignado'}</span></div>
          </div>

          <div class="signatures">
            <div>
              <div class="signature-line">Firma Técnico Responsable</div>
            </div>
            <div>
              <div class="signature-line">Firma Supervisor de Turno</div>
            </div>
          </div>

          <div class="footer">
            Documento generado digitalmente por Sistema de Control Minero v1.0 - Creadora: SolangeLisset
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };


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

  const handleDelete = async () => {
    try {
      await deleteMantencion(confirmar.id);
      addToast("Mantención eliminada", "success");
      setConfirmar(null);
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
                      <button className="btn btn-ghost btn-sm" onClick={() => printPDF(m)} title="Exportar PDF / Imprimir">📄</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(m)} title="Editar">✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmar(m)} title="Eliminar">🗑️</button>
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

      {confirmar && (
        <ConfirmModal
          title="Eliminar Orden de Mantención"
          message={`¿Estás seguro que deseas eliminar la orden #${confirmar.id} de tipo "${confirmar.tipo}" para el equipo ${confirmar.equipo_codigo}? Esta acción no se puede deshacer.`}
          onConfirm={handleDelete}
          onCancel={() => setConfirmar(null)}
        />
      )}
    </div>
  );
}
