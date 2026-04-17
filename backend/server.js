/**
 * Main Server File
 * Entry point for the application
 */

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/database");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { apiLimiter } = require("./middleware/rateLimiter");

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Security Middleware
app.use(helmet()); // Sets various HTTP headers for security

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Allow cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body Parser Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie Parser Middleware
app.use(cookieParser());

// Rate Limiting
app.use("/api/", apiLimiter);

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// Health check route
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Secure Authentication API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      user: "/api/user",
      health: "/health",
    },
  });
});

// 404 Handler
app.use(notFound);

// Error Handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║     🔐 Secure Authentication Server          ║
╠══════════════════════════════════════════════╣
║  Status: ✅ Running                          ║
║  Port: ${PORT}                               ║
║  Environment: ${process.env.NODE_ENV || "development"}                   ║
║  URL: http://localhost:${PORT}               ║
╚══════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});
