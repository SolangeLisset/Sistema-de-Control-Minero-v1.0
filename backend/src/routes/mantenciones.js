const express = require("express");
const router = express.Router();
const {
  getMantenciones,
  getMantencionById,
  createMantencion,
  updateMantencion,
  deleteMantencion,
  getDashboard,
} = require("../controllers/mantencionesController");

// GET /api/mantenciones/dashboard → resumen para el dashboard
// GET    /api/mantenciones       → lista todas
// GET    /api/mantenciones/:id   → una por ID
// POST   /api/mantenciones       → crear nueva
// PUT    /api/mantenciones/:id   → actualizar
// DELETE /api/mantenciones/:id   → eliminar

router.get("/dashboard", getDashboard);
router.get("/", getMantenciones);
router.get("/:id", getMantencionById);
router.post("/", createMantencion);
router.put("/:id", updateMantencion);
router.delete("/:id", deleteMantencion);

module.exports = router;
