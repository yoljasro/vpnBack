import express from "express";
import {
  registerWireguardClient,
  getUserWireguardConfig,
  deleteWireguardClient
} from "../controllers/wireguard.controller.js";

const router = express.Router();

// VPN connect
router.post("/register-client", registerWireguardClient);

// Config olish
router.get("/config/:userId", getUserWireguardConfig);

// VPN disconnect
router.delete("/disconnect/:userId", deleteWireguardClient);

export default router;
