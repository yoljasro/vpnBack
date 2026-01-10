import express from "express";
import {
  registerWireguardClient,
  getUserWireguardConfig,
  deleteWireguardClient
} from "../controllers/wireguard.controller.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

/**
 * 🔐 VPN connect / register
 */
router.post(
  "/register-client",
  authMiddleware,
  registerWireguardClient
);

/**
 * 🔐 Config olish (token orqali)
 */
router.get(
  "/config",
  authMiddleware,
  getUserWireguardConfig
);

/**
 * 🔐 VPN disconnect
 */
router.delete(
  "/disconnect",
  authMiddleware,
  deleteWireguardClient
);

export default router;
