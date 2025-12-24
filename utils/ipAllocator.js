import IpCounter from "../models/IpCounter.js";
import FreeIp from "../models/FreeIp.js";

export async function allocateIp() {
  // 1️⃣ Avval bo‘sh IP bormi?
  const freeIp = await FreeIp.findOneAndDelete({});
  if (freeIp) {
    return freeIp.ip;
  }

  // 2️⃣ Bo‘sh yo‘q bo‘lsa — yangi IP
  const counter = await IpCounter.findOneAndUpdate(
    { name: "wg-ip" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  const last = counter.value;
  if (last > 254) {
    throw new Error("IP_POOL_EXHAUSTED");
  }

  return `10.0.0.${last}`;
}

// 🔁 IP qaytarish
export async function releaseIp(ip) {
  await FreeIp.create({ ip });
}
