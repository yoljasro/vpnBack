// utils/telegramAuth.js
import crypto from "crypto";

/**
 * Telegram uchun data check string yasash va HMAC tekshirish
 * Telegram docs: https://core.telegram.org/widgets/login
 */
export const telegramAuthValidator = (req, res, next) => {
  try {
    const data = req.body || {};
    if (!data.hash) {
      return res.status(400).json({ message: "Telegram data missing hash" });
    }

    // Build data_check_string: sort keys (except hash) and join with \n
    const keys = Object.keys(data).filter((k) => k !== "hash").sort();
    const dataCheckArray = keys.map((k) => `${k}=${data[k]}`);
    const dataCheckString = dataCheckArray.join("\n");

    // secret_key = sha256(bot_token)
    const secretKey = crypto.createHash("sha256").update(process.env.TELEGRAM_BOT_TOKEN).digest();

    // HMAC SHA256 of data_check_string using secret_key
    const hmac = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (hmac !== data.hash) {
      return res.status(403).json({ message: "Telegram auth failed" });
    }

    // attach user data (id, first_name, username, auth_date, etc.)
    req.user = {};
    keys.forEach((k) => {
      req.user[k] = data[k];
    });

    next();
  } catch (err) {
    console.error("telegramAuthValidator error:", err);
    return res.status(500).json({ message: "Telegram auth error" });
  }
};

export default telegramAuthValidator;
