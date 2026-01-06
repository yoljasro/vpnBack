import { exec as _exec } from "child_process";
import util from "util";
import { withWgLock } from "./wgMutex.js";

const exec = util.promisify(_exec);

export const addPeerToWireguard = async (server, publicKey, ip) => {
  return withWgLock(async () => {
    const iface = server.wgInterface || "wg0";

    await exec(
      `wg set ${iface} peer ${publicKey} allowed-ips ${ip}/32 persistent-keepalive 25`
    );

    await exec(`wg-quick save ${iface}`);
  });
};

export const removePeerFromWireguard = async (server, publicKey) => {
  return withWgLock(async () => {
    const iface = server.wgInterface || "wg0";

    await exec(`wg set ${iface} peer ${publicKey} remove`);
    await exec(`wg-quick save ${iface}`);
  });
};
