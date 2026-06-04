import { NavLink, useLocation } from "react-router-dom";

const navItems = [
  { to: "/", icon: "📊", label: "Dashboard" },
  { to: "/equipos", icon: "🚛", label: "Equipos" },
  { to: "/mantenciones", icon: "🔧", label: "Mantenciones" },
  { to: "/tecnicos", icon: "👷", label: "Técnicos" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⛏️</div>
        <h1>Mining Control</h1>
        <p>Sistema de Gestión Industrial</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navegación</div>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: 4, fontWeight: 600, color: "var(--text-secondary)" }}>
          v1.0.0 — Portafolio
        </div>
        <div>Sistema Minero Demo</div>
      </div>
    </aside>
  );
}
