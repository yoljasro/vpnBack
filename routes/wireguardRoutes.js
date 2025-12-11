// routes/wireguardRoutes.js
import express from "express";
import { registerWireguardClient, getUserWireguardConfig } from "../controllers/wireguard.controller.js";

const router = express.Router();

// 1️⃣ Client public key ro‘yxatdan o‘tishi
router.post("/register-client", registerWireguardClient);

// 2️⃣ Client uchun tayyor WireGuard config olish
router.get("/config/:userId", getUserWireguardConfig);

export default router;
