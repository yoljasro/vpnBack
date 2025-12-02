// routes/authRoutes.js
import express from "express";
import {
  registerEmail,
  verifyEmail,
  loginEmail,
  refreshToken,
} from "../controllers/auth.controller.js";
import telegramAuthValidator from "../utils/telegramAuth.js";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

const router = express.Router();

// Email routes
router.post("/register", registerEmail);
router.post("/verify-email", verifyEmail);
router.post("/login", loginEmail);
router.post("/refresh-token", refreshToken);

// Telegram login (expects body from Telegram widget / web app)
router.post("/telegram-login", telegramAuthValidator, async (req, res) => {
  try {
    const { id, username, first_name } = req.user;
    let user = await User.findOne({ telegramId: id });
    if (!user) {
      user = await User.create({ telegramId: id, name: first_name });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    // hash and save refresh token
    const bcrypt = await import("bcryptjs");
    const refreshTokenHash = await bcrypt.default.hash(refreshToken, 10);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error("telegram-login error:", err);
    res.status(500).json({ message: "Telegram login error" });
  }
});

export default router;
