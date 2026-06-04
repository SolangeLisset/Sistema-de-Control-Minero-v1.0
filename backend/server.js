require("dotenv").config(); // Carga las variables del archivo .env
const express = require("express");
const cors = require("cors");
const { initDB } = require("./src/db/database");

// Importamos las rutas
const tecnicosRoutes = require("./src/routes/tecnicos");
const equiposRoutes = require("./src/routes/equipos");
const mantencionesRoutes = require("./src/routes/mantenciones");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ─────────────────────────────────────────────
// cors: permite que el frontend (React en otro puerto) hable con este servidor
app.use(cors());
// express.json: permite recibir datos en formato JSON en las peticiones
app.use(express.json());

// ── Rutas de la API ─────────────────────────────────────────
// Todas las rutas de técnicos empiezan con /api/tecnicos
app.use("/api/tecnicos", tecnicosRoutes);
// Todas las rutas de equipos empiezan con /api/equipos
app.use("/api/equipos", equiposRoutes);
// Todas las rutas de mantenciones empiezan con /api/mantenciones
app.use("/api/mantenciones", mantencionesRoutes);

// ── Ruta de prueba ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    mensaje: "⛏️ API Sistema Minero funcionando correctamente",
    version: "1.0.0",
    rutas: ["/api/equipos", "/api/tecnicos", "/api/mantenciones"],
  });
});

// ── Iniciar servidor ─────────────────────────────────────────
// Primero inicializamos la base de datos, y luego arrancamos el servidor
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📦 Base de datos lista`);
    console.log(`\n📋 Rutas disponibles:`);
    console.log(`   GET  http://localhost:${PORT}/api/equipos`);
    console.log(`   GET  http://localhost:${PORT}/api/tecnicos`);
    console.log(`   GET  http://localhost:${PORT}/api/mantenciones`);
    console.log(`   GET  http://localhost:${PORT}/api/mantenciones/dashboard`);
  });
}).catch((err) => {
  console.error("❌ Error al iniciar la base de datos:", err);
  process.exit(1);
});
