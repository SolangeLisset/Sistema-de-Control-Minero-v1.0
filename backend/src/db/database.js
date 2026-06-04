const path = require("path");
const fs = require("fs");

// sql.js es SQLite pero escrito en JavaScript puro (no necesita compiladores)
const initSqlJs = require("sql.js");

const DB_PATH = path.join(__dirname, "mining.db");

let db; // Esta variable guardará la conexión a la base de datos

// Función para inicializar la base de datos
async function initDB() {
  const SQL = await initSqlJs();

  // Si ya existe el archivo .db, lo cargamos. Si no, creamos uno nuevo.
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Creamos las tablas si no existen
  db.run(`
    CREATE TABLE IF NOT EXISTS tecnicos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      especialidad TEXT NOT NULL,
      telefono TEXT,
      activo INTEGER DEFAULT 1,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS equipos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      codigo TEXT NOT NULL UNIQUE,
      nombre TEXT NOT NULL,
      tipo TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'operativo',
      ubicacion TEXT NOT NULL,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS mantenciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      equipo_id INTEGER NOT NULL,
      tecnico_id INTEGER,
      tipo TEXT NOT NULL,
      descripcion TEXT,
      estado TEXT NOT NULL DEFAULT 'pendiente',
      prioridad TEXT NOT NULL DEFAULT 'normal',
      fecha_inicio DATETIME,
      fecha_fin DATETIME,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (equipo_id) REFERENCES equipos(id),
      FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id)
    )
  `);

  // Guardamos el archivo en disco
  saveDB();
  console.log("✅ Base de datos inicializada correctamente");
}

// Función para guardar los cambios en el archivo .db
function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Función para obtener la conexión a la base de datos
function getDB() {
  return db;
}

module.exports = { initDB, getDB, saveDB };
