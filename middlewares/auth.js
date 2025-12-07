// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;
    if (!token) return res.status(401).json({ message: "Token topilmadi" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) return res.status(401).json({ message: "Token noto'g'ri" });

    const user = await User.findById(payload.id).select("-password -refreshTokenHash");
    if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

    req.user = user;
    next();
  } catch (err) {
    console.error("authMiddleware:", err);
    return res.status(401).json({ message: "Avtorizatsiya xatosi" });
  }
};
