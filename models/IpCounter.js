import mongoose from "mongoose";

const ipCounterSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  value: { type: Number, default: 2 } // 10.0.0.2 dan boshlaymiz
});

export default mongoose.model("IpCounter", ipCounterSchema);
