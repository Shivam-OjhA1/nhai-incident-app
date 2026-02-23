const Incident = require("../models/Incident");
const User = require("../models/User");

// @desc    Update incident status / assign team
// @route   PUT /api/admin/incidents/:id
// @access  Admin only
const updateIncident = async (req, res) => {
  try {
    const { status, assignedTeam, adminNotes } = req.body;

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    if (status) incident.status = status;
    if (assignedTeam) incident.assignedTeam = assignedTeam;
    if (adminNotes) incident.adminNotes = adminNotes;

    // Set resolved time when marked as resolved
    if (status === "Resolved" && !incident.resolvedAt) {
      incident.resolvedAt = new Date();
    }

    await incident.save();
    await incident.populate("reportedBy", "name employeeId phone");

    res.json({
      success: true,
      message: "Incident updated successfully",
      data: incident,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete incident
// @route   DELETE /api/admin/incidents/:id
// @access  Admin only
const deleteIncident = async (req, res) => {
  try {
    const incident = await Incident.findByIdAndDelete(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }
    res.json({ success: true, message: "Incident deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all staff users
// @route   GET /api/admin/users
// @access  Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate / Deactivate user
// @route   PUT /api/admin/users/:id
// @access  Admin only
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateIncident, deleteIncident, getAllUsers, toggleUserStatus };
