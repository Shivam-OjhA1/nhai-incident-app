const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// ✅ CORS Fix — Allow Vercel frontend + localhost
const allowedOrigins = [
  "http://localhost:3000",
  "https://nhai-incident-app.vercel.app",
  "https://nhai-incident-3jsojhhja-shivam-ojha1s-projects.vercel.app",
  /\.vercel\.app$/,  // ✅ Allow ALL vercel preview URLs automatically
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.some((allowed) =>
      typeof allowed === "string"
        ? allowed === origin
        : allowed.test(origin)
    );

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log("❌ CORS blocked:", origin);
      callback(new Error("CORS Not Allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/incidents", require("./routes/incidentRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "🚧 Highway Incident Reporting API is running!" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
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
      console.log(`📡 API Base URL: http://localhost:${process.env.PORT || 5000}/api`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });