// server.js (siz bergan ESM versiya)
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
// import serverRoutes from "./routes/serverRoutes.js";
// import sessionRoutes from "./routes/sessionRoutes.js";
// import deviceRoutes from "./routes/deviceRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

await connectDB(); // agar connectDB async bo'lsa await bilan chaqiring

app.use("/api/auth", authRoutes);
// app.use("/api/servers", serverRoutes);
// app.use("/api/session", sessionRoutes);
// app.use("/api/device", deviceRoutes);

app.get("/", (req, res) => res.send("VPN Backend is running..."));

// error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 VPN Backend server started on port ${PORT}`));
