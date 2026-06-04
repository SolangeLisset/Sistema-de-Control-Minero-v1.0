// Modal de confirmación personalizado — reemplaza el confirm() del navegador

export default function ConfirmModal({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal"
        style={{ maxWidth: 420 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>{danger ? "⚠️" : "❓"}</span>
            {title || "¿Estás seguro?"}
          </h3>
        </div>

        <div className="modal-body" style={{ paddingTop: 16, paddingBottom: 16 }}>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className={danger ? "btn btn-danger" : "btn btn-primary"}
            style={danger ? {
              background: "rgba(248,81,73,0.2)",
              color: "var(--red)",
              border: "1px solid rgba(248,81,73,0.4)",
              fontWeight: 700,
            } : {}}
            onClick={onConfirm}
          >
            {danger ? "🗑️ Eliminar" : "✅ Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
