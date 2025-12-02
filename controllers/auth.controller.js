import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateCode from "../utils/code.js";
import { sendVerificationEmail } from "../utils/mailer.js";
import { generateAccessToken, generateRefreshToken, verifyToken } from "../utils/token.js";

const REFRESH_TOKEN_SALT_ROUNDS = 10;
const VERIFICATION_CODE_TTL_MINUTES = 15;

export const registerEmail = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email) return res.status(400).json({ message: "Email kiritilmagan" });
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Parol kamida 6 ta belgidan bo‘lishi kerak" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email allaqachon ro‘yxatdan o‘tgan" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateCode(6);
    const expires = new Date(Date.now() + VERIFICATION_CODE_TTL_MINUTES * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      verificationCode,
      verificationCodeExpires: expires,
      isVerified: false,
    });

    // Email yuborish o‘rniga console.log qilamiz
    console.log(`Verification code for ${email}: ${verificationCode}`);

    res.status(201).json({
      message: "Foydalanuvchi yaratildi. Verification code console.log da ko‘rish mumkin.",
    });
  } catch (err) {
    console.error("registerEmail err:", err);
    res.status(500).json({ message: err.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: "Email va kod talab qilinadi" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    if (user.verificationCode !== code)
      return res.status(400).json({ message: "Kod noto‘g‘ri" });

    if (user.verificationCodeExpires && user.verificationCodeExpires < new Date())
      return res.status(400).json({ message: "Kod muddati o‘tgan. Yangi kod so‘rang." });

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);

    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error("verifyEmail err:", err);
    res.status(500).json({ message: err.message });
  }
};

export const loginEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email va parol talab qilinadi" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    if (!user.isVerified) return res.status(403).json({ message: "Email tasdiqlanmagan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Parol noto‘g‘ri" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const refreshTokenHash = await bcrypt.hash(refreshToken, REFRESH_TOKEN_SALT_ROUNDS);

    user.refreshTokenHash = refreshTokenHash;
    await user.save();

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error("loginEmail err:", err);
    res.status(500).json({ message: err.message });
  }
};

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
    res.json({ accessToken });
  } catch (err) {
    console.error("refreshToken err:", err);
    res.status(500).json({ message: err.message });
  }
};
