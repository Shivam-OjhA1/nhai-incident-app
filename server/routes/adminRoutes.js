const express = require("express");
const router = express.Router();
const {
  updateIncident,
  deleteIncident,
  getAllUsers,
  toggleUserStatus,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// All admin routes are protected
router.use(protect, adminOnly);

// Incident management
router.put("/incidents/:id", updateIncident);
router.delete("/incidents/:id", deleteIncident);

// User management
router.get("/users", getAllUsers);
router.put("/users/:id", toggleUserStatus);

module.exports = router;
