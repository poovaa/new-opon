
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import signupRoutes from "./routes/signupRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import stockMasterRoutes from "./routes/stockMasterRoutes.js";
import lccMasterRoutes from "./routes/lccMasterRoutes.js";
import stockMasterTransactionRoutes from "./routes/stockMasterTransactionRoutes.js";

// Load .env from the project root (opon/.env)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:4200",
      "http://localhost:5173",
      "http://127.0.0.1:4200",
      "http://localhost:63935",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Node.js server is working!",
  });
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/signup", signupRoutes);
app.use("/api/login", loginRoutes);
app.use("/api/stockmaster", stockMasterRoutes);
app.use("/api/lccmaster", lccMasterRoutes);
app.use(
  "/api/stockmaster-transactions",
  stockMasterTransactionRoutes
);

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error("Request error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message:
      err.status === 400
        ? "Invalid JSON request body"
        : "Internal server error",
  });
});

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
