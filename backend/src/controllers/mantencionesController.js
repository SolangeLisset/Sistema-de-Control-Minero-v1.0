const { getDB, saveDB } = require("../db/database");

function rowsToObjects(result) {
  const { columns, values } = result;
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// Obtener todas las mantenciones (con nombre del equipo y técnico)
const getMantenciones = (req, res) => {
  try {
    const db = getDB();
    const result = db.exec(`
      SELECT 
        m.*,
        e.codigo AS equipo_codigo,
        e.nombre AS equipo_nombre,
        t.nombre AS tecnico_nombre
      FROM mantenciones m
      LEFT JOIN equipos e ON m.equipo_id = e.id
      LEFT JOIN tecnicos t ON m.tecnico_id = t.id
      ORDER BY m.creado_en DESC
    `);
    const mantenciones = result.length > 0 ? rowsToObjects(result[0]) : [];
    res.json(mantenciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mantenciones" });
  }
};

// Obtener una mantención por ID
const getMantencionById = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const result = db.exec(`
      SELECT m.*, e.codigo AS equipo_codigo, e.nombre AS equipo_nombre, t.nombre AS tecnico_nombre
      FROM mantenciones m
      LEFT JOIN equipos e ON m.equipo_id = e.id
      LEFT JOIN tecnicos t ON m.tecnico_id = t.id
      WHERE m.id = ${id}
    `);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: "Mantención no encontrada" });
    }
    res.json(rowsToObjects(result[0])[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener mantención" });
  }
};

// Crear una mantención
const createMantencion = (req, res) => {
  try {
    const db = getDB();
    const { equipo_id, tecnico_id, tipo, descripcion, estado, prioridad, fecha_inicio } = req.body;

    if (!equipo_id || !tipo) {
      return res.status(400).json({ error: "Equipo y tipo de mantención son obligatorios" });
    }

    db.run(
      `INSERT INTO mantenciones (equipo_id, tecnico_id, tipo, descripcion, estado, prioridad, fecha_inicio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        equipo_id,
        tecnico_id || null,
        tipo,
        descripcion || null,
        estado || "pendiente",
        prioridad || "normal",
        fecha_inicio || null,
      ]
    );
    saveDB();

    const result = db.exec(`
      SELECT m.*, e.codigo AS equipo_codigo, e.nombre AS equipo_nombre, t.nombre AS tecnico_nombre
      FROM mantenciones m
      LEFT JOIN equipos e ON m.equipo_id = e.id
      LEFT JOIN tecnicos t ON m.tecnico_id = t.id
      ORDER BY m.id DESC LIMIT 1
    `);
    res.status(201).json(rowsToObjects(result[0])[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al crear mantención" });
  }
};

// Actualizar mantención (cambiar estado, asignar técnico, etc.)
const updateMantencion = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { equipo_id, tecnico_id, tipo, descripcion, estado, prioridad, fecha_inicio, fecha_fin } = req.body;

    db.run(
      `UPDATE mantenciones 
       SET equipo_id=?, tecnico_id=?, tipo=?, descripcion=?, estado=?, prioridad=?, fecha_inicio=?, fecha_fin=?
       WHERE id=?`,
      [equipo_id, tecnico_id || null, tipo, descripcion || null, estado, prioridad, fecha_inicio || null, fecha_fin || null, id]
    );
    saveDB();

    const result = db.exec(`
      SELECT m.*, e.codigo AS equipo_codigo, e.nombre AS equipo_nombre, t.nombre AS tecnico_nombre
      FROM mantenciones m
      LEFT JOIN equipos e ON m.equipo_id = e.id
      LEFT JOIN tecnicos t ON m.tecnico_id = t.id
      WHERE m.id = ${id}
    `);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: "Mantención no encontrada" });
    }
    res.json(rowsToObjects(result[0])[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar mantención" });
  }
};

// Eliminar mantención
const deleteMantencion = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    db.run(`DELETE FROM mantenciones WHERE id = ?`, [id]);
    saveDB();
    res.json({ mensaje: "Mantención eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar mantención" });
  }
};

// Dashboard: resumen general
const getDashboard = (req, res) => {
  try {
    const db = getDB();

    const equiposPorEstado = db.exec(`SELECT estado, COUNT(*) as total FROM equipos GROUP BY estado`);
    const mantencionPorEstado = db.exec(`SELECT estado, COUNT(*) as total FROM mantenciones GROUP BY estado`);
    const totalTecnicos = db.exec(`SELECT COUNT(*) as total FROM tecnicos WHERE activo = 1`);
    const ultimasMantenciones = db.exec(`
      SELECT m.id, m.tipo, m.estado, m.prioridad, m.creado_en,
             e.codigo AS equipo_codigo, e.nombre AS equipo_nombre,
             t.nombre AS tecnico_nombre
      FROM mantenciones m
      LEFT JOIN equipos e ON m.equipo_id = e.id
      LEFT JOIN tecnicos t ON m.tecnico_id = t.id
      ORDER BY m.creado_en DESC LIMIT 5
    `);

    res.json({
      equipos_por_estado: equiposPorEstado.length > 0 ? rowsToObjects(equiposPorEstado[0]) : [],
      mantenciones_por_estado: mantencionPorEstado.length > 0 ? rowsToObjects(mantencionPorEstado[0]) : [],
      total_tecnicos_activos: totalTecnicos.length > 0 ? totalTecnicos[0].values[0][0] : 0,
      ultimas_mantenciones: ultimasMantenciones.length > 0 ? rowsToObjects(ultimasMantenciones[0]) : [],
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener datos del dashboard" });
  }
};

module.exports = { getMantenciones, getMantencionById, createMantencion, updateMantencion, deleteMantencion, getDashboard };
