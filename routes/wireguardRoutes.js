// routes/wireguardRoutes.js
import express from "express";
import {
  registerWireguardClient,
  getUserWireguardConfig
} from "../controllers/wireguard.controller.js";

const router = express.Router();

router.post("/register-client", registerWireguardClient);
router.get("/config/:userId", getUserWireguardConfig);

export default router;
