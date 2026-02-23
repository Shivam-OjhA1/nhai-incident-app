const Incident = require("../models/Incident");

const VALID_TYPES = ["Accident", "Pothole", "Breakdown", "Obstruction", "Fire", "Flood", "Other"];
const VALID_SEVERITY = ["Low", "Medium", "High", "Critical"];

// @desc    Report a new incident
// @route   POST /api/incidents
// @access  Private (Staff)
const reportIncident = async (req, res) => {
  try {
    const { type, severity, description, lat, lng, highway, km, landmark } = req.body;

    let errors = {};

    // ── 1. Type Validation ──
    if (!type || type.trim() === "") {
      errors.type = "Incident type is required";
    } else if (!VALID_TYPES.includes(type)) {
      errors.type = `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`;
    }

    // ── 2. Severity Validation ──
    if (!severity || severity.trim() === "") {
      errors.severity = "Severity level is required";
    } else if (!VALID_SEVERITY.includes(severity)) {
      errors.severity = `Invalid severity. Must be one of: ${VALID_SEVERITY.join(", ")}`;
    }

    // ── 3. Description Validation ──
    if (!description || description.trim() === "") {
      errors.description = "Incident description is required";
    } else if (description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (description.trim().length > 500) {
      errors.description = "Description must not exceed 500 characters";
    }

    // ── 4. Location Validation ──
    if (!lat || lat === "") {
      errors.lat = "Latitude is required. Use Auto GPS or enter manually.";
    } else if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.lat = "Invalid latitude value";
    }

    if (!lng || lng === "") {
      errors.lng = "Longitude is required. Use Auto GPS or enter manually.";
    } else if (isNaN(lng) || lng < -180 || lng > 180) {
      errors.lng = "Invalid longitude value";
    }

    if (!highway || highway.trim() === "") {
      errors.highway = "Highway name is required";
    }

    if (!km || km === "") {
      errors.km = "KM mark is required";
    } else if (isNaN(km) || km < 0) {
      errors.km = "Enter a valid KM mark (e.g. 342)";
    }

    // ── Return ALL errors at once ──
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed. Please fix the errors below.",
        errors,
      });
    }

    // ── Create Incident ──
    const incident = await Incident.create({
      reportedBy: req.user._id,
      type: type.trim(),
      severity: severity.trim(),
      description: description.trim(),
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        highway: highway.trim(),
        km: parseFloat(km),
        landmark: landmark?.trim() || "",
      },
      photo: req.file ? req.file.path : "",
    });

    await incident.populate("reportedBy", "name employeeId phone highway");

    res.status(201).json({
      success: true,
      message: "Incident reported successfully! Admin has been notified.",
      data: incident,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error while reporting incident",
      error: error.message,
    });
  }
};

// @desc    Get all incidents (with filters)
// @route   GET /api/incidents
// @access  Private
const getIncidents = async (req, res) => {
  try {
    const { status, type, severity, highway, startDate, endDate } = req.query;

    let filter = {};

    // Staff can only see their own incidents
    if (req.user.role === "staff") {
      filter.reportedBy = req.user._id;
    }

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (highway) filter["location.highway"] = highway;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const incidents = await Incident.find(filter)
      .populate("reportedBy", "name employeeId phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: incidents.length, data: incidents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single incident by ID
// @route   GET /api/incidents/:id
// @access  Private
const getIncidentById = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id).populate(
      "reportedBy", "name employeeId phone highway"
    );
    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }
    res.json({ success: true, data: incident });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get incident stats for dashboard
// @route   GET /api/incidents/stats
// @access  Private (Admin)
const getStats = async (req, res) => {
  try {
    const totalIncidents = await Incident.countDocuments();
    const pendingIncidents = await Incident.countDocuments({ status: "Pending" });
    const resolvedIncidents = await Incident.countDocuments({ status: "Resolved" });
    const criticalIncidents = await Incident.countDocuments({ severity: "Critical" });

    const byType = await Incident.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const byHighway = await Incident.aggregate([
      { $group: { _id: "$location.highway", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const last7Days = await Incident.aggregate([
      { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: { totalIncidents, pendingIncidents, resolvedIncidents, criticalIncidents, byType, byHighway, last7Days },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { reportIncident, getIncidents, getIncidentById, getStats };