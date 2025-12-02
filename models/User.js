// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: false, trim: true },
    email: { type: String, unique: true, sparse: true, trim: true },
    phone: { type: String, trim: true },
    password: { type: String, minlength: 6 },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date }, // kod muddati uchun
    isVerified: { type: Boolean, default: false },
    telegramId: { type: String, unique: true, sparse: true },
    refreshTokenHash: { type: String }, // refresh tokenni hash qilib saqlaymiz
    devices: [
      {
        deviceId: String,
        deviceName: String,
        registeredAt: { type: Date, default: Date.now },
      },
    ],
    sessions: [
      {
        startTime: Date,
        endTime: Date,
        duration: String,
        server: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
