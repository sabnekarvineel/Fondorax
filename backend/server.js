
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();

const db = require("./config/db");
const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || "./uploads";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created uploads directory at: ${uploadDir}`);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  limit: "50mb",
  extended: true
}));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Server is running",
    database: "MySQL"
  });
});

// Start only after confirming MySQL is available
async function startServer() {
  try {
    await db.query("SELECT 1");
    console.log("MySQL connected successfully");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MySQL connection error:", error.message);
    process.exitCode = 1;
  }
}

startServer();

module.exports = app;
