import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { buildAdminRouter } from "./admin/admin.js";

import authRoutes from "./routes/authRoutes.js";
import telegramRoutes from "./routes/telegramRoutes.js";
import serverRoutes from "./routes/serverRoutes.js";
import wireguardRoutes from "./routes/wireguardRoutes.js";

dotenv.config();

const app = express();

// 🔥 ADMINJS UCHUN SHART
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "*", credentials: true }));
app.use(
  helmet({
    contentSecurityPolicy: false, // AdminJS bilan ishlash uchun
  })
);
app.use(morgan("dev"));

// ❗❗ ADMIN PANELNI ENG BIRINCHI ULAYMIZ
connectDB()
  .then(() => {
    console.log("MongoDB connected");

    buildAdminRouter(app); // 👈 BU JOY MUHIM

    // API routes KEYIN
    app.use("/api/auth", authRoutes);
    app.use("/api/auth/telegram", telegramRoutes);
    app.use("/api/servers", serverRoutes);
    app.use("/api/wireguard", wireguardRoutes);

    app.get("/", (req, res) => {
      res.send("VPN Backend is running...");
    });

    app.use((err, req, res, next) => {
      console.error("❌ Error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on ${PORT}`);
      console.log(`🛠 Admin: http://localhost:${PORT}/admin`);
    });
  })
  .catch((err) => {
    console.error("Mongo error:", err);
    process.exit(1);
  });
