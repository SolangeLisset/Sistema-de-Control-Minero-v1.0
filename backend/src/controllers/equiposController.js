const { getDB, saveDB } = require("../db/database");

// Helper: convierte formato sql.js a objetos normales
function rowsToObjects(result) {
  const { columns, values } = result;
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// Obtener todos los equipos
const getEquipos = (req, res) => {
  try {
    const db = getDB();
    const result = db.exec("SELECT * FROM equipos ORDER BY codigo ASC");
    const equipos = result.length > 0 ? rowsToObjects(result[0]) : [];
    res.json(equipos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener equipos" });
  }
};

// Obtener un equipo por ID
const getEquipoById = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const result = db.exec(`SELECT * FROM equipos WHERE id = ${id}`);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }
    res.json(rowsToObjects(result[0])[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener equipo" });
  }
};

// Crear un equipo nuevo
const createEquipo = (req, res) => {
  try {
    const db = getDB();
    const { codigo, nombre, tipo, estado, ubicacion, horometro, limite_mantencion } = req.body;

    if (!codigo || !nombre || !tipo || !ubicacion) {
      return res.status(400).json({ error: "Código, nombre, tipo y ubicación son obligatorios" });
    }

    const estadoValido = estado || "operativo";
    const horoVal = horometro !== undefined && horometro !== "" ? parseInt(horometro) : 0;
    const limVal = limite_mantencion !== undefined && limite_mantencion !== "" ? parseInt(limite_mantencion) : 500;

    db.run(
      `INSERT INTO equipos (codigo, nombre, tipo, estado, ubicacion, horometro, limite_mantencion) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [codigo, nombre, tipo, estadoValido, ubicacion, horoVal, limVal]
    );
    saveDB();

    const result = db.exec("SELECT * FROM equipos ORDER BY id DESC LIMIT 1");
    const nuevoEquipo = rowsToObjects(result[0])[0];
    res.status(201).json(nuevoEquipo);
  } catch (error) {
    if (error.message && error.message.includes("UNIQUE")) {
      return res.status(400).json({ error: "Ya existe un equipo con ese código" });
    }
    res.status(500).json({ error: "Error al crear equipo" });
  }
};

// Actualizar un equipo
const updateEquipo = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { codigo, nombre, tipo, estado, ubicacion, horometro, limite_mantencion } = req.body;

    const horoVal = horometro !== undefined && horometro !== "" ? parseInt(horometro) : 0;
    const limVal = limite_mantencion !== undefined && limite_mantencion !== "" ? parseInt(limite_mantencion) : 500;

    db.run(
      `UPDATE equipos SET codigo = ?, nombre = ?, tipo = ?, estado = ?, ubicacion = ?, horometro = ?, limite_mantencion = ? WHERE id = ?`,
      [codigo, nombre, tipo, estado, ubicacion, horoVal, limVal, id]
    );
    saveDB();

    const result = db.exec(`SELECT * FROM equipos WHERE id = ${id}`);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: "Equipo no encontrado" });
    }
    res.json(rowsToObjects(result[0])[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar equipo" });
  }
};

// Eliminar un equipo
const deleteEquipo = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    db.run(`DELETE FROM equipos WHERE id = ?`, [id]);
    saveDB();
    res.json({ mensaje: "Equipo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar equipo" });
  }
};

// Obtener historial de mantenciones de un equipo
const getEquipoMantenciones = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const result = db.exec(`
      SELECT m.*, t.nombre AS tecnico_nombre
      FROM mantenciones m
      LEFT JOIN tecnicos t ON m.tecnico_id = t.id
      WHERE m.equipo_id = ${id}
      ORDER BY m.fecha_inicio DESC, m.creado_en DESC
    `);
    const mantenciones = result.length > 0 ? rowsToObjects(result[0]) : [];
    res.json(mantenciones);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener historial de mantenciones" });
  }
};

module.exports = { getEquipos, getEquipoById, createEquipo, updateEquipo, deleteEquipo, getEquipoMantenciones };

