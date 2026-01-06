import IpCounter from "../models/IpCounter.js";
import FreeIp from "../models/FreeIp.js";

const WG_SUBNET = "10.7.0"; // 🔥 SERVER BILAN MOS

export async function allocateIp() {
  const freeIp = await FreeIp.findOneAndDelete({});
  if (freeIp) return freeIp.ip;

  const counter = await IpCounter.findOneAndUpdate(
    { name: "wg-ip" },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );

  if (counter.value > 254) {
    throw new Error("IP_POOL_EXHAUSTED");
  }

  return `${WG_SUBNET}.${counter.value}`;
}

export async function releaseIp(ip) {
  await FreeIp.create({ ip });
}
