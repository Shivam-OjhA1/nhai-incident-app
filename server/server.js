const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ✅ CORS Fix
const allowedOrigins = [
  "http://localhost:3000",
  /\.vercel\.app$/,
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.some((allowed) =>
      typeof allowed === "string" ? allowed === origin : allowed.test(origin)
    );
    if (isAllowed) callback(null, true);
    else callback(new Error("CORS Not Allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect MongoDB once (Vercel serverless safe)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("✅ MongoDB Connected");
};
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/incidents", require("./routes/incidentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "🚧 Highway Incident Reporting API is running!" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ✅ For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(process.env.PORT || 5500, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5500}`);
  });
}

// ✅ Required for Vercel serverless
module.exports = app;