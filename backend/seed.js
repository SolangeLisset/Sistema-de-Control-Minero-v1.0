// Script para cargar datos de ejemplo en la base de datos
// Ejecutar con: node seed.js

require("dotenv").config();
const { initDB, getDB, saveDB } = require("./src/db/database");

async function seed() {
  await initDB();
  const db = getDB();

  console.log("🌱 Cargando datos de ejemplo...\n");

  // ── Técnicos ──────────────────────────────────────────────
  const tecnicos = [
    { nombre: "Juan Mamani Flores",    especialidad: "Mecánica Pesada",         telefono: "+56 9 8123 4567" },
    { nombre: "Carlos Vega Díaz",      especialidad: "Electricidad Industrial",  telefono: "+56 9 7654 3210" },
    { nombre: "Pedro Quispe Condori",  especialidad: "Hidráulica y Neumática",   telefono: "+56 9 9876 5432" },
    { nombre: "Ana Torres Rojas",      especialidad: "Instrumentación",          telefono: "+56 9 6543 2109" },
    { nombre: "Luis Contreras Silva",  especialidad: "Soldadura",                telefono: "+56 9 5432 1098" },
  ];

  for (const t of tecnicos) {
    try {
      db.run(
        `INSERT INTO tecnicos (nombre, especialidad, telefono) VALUES (?, ?, ?)`,
        [t.nombre, t.especialidad, t.telefono]
      );
      console.log(`  ✅ Técnico: ${t.nombre}`);
    } catch (e) {
      console.log(`  ⚠️  Ya existe: ${t.nombre}`);
    }
  }

  // ── Equipos ───────────────────────────────────────────────
  const equipos = [
    { codigo: "CAM-001", nombre: "Camión Komatsu 830E",     tipo: "Camión de extracción", estado: "operativo",  ubicacion: "Pit Norte — Nivel 3480" },
    { codigo: "CAM-002", nombre: "Camión Caterpillar 793F", tipo: "Camión de extracción", estado: "mantencion", ubicacion: "Pit Sur — Nivel 3320" },
    { codigo: "CAM-003", nombre: "Camión Liebherr T 282C",  tipo: "Camión de extracción", estado: "operativo",  ubicacion: "Pit Central — Nivel 3400" },
    { codigo: "PER-001", nombre: "Perforadora Atlas Copco DM45", tipo: "Perforadora",    estado: "operativo",  ubicacion: "Banco 12 — Área Este" },
    { codigo: "PER-002", nombre: "Perforadora Sandvik DR410i",   tipo: "Perforadora",    estado: "falla",      ubicacion: "Banco 08 — Área Oeste" },
    { codigo: "EXC-001", nombre: "Excavadora Komatsu PC8000",    tipo: "Excavadora",     estado: "operativo",  ubicacion: "Pit Norte — Frente A" },
    { codigo: "EXC-002", nombre: "Excavadora Liebherr R 9400",   tipo: "Excavadora",     estado: "operativo",  ubicacion: "Pit Sur — Frente B" },
    { codigo: "CAR-001", nombre: "Cargador Caterpillar 994K",    tipo: "Cargador frontal",estado: "operativo",  ubicacion: "Acopio Principal" },
    { codigo: "BUL-001", nombre: "Bulldozer Komatsu D375A",      tipo: "Bulldozer",      estado: "inactivo",   ubicacion: "Taller Principal" },
    { codigo: "GRU-001", nombre: "Grúa Liebherr LTM 1500",      tipo: "Grúa",           estado: "operativo",  ubicacion: "Área de Mantención" },
  ];

  for (const eq of equipos) {
    try {
      db.run(
        `INSERT INTO equipos (codigo, nombre, tipo, estado, ubicacion) VALUES (?, ?, ?, ?, ?)`,
        [eq.codigo, eq.nombre, eq.tipo, eq.estado, eq.ubicacion]
      );
      console.log(`  ✅ Equipo: ${eq.codigo} — ${eq.nombre}`);
    } catch (e) {
      console.log(`  ⚠️  Ya existe: ${eq.codigo}`);
    }
  }

  // ── Obtener IDs reales ─────────────────────────────────────
  const tecResult = db.exec("SELECT id FROM tecnicos ORDER BY id ASC LIMIT 5");
  const eqResult  = db.exec("SELECT id FROM equipos ORDER BY id ASC LIMIT 10");

  if (tecResult.length === 0 || eqResult.length === 0) {
    console.log("\n❌ No se pudieron obtener IDs. Verifica que los técnicos y equipos se crearon.");
    process.exit(1);
  }

  const tIds = tecResult[0].values.map((r) => r[0]);
  const eIds = eqResult[0].values.map((r) => r[0]);

  // ── Mantenciones ──────────────────────────────────────────
  const mantenciones = [
    { equipo_id: eIds[1], tecnico_id: tIds[0], tipo: "Correctiva",   descripcion: "Falla en sistema de frenos traseros. Reemplazo de pastillas y revisión hidráulica.", estado: "en proceso", prioridad: "alta",   fecha_inicio: "2026-06-01" },
    { equipo_id: eIds[4], tecnico_id: tIds[1], tipo: "Correctiva",   descripcion: "Motor principal fuera de servicio. Diagnóstico eléctrico en curso.", estado: "pendiente",  prioridad: "alta",   fecha_inicio: "2026-06-03" },
    { equipo_id: eIds[0], tecnico_id: tIds[2], tipo: "Preventiva",   descripcion: "Cambio de aceite motor y revisión general de 500 horas.", estado: "terminado",  prioridad: "normal", fecha_inicio: "2026-05-28", fecha_fin: "2026-05-29" },
    { equipo_id: eIds[2], tecnico_id: tIds[0], tipo: "Preventiva",   descripcion: "Revisión de neumáticos y sistema de dirección.", estado: "terminado",  prioridad: "normal", fecha_inicio: "2026-05-25", fecha_fin: "2026-05-25" },
    { equipo_id: eIds[3], tecnico_id: tIds[3], tipo: "Inspección",   descripcion: "Inspección de varillas de perforación y compresores.", estado: "pendiente",  prioridad: "normal", fecha_inicio: "2026-06-05" },
    { equipo_id: eIds[5], tecnico_id: tIds[1], tipo: "Preventiva",   descripcion: "Engrase general y revisión de sistema hidráulico.", estado: "en proceso", prioridad: "normal", fecha_inicio: "2026-06-04" },
    { equipo_id: eIds[7], tecnico_id: tIds[4], tipo: "Cambio de aceite", descripcion: "Cambio de aceite hidráulico y filtros.", estado: "pendiente",  prioridad: "baja",   fecha_inicio: "2026-06-07" },
    { equipo_id: eIds[8], tecnico_id: tIds[0], tipo: "Reparación mayor", descripcion: "Revisión completa antes de reintegrar a operación.", estado: "pendiente",  prioridad: "normal", fecha_inicio: "2026-06-10" },
  ];

  for (const m of mantenciones) {
    try {
      db.run(
        `INSERT INTO mantenciones (equipo_id, tecnico_id, tipo, descripcion, estado, prioridad, fecha_inicio, fecha_fin)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.equipo_id, m.tecnico_id, m.tipo, m.descripcion, m.estado, m.prioridad, m.fecha_inicio, m.fecha_fin || null]
      );
      console.log(`  ✅ Mantención: ${m.tipo} — ${m.estado}`);
    } catch (e) {
      console.log(`  ⚠️  Error: ${e.message}`);
    }
  }

  saveDB();
  console.log("\n✅ ¡Datos de ejemplo cargados exitosamente!");
  console.log("   Abre http://localhost:5173 para ver el sistema.\n");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error en seed:", err);
  process.exit(1);
});
