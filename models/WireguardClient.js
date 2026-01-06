import mongoose from "mongoose";

const wgClientSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Server",
      required: true
    },
    clientPublicKey: { type: String, required: true },
    clientPrivateKey: { type: String, required: true }, // 🔥 QO‘SHILDI
    assignedIP: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.model("WireguardClient", wgClientSchema);
