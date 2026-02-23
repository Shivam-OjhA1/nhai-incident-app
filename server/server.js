const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/incidents", require("./routes/incidentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check route
app.get("/", (req, res) => {
  res.json({ message: "🚧 Highway Incident Reporting API is running!" });
});

app.use((err, req, res, next) => {
  // This properly converts any error object to readable string
  const errorMessage = err?.message || JSON.stringify(err) || "Unknown error";
  const errorStack = err?.stack || "";

  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("❌ SERVER ERROR:");
  console.error("   Message :", errorMessage);
  console.error("   Route   :", req.method, req.originalUrl);
  if (errorStack) console.error("   Stack   :", errorStack.split("\n")[1]?.trim());
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  res.status(err.status || 500).json({
    success: false,
    message: errorMessage,
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    app.listen(process.env.PORT || 5500, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });


