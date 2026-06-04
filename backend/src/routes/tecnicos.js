const express = require("express");
const router = express.Router();
const {
  getTecnicos,
  getTecnicoById,
  createTecnico,
  updateTecnico,
  deleteTecnico,
} = require("../controllers/tecnicosController");

// GET    /api/tecnicos       → lista todos
// GET    /api/tecnicos/:id   → uno por ID
// POST   /api/tecnicos       → crear nuevo
// PUT    /api/tecnicos/:id   → actualizar
// DELETE /api/tecnicos/:id   → eliminar

router.get("/", getTecnicos);
router.get("/:id", getTecnicoById);
router.post("/", createTecnico);
router.put("/:id", updateTecnico);
router.delete("/:id", deleteTecnico);

module.exports = router;
