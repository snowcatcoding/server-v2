import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandling from "./middleware/errorHandler.js";
import authMiddleware from "./middleware/authMiddleware.js";
import requestLogger from "./middleware/requestLogger.js";
import createUserTable from "./data/createUserTable.js";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Global Middleware
app.use(requestLogger);
app.use(express.json());
app.use(cors());

// System Health & Monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Root Database Check
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()");
    res.status(200).json({
      service: "User Service API",
      status: "online",
      database: result.rows[0].current_database,
      version: "2.1.0"
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// Protected API Routes
app.use("/api", authMiddleware);
app.use("/api/user", userRoutes);

// Error Handling Middleware
app.use(errorHandling);

// Initialize DB Table
createUserTable();

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT current_database()");
    res.status(200).json({
      message: "Welcome to Server API v2",
      dbName: result.rows[0].current_database,
      version: "2.0.0"
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Database query failed" });
  }
});

//server running
app.listen(PORT, () => {
  console.log(`Server is running on http:localhost:${port}`);


});
