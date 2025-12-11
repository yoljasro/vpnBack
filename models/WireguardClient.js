// models/WireguardClient.js
import mongoose from "mongoose";

const wgClientSchema = new mongoose.Schema(
  {
    userId: { type: String },
    serverId: { type: mongoose.Schema.Types.ObjectId, ref: "Server" },
    clientPublicKey: { type: String, required: true },
    assignedIP: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("WireguardClient", wgClientSchema);
