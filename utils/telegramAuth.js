// utils/telegramAuth.js
import crypto from "crypto";

export const telegramAuthValidator = (req, res, next) => {
  try {
    const data = req.body || {};
    if (!data.hash) {
      return res.status(400).json({ message: "Telegram data missing hash" });
    }

    const keys = Object.keys(data).filter((k) => k !== "hash").sort();
    const dataCheckArray = keys.map((k) => `${k}=${data[k]}`);
    const dataCheckString = dataCheckArray.join("\n");

    const secretKey = crypto.createHash("sha256").update(process.env.TELEGRAM_BOT_TOKEN || "").digest();
    const hmac = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (hmac !== data.hash) {
      return res.status(403).json({ message: "Telegram auth failed" });
    }

    req.user = {};
    keys.forEach((k) => (req.user[k] = data[k]));
    next();
  } catch (err) {
    console.error("telegramAuthValidator error:", err);
    return res.status(500).json({ message: "Telegram auth error" });
  }
};

export default telegramAuthValidator;
