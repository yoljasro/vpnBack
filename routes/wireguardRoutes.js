// routes/wireguardRoutes.js
import express from "express";
import {
  registerWireguardClient,
  getUserWireguardConfig
} from "../controllers/wireguard.controller.js";

const router = express.Router();

// Client public key ro‘yxatdan o‘tishi (VPN connect)
router.post("/register-client", registerWireguardClient);

// Client uchun WireGuard config olish
router.get("/config/:userId", getUserWireguardConfig);

export default router;
