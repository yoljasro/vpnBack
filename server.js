// server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import telegramRoutes from "./routes/telegramRoutes.js"; // ✅ TO‘G‘RI

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use(helmet());
app.use(morgan("dev"));

// Database
await connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/telegram", telegramRoutes); // ✅ TO‘G‘RI

// Home route
app.get("/", (req, res) => {
  res.send("VPN Backend is running...");
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 VPN Backend server started on port ${PORT}`)
);
