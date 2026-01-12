import IpCounter from "../models/IpCounter.js";
import FreeIp from "../models/FreeIp.js";

const WG_SUBNET = "10.7.0"; // 🔥 SERVER BILAN MOS
const MAX_IP = 254; // 10.7.0.1 server, 10.7.0.2–10.7.0.254 client IP

/**
 * IP ajratish
 */
export async function allocateIp() {
  // 🔹 Avval free pool dan olish
  const freeIp = await FreeIp.findOneAndDelete({});
  if (freeIp) return freeIp.ip;

  // 🔹 Counter asosida IP yaratish
  const counter = await IpCounter.findOneAndUpdate(
    { name: "wg-ip" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  if (counter.value > MAX_IP) {
    throw new Error("IP_POOL_EXHAUSTED");
  }

  return `${WG_SUBNET}.${counter.value}`;
}

/**
 * IP bo‘shatish
 */
export async function releaseIp(ip) {
  // 10.7.0.1 server IP bo‘shatmaslik uchun tekshirish
  if (ip === `${WG_SUBNET}.1`) return;

  await FreeIp.create({ ip });
}
