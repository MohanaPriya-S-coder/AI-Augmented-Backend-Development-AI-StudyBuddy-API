require("dotenv").config();
const { authenticate } = require("./src/middleware/auth");
const express = require("express");
const cors = require("cors");
const materialRoutes = require("./src/routes/materials");
const connectDB = require("./src/utils/db");
const authRoutes = require("./src/routes/auth");
const aiRoutes = require("./src/routes/ai");
const adminRoutes = require("./src/routes/admin");

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/material", materialRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "AI StudyBuddy API is running",
  });
});

// Protected test route (for development/testing)
app.get("/api/protected-test", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "You accessed a protected route",
    user: req.user,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`AI StudyBuddy server running on http://localhost:${PORT}`);
  });
};

startServer();