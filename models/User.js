// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: "" },
    password: { type: String, minlength: 6 },
    avatar: { type: String, default: null },
    premium: { type: Boolean, default: false },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    isVerified: { type: Boolean, default: false },
    telegramId: { type: String, unique: true, sparse: true },
    refreshTokenHash: { type: String },
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
