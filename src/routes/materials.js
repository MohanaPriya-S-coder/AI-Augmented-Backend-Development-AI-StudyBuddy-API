const express = require("express");

const { authenticate } = require("../middleware/auth");

const {
  createMaterial,
  getMyMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");

const router = express.Router();

router.post("/upload", authenticate, createMaterial);

router.get("/", authenticate, getMyMaterials);

router.get("/:id", authenticate, getMaterialById);

router.put("/:id", authenticate, updateMaterial);

router.delete("/:id", authenticate, deleteMaterial);

module.exports = router;