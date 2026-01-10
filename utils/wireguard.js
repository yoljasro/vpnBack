import { exec as _exec } from "child_process";
import util from "util";
import { withWgLock } from "./wgMutex.js";

const exec = util.promisify(_exec);

/**
 * ======================================================
 * 1️⃣ WireGuard peer qo‘shish
 * ======================================================
 * server - Server modeli object
 * publicKey - client public key
 * ip - ajratilgan IP
 */
export const addPeerToWireguard = async (server, publicKey, ip) => {
  return withWgLock(async () => {
    const iface = server.wgInterface || "wg0";
    const cmd = `sudo wg set ${iface} peer ${publicKey} allowed-ips ${ip}/32 persistent-keepalive 25`;

    try {
      console.log(`🔹 Running: ${cmd}`);
      await exec(cmd);

      // 🔹 WireGuard konfiguratsiyasini saqlash
      await exec(`sudo wg-quick save ${iface}`);
      console.log(`✅ Peer ${publicKey} successfully added to ${iface} with IP ${ip}`);
    } catch (err) {
      console.error("❌ WG ADD PEER ERROR:", err);
      throw new Error(`WireGuard peer qo‘shishda xatolik: ${err.message}`);
    }
  });
};

/**
 * ======================================================
 * 2️⃣ WireGuard peer o‘chirish
 * ======================================================
 * server - Server modeli object
 * publicKey - client public key
 */
export const removePeerFromWireguard = async (server, publicKey) => {
  return withWgLock(async () => {
    const iface = server.wgInterface || "wg0";

    try {
      console.log(`🔹 Removing peer ${publicKey} from ${iface}`);
      await exec(`sudo wg set ${iface} peer ${publicKey} remove`);

      // 🔹 WireGuard konfiguratsiyasini saqlash
      await exec(`sudo wg-quick save ${iface}`);
      console.log(`✅ Peer ${publicKey} successfully removed from ${iface}`);
    } catch (err) {
      console.error("❌ WG REMOVE PEER ERROR:", err);
      throw new Error(`WireGuard peer o‘chirishda xatolik: ${err.message}`);
    }
  });
};
