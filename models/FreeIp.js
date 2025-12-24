// models/FreeIp.js
import mongoose from "mongoose";

const freeIpSchema = new mongoose.Schema({
  ip: { type: String, unique: true }
});

export default mongoose.model("FreeIp", freeIpSchema);
