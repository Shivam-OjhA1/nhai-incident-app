const express = require("express");
const router = express.Router();
const {
  reportIncident,
  getIncidents,
  getIncidentById,
  getStats,
} = require("../controllers/incidentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

// Stats - Admin only
router.get("/stats", protect, adminOnly, getStats);

// Get all incidents (filtered) / Report new incident
router.route("/").get(protect, getIncidents).post(protect, upload.single("photo"), reportIncident);

// Get single incident
router.get("/:id", protect, getIncidentById);

module.exports = router;
