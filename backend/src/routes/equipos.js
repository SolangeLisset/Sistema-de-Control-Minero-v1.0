const express = require("express");
const router = express.Router();
const {
  getEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  deleteEquipo,
} = require("../controllers/equiposController");

// GET    /api/equipos       → lista todos
// GET    /api/equipos/:id   → uno por ID
// POST   /api/equipos       → crear nuevo
// PUT    /api/equipos/:id   → actualizar
// DELETE /api/equipos/:id   → eliminar

router.get("/", getEquipos);
router.get("/:id", getEquipoById);
router.post("/", createEquipo);
router.put("/:id", updateEquipo);
router.delete("/:id", deleteEquipo);

module.exports = router;
