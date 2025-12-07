// routes/telegramRoutes.js
import express from "express";
import { telegramLogin } from "../controllers/telegram.controller.js";

const router = express.Router();

// Telegram orqali login/register
router.post("/login", telegramLogin);

export default router;
