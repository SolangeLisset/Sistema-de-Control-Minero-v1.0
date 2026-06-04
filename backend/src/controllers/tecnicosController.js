const { getDB, saveDB } = require("../db/database");

// Obtener todos los técnicos
const getTecnicos = (req, res) => {
  try {
    const db = getDB();
    const result = db.exec("SELECT * FROM tecnicos ORDER BY nombre ASC");
    // db.exec devuelve un array raro, lo convertimos a objetos normales
    const tecnicos = result.length > 0 ? rowsToObjects(result[0]) : [];
    res.json(tecnicos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener técnicos" });
  }
};

// Obtener un técnico por ID
const getTecnicoById = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const result = db.exec(`SELECT * FROM tecnicos WHERE id = ${id}`);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: "Técnico no encontrado" });
    }
    res.json(rowsToObjects(result[0])[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener técnico" });
  }
};

// Crear un técnico nuevo
const createTecnico = (req, res) => {
  try {
    const db = getDB();
    const { nombre, especialidad, telefono } = req.body;

    if (!nombre || !especialidad) {
      return res.status(400).json({ error: "Nombre y especialidad son obligatorios" });
    }

    db.run(
      `INSERT INTO tecnicos (nombre, especialidad, telefono) VALUES (?, ?, ?)`,
      [nombre, especialidad, telefono || null]
    );
    saveDB();

    // Obtenemos el técnico recién creado para devolverlo
    const result = db.exec("SELECT * FROM tecnicos ORDER BY id DESC LIMIT 1");
    const nuevoTecnico = rowsToObjects(result[0])[0];
    res.status(201).json(nuevoTecnico);
  } catch (error) {
    res.status(500).json({ error: "Error al crear técnico" });
  }
};

// Actualizar un técnico
const updateTecnico = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const { nombre, especialidad, telefono, activo } = req.body;

    db.run(
      `UPDATE tecnicos SET nombre = ?, especialidad = ?, telefono = ?, activo = ? WHERE id = ?`,
      [nombre, especialidad, telefono || null, activo ?? 1, id]
    );
    saveDB();

    const result = db.exec(`SELECT * FROM tecnicos WHERE id = ${id}`);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: "Técnico no encontrado" });
    }
    res.json(rowsToObjects(result[0])[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar técnico" });
  }
};

// Eliminar un técnico
const deleteTecnico = (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    db.run(`DELETE FROM tecnicos WHERE id = ?`, [id]);
    saveDB();
    res.json({ mensaje: "Técnico eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar técnico" });
  }
};

// Helper: convierte el formato de sql.js a objetos normales
function rowsToObjects(result) {
  const { columns, values } = result;
  return values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

module.exports = { getTecnicos, getTecnicoById, createTecnico, updateTecnico, deleteTecnico };
