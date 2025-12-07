// controllers/telegram.controller.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const telegramLogin = async (req, res) => {
  try {
    const { authData } = req.body;

    if (!authData) {
      return res.status(400).json({ message: "No Telegram auth data provided" });
    }

    // 🔐 Telegram auth verification
    const secret = crypto.createHash("sha256")
      .update(process.env.TELEGRAM_BOT_TOKEN)
      .digest();

    const checkString = Object.keys(authData)
      .filter((key) => key !== "hash")
      .sort()
      .map((key) => `${key}=${authData[key]}`)
      .join("\n");

    const hmac = crypto
      .createHmac("sha256", secret)
      .update(checkString)
      .digest("hex");

    if (hmac !== authData.hash) {
      return res.status(401).json({ message: "Invalid Telegram login" });
    }

    const telegramId = authData.id;
    const firstName = authData.first_name || "NoName";
    const username = authData.username || "";

    // 🔍 User oldin bo‘lganmi?
    let user = await User.findOne({ telegramId });

    if (!user) {
      // ➕ Yangi user yaratish
      user = await User.create({
        name: firstName,
        telegramId,
        username,
        authType: "telegram",
      });
    }

    // 🔑 Token yaratish
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Telegram login successful",
      token,
      user,
    });

  } catch (error) {
    console.error("Telegram Auth Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
