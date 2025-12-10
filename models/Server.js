// models/Server.js
import mongoose from "mongoose";

const serverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ip: { type: String, required: true },
  location: { 
    type: String, 
    enum: ["Germany", "Latvia", "Estonia", "Turkey", "Singapore", "USA"], 
    required: true 
  },
  protocol: { type: String, enum: ["OpenVPN", "WireGuard"], required: true },
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  load: { type: Number, default: 0 }, // foiz (0-100)
}, { timestamps: true });

export default mongoose.model("Server", serverSchema);
