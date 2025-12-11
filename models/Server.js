// models/Server.js
import mongoose from "mongoose";

const serverSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ip: { type: String, required: true },
    location: { type: String, required: true },
    protocol: { type: String, required: true },
    status: { type: String, default: "online" },
    load: { type: Number, default: 0 },

    // WireGuard fields
    wgPort: { type: Number, default: 51820 },
    wgPublicKey: { type: String },
    dns: { type: String, default: "1.1.1.1" },
    allowedIPs: { type: String, default: "0.0.0.0/0" }
  },
  { timestamps: true }
);

export default mongoose.model("Server", serverSchema);
