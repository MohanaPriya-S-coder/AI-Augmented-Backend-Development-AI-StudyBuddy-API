const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const {
  getAllUsers,
  getUserById,
  deleteUser,
  getStats,
} = require("../controllers/adminController");

const router = express.Router();

// All admin routes require authentication AND Admin role
router.use(authenticate, authorize("Admin"));

// GET  /api/admin/users       — list all users
router.get("/users", getAllUsers);

// GET  /api/admin/users/:id   — get a single user
router.get("/users/:id", getUserById);

// DELETE /api/admin/users/:id — delete a user and all their data
router.delete("/users/:id", deleteUser);

// GET  /api/admin/stats       — platform-wide usage statistics
router.get("/stats", getStats);

module.exports = router;
