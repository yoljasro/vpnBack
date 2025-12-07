// routes/userRoutes.js
import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    return res.json({ user: req.user });
  } catch (err) {
    console.error("get profile err:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    await user.save();
    return res.json({ message: "Profile updated", user });
  } catch (err) {
    console.error("update profile err:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
