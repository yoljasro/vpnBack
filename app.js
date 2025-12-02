import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import connectDB from "./config/db.js";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());

// DB connect
connectDB();

// Routes
import authRoutes from "./routes/authRoutes.js";
import serverRoutes from "./routes/serverRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import deviceRoutes from "./routes/deviceRoutes.js";

app.use("/api/auth", authRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/device", deviceRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server started on port ${process.env.PORT}`);
});
