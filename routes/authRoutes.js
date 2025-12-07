// routes/authRoutes.js
import express from "express";
import { registerEmailImmediate, loginEmail, refreshToken, telegramLogin, getMe , updateProfile  } from "../controllers/auth.controller.js";
import telegramAuthValidator from "../utils/telegramAuth.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", registerEmailImmediate);
router.post("/login", loginEmail);
router.post("/refresh-token", refreshToken);

// Telegram route: can be used with Telegram widget (frontend) which posts the Telegram data
router.post("/telegram-login", telegramAuthValidator, telegramLogin);

// get current user
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateProfile); // profile update


export default router;
