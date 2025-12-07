// controllers/auth.controller.js
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/token.js";

const REFRESH_TOKEN_SALT_ROUNDS = 10;

// ------------------- EMAIL REGISTER -------------------
export const registerEmailImmediate = async (req, res) => {
  try {
    let { name, email, password, phone } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email va parol talab qilinadi" });

    email = email.toLowerCase();
    if (password.length < 6) return res.status(400).json({ message: "Parol kamida 6 ta belgidan iborat bo‘lishi kerak" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email allaqachon ro‘yxatdan o‘tgan" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name || "",
      email,
      password: hashed,
      phone: phone || "",
      avatar: null,
      premium: false,
      registerType: "email",
      isVerified: true
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return res.status(201).json({
      message: "Registered successfully",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        premium: user.premium
      }
    });
  } catch (err) {
    console.error("registerEmailImmediate err:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------- EMAIL LOGIN -------------------
export const loginEmail = async (req, res) => {
  try {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email va parol talab qilinadi" });

    email = email.toLowerCase();
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Foydalanuvchi topilmadi" });

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) return res.status(400).json({ message: "Parol noto‘g‘ri" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return res.json({
      message: "Login success",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        premium: user.premium
      }
    });
  } catch (err) {
    console.error("loginEmail err:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------- REFRESH TOKEN -------------------
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token kiritilmagan" });

    const payload = verifyToken(token, process.env.REFRESH_SECRET);
    if (!payload) return res.status(403).json({ message: "Token noto‘g‘ri yoki muddati o'tgan" });

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    const isValid = await bcrypt.compare(token, user.refreshTokenHash || "");
    if (!isValid) return res.status(403).json({ message: "Token noto‘g‘ri" });

    const accessToken = generateAccessToken(user);
    return res.json({ accessToken });
  } catch (err) {
    console.error("refreshToken err:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------- TELEGRAM LOGIN -------------------
export const telegramLogin = async (req, res) => {
  try {
    const tg = req.user; // set by telegramAuthValidator
    if (!tg || !tg.id) return res.status(400).json({ message: "Telegram data required" });

    let user = await User.findOne({ telegramId: tg.id });
    if (!user) {
      user = await User.create({
        name: tg.first_name || tg.username || "TelegramUser",
        telegramId: tg.id,
        avatar: tg.photo_url || null,
        isVerified: true,
        registerType: "telegram"
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);
    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    return res.json({
      message: "Telegram auth success",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        telegramId: user.telegramId,
        avatar: user.avatar,
        premium: user.premium || false
      }
    });
  } catch (err) {
    console.error("telegramLogin err:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ------------------- UPDATE PROFILE (/me) -------------------
export const updateProfile = async (req, res) => {
  try {
    const user = req.user; // authMiddleware orqali keladi
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    const { name, phone, avatar, premium } = req.body;

    // Foydalanuvchi ma'lumotlarini yangilash (faqat ruxsat berilgan maydonlar)
    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;
    if (premium !== undefined) user.premium = premium;

    await user.save();

    return res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email || null,
        phone: user.phone || null,
        telegramId: user.telegramId || null,
        username: user.username || null,
        avatar: user.avatar || null,
        premium: user.premium || false,
        registerType: user.registerType || "unknown",
        role: user.role || "user",
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("updateProfile err:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



// ------------------- GET PROFILE (/me) -------------------
export const getMe = async (req, res) => {
  try {
    const user = req.user; // set by authMiddleware
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email || null,
      phone: user.phone || null,
      telegramId: user.telegramId || null,
      username: user.username || null,
      avatar: user.avatar || null,
      premium: user.premium || false,
      registerType: user.registerType || "unknown",
      role: user.role || "user",
      createdAt: user.createdAt
    });
  } catch (err) {
    console.error("getMe err:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
