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
      horometro INTEGER DEFAULT 0,
      limite_mantencion INTEGER DEFAULT 500,
      creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migraciones: Intentar agregar columnas si ya existía la tabla antigua
  try { db.run("ALTER TABLE equipos ADD COLUMN horometro INTEGER DEFAULT 0"); } catch(e){}
  try { db.run("ALTER TABLE equipos ADD COLUMN limite_mantencion INTEGER DEFAULT 500"); } catch(e){}

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

  // Auto-seed si está vacía
  const checkTecnicos = db.exec("SELECT COUNT(*) FROM tecnicos");
  const count = checkTecnicos[0] ? checkTecnicos[0].values[0][0] : 0;
  if (count === 0) {
    console.log("🌱 Base de datos vacía. Auto-sembrando datos iniciales...");

    // Insertar técnicos
    const tecnicos = [
      ["Juan Mamani Flores", "Mecánica Pesada", "+56 9 8123 4567"],
      ["Carlos Vega Díaz", "Electricidad Industrial", "+56 9 7654 3210"],
      ["Pedro Quispe Condori", "Hidráulica y Neumática", "+56 9 9876 5432"],
      ["Ana Torres Rojas", "Instrumentación", "+56 9 6543 2109"],
      ["Luis Contreras Silva", "Soldadura", "+56 9 5432 1098"]
    ];
    tecnicos.forEach(t => {
      db.run("INSERT INTO tecnicos (nombre, especialidad, telefono) VALUES (?, ?, ?)", t);
    });

    // Insertar equipos
    const equipos = [
      ["CAM-001", "Camión Komatsu 830E", "Camión de extracción", "operativo", "Pit Norte — Nivel 3480", 480, 500],
      ["CAM-002", "Camión Caterpillar 793F", "Camión de extracción", "mantencion", "Pit Sur — Nivel 3320", 250, 500],
      ["CAM-003", "Camión Liebherr T 282C", "Camión de extracción", "operativo", "Pit Central — Nivel 3400", 495, 500],
      ["PER-001", "Perforadora Atlas Copco DM45", "Perforadora", "operativo", "Banco 12 — Área Este", 120, 250],
      ["PER-002", "Perforadora Sandvik DR410i", "Perforadora", "falla", "Banco 08 — Área Oeste", 242, 250],
      ["EXC-001", "Excavadora Komatsu PC8000", "Excavadora", "operativo", "Pit Norte — Frente A", 620, 1000],
      ["EXC-002", "Excavadora Liebherr R 9400", "Excavadora", "operativo", "Pit Sur — Frente B", 990, 1000],
      ["CAR-001", "Cargador Caterpillar 994K", "Cargador frontal", "operativo", "Acopio Principal", 310, 500],
      ["BUL-001", "Bulldozer Komatsu D375A", "Bulldozer", "inactivo", "Taller Principal", 0, 500],
      ["GRU-001", "Grúa Liebherr LTM 1500", "Grúa", "operativo", "Área de Mantención", 85, 250]
    ];
    equipos.forEach(eq => {
      db.run("INSERT INTO equipos (codigo, nombre, tipo, estado, ubicacion, horometro, limite_mantencion) VALUES (?, ?, ?, ?, ?, ?, ?)", eq);
    });

    // Insertar mantenciones
    const mantenciones = [
      [2, 1, "Correctiva", "Falla en sistema de frenos traseros. Reemplazo de pastillas y revisión hidráulica.", "en proceso", "alta", "2026-06-01", null],
      [5, 2, "Correctiva", "Motor principal fuera de servicio. Diagnóstico eléctrico en curso.", "pendiente", "alta", "2026-06-03", null],
      [1, 3, "Preventiva", "Cambio de aceite motor y revisión general de 500 horas.", "terminado", "normal", "2026-05-28", "2026-05-29"],
      [3, 1, "Preventiva", "Revisión de neumáticos y sistema de dirección.", "terminado", "normal", "2026-05-25", "2026-05-25"],
      [4, 4, "Inspección", "Inspección de varillas de perforación y compresores.", "pendiente", "normal", "2026-06-05", null],
      [6, 2, "Preventiva", "Engrase general y revisión de sistema hidráulico.", "en proceso", "normal", "2026-06-04", null],
      [8, 5, "Cambio de aceite", "Cambio de aceite hidráulico y filtros.", "pendiente", "baja", "2026-06-07", null],
      [9, 1, "Reparación mayor", "Revisión completa antes de reintegrar a operación.", "pendiente", "normal", "2026-06-10", null]
    ];
    mantenciones.forEach(m => {
      db.run("INSERT INTO mantenciones (equipo_id, tecnico_id, tipo, descripcion, estado, prioridad, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", m);
    });
  }

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
