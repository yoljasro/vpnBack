// server.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import telegramRoutes from "./routes/telegramRoutes.js";
import serverRoutes from "./routes/serverRoutes.js";
import wireguardRoutes from "./routes/wireguardRoutes.js";

dotenv.config();

const app = express();

// =====================
// Middlewares
// =====================
app.use(express.json());
app.use(cors({ origin: "*", credentials: true }));
app.use(helmet());
app.use(morgan("dev"));

// =====================
// Routes
// =====================
app.use("/api/auth", authRoutes);
app.use("/api/auth/telegram", telegramRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/wireguard", wireguardRoutes); // ✅ tavsiya etiladi

// =====================
// Health check
// =====================
app.get("/", (req, res) => {
  res.send("VPN Backend is running...");
});

// =====================
// Global error handler
// =====================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// =====================
// Start server (DB bilan)
// =====================
const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 VPN Backend server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
