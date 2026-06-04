import { useState, useEffect } from "react";
import { getDashboard } from "../services/api";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading">
      <div className="spinner" />
      Cargando dashboard...
    </div>
  );

  // Procesar datos de equipos por estado
  const estadoEquipo = { operativo: 0, mantencion: 0, falla: 0, inactivo: 0 };
  (data?.equipos_por_estado || []).forEach(({ estado, total }) => {
    estadoEquipo[estado] = total;
  });

  // Procesar mantenciones por estado
  const estadoMant = { pendiente: 0, "en proceso": 0, terminado: 0 };
  (data?.mantenciones_por_estado || []).forEach(({ estado, total }) => {
    estadoMant[estado] = total;
  });

  const totalEquipos = Object.values(estadoEquipo).reduce((a, b) => a + b, 0);
  const totalMant = Object.values(estadoMant).reduce((a, b) => a + b, 0);

  const getBadgeEstado = (estado) => {
    const map = {
      pendiente:   "badge-orange",
      "en proceso":"badge-blue",
      terminado:   "badge-green",
    };
    return map[estado] || "badge-gray";
  };

  const getPrioridadBadge = (p) => {
    const map = { alta: "badge-red", normal: "badge-blue", baja: "badge-gray" };
    return map[p] || "badge-gray";
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <span className="title-icon">📊</span>
          <div>
            <h2>Dashboard</h2>
            <p className="page-subtitle">Resumen operacional del sistema minero</p>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
          🕐 {new Date().toLocaleString("es-CL")}
        </div>
      </div>

      {/* ── Tarjetas de estadísticas ── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon yellow">🚛</div>
          <div className="stat-info">
            <div className="stat-number">{totalEquipos}</div>
            <div className="stat-label">Total Equipos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info">
            <div className="stat-number" style={{ color: "var(--green)" }}>
              {estadoEquipo.operativo}
            </div>
            <div className="stat-label">Equipos Operativos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">⚠️</div>
          <div className="stat-info">
            <div className="stat-number" style={{ color: "var(--red)" }}>
              {estadoEquipo.falla}
            </div>
            <div className="stat-label">En Falla</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">🔧</div>
          <div className="stat-info">
            <div className="stat-number" style={{ color: "var(--orange)" }}>
              {estadoMant.pendiente}
            </div>
            <div className="stat-label">Mantenciones Pendientes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">⚙️</div>
          <div className="stat-info">
            <div className="stat-number" style={{ color: "var(--blue)" }}>
              {estadoMant["en proceso"]}
            </div>
            <div className="stat-label">En Proceso</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow">👷</div>
          <div className="stat-info">
            <div className="stat-number">{data?.total_tecnicos_activos ?? 0}</div>
            <div className="stat-label">Técnicos Activos</div>
          </div>
        </div>
      </div>

      {/* ── Grilla inferior ── */}
      <div className="dashboard-grid">
        {/* Estado de equipos */}
        <div className="card">
          <div className="section-title">🚛 Estado de Equipos</div>
          {totalEquipos === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏗️</div>
              <p>Sin equipos registrados</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Operativo", key: "operativo", color: "var(--green)", icon: "🟢" },
                { label: "En Mantención", key: "mantencion", color: "var(--yellow)", icon: "🟡" },
                { label: "En Falla", key: "falla", color: "var(--red)", icon: "🔴" },
                { label: "Inactivo", key: "inactivo", color: "var(--text-muted)", icon: "⚫" },
              ].map(({ label, key, color, icon }) => {
                const val = estadoEquipo[key] || 0;
                const pct = totalEquipos > 0 ? Math.round((val / totalEquipos) * 100) : 0;
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 13 }}>
                      <span>{icon} {label}</span>
                      <span style={{ color, fontWeight: 700 }}>{val} ({pct}%)</span>
                    </div>
                    <div style={{ background: "var(--bg-secondary)", borderRadius: 20, height: 8, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 20, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Últimas mantenciones */}
        <div className="card">
          <div className="section-title">🔧 Últimas Mantenciones</div>
          {(data?.ultimas_mantenciones || []).length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>Sin mantenciones registradas</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.ultimas_mantenciones.map((m) => (
                <div
                  key={m.id}
                  style={{
                    background: "var(--bg-secondary)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 14px",
                    borderLeft: "3px solid var(--yellow)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {m.equipo_codigo} — {m.tipo}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {m.tecnico_nombre ? `👷 ${m.tecnico_nombre}` : "Sin técnico asignado"}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <span className={`badge ${getBadgeEstado(m.estado)}`}>{m.estado}</span>
                      <span className={`badge ${getPrioridadBadge(m.prioridad)}`}>{m.prioridad}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
