const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["Accident", "Pothole", "Breakdown", "Obstruction", "Fire", "Flood", "Other"],
      required: [true, "Incident type is required"],
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      required: [true, "Severity level is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      lat: {
        type: Number,
        required: [true, "Latitude is required"],
      },
      lng: {
        type: Number,
        required: [true, "Longitude is required"],
      },
      highway: {
        type: String,
        required: [true, "Highway name is required"],
        // e.g., NH-44
      },
      km: {
        type: Number,
        required: [true, "KM mark is required"],
        // e.g., 342 means 342km mark on highway
      },
      landmark: {
        type: String,
        default: "",
        // e.g., Near Sohna Toll Plaza
      },
    },
    photo: {
      type: String,
      default: "", // Cloudinary URL
    },
    status: {
      type: String,
      enum: ["Pending", "Assigned", "In Progress", "Resolved"],
      default: "Pending",
    },
    assignedTeam: {
      type: String,
      default: "",
    },
    adminNotes: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for faster queries
incidentSchema.index({ "location.highway": 1, status: 1 });
incidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Incident", incidentSchema);
