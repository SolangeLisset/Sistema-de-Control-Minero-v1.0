const express = require("express");
const router = express.Router();
const {
  getEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  getEquipoMantenciones,
} = require("../controllers/equiposController");

// GET    /api/equipos       → lista todos
// GET    /api/equipos/:id   → uno por ID
// GET    /api/equipos/:id/mantenciones → historial de mantenciones
// POST   /api/equipos       → crear nuevo
// PUT    /api/equipos/:id   → actualizar
// DELETE /api/equipos/:id   → eliminar

router.get("/", getEquipos);
router.get("/:id", getEquipoById);
router.get("/:id/mantenciones", getEquipoMantenciones);
router.post("/", createEquipo);
router.put("/:id", updateEquipo);
router.delete("/:id", deleteEquipo);

module.exports = router;
