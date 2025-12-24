import { exec as _exec } from "child_process";
import util from "util";
import { withWgLock } from "./wgMutex.js";

const exec = util.promisify(_exec);

// ➕ IP ajratish callback emas, allocateIp orqali
export async function assignClientIP() {
  throw new Error("Use allocateIp() from ipAllocator.js");
}

// ➕ ADD PEER
export const addPeerToWireguard = async (server, publicKey, ip) => {
  return withWgLock(async () => {
    await exec(`wg set wg0 peer ${publicKey} allowed-ips ${ip}/32`);
    await exec(`wg-quick save wg0`);
  });
};

// ❌ REMOVE PEER
export const removePeerFromWireguard = async (publicKey) => {
  return withWgLock(async () => {
    await exec(`wg set wg0 peer ${publicKey} remove`);
    await exec(`wg-quick save wg0`);
  });
};
