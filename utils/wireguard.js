// utils/wireguard.js
import { execSync } from "child_process";
import WireguardClient from "../models/WireguardClient.js";

// 10.7.0.X dan bo‘sh IP topish
export async function assignClientIP(serverId) {
  const clients = await WireguardClient.find({ serverId });

  const usedIPs = clients.map(c => c.assignedIP.replace("/32", "").split(".").pop());
  let newIP = 2;

  while (usedIPs.includes(newIP.toString())) newIP++;

  return `10.7.0.${newIP}/32`;
}

// Peer qo‘shish
export function addPeerToWireguard(clientPublicKey, assignedIP) {
  try {
    execSync(`wg set wg0 peer ${clientPublicKey} allowed-ips ${assignedIP}`);
    execSync(`wg syncconf wg0 <(wg-quick strip wg0)`);
    return true;
  } catch (err) {
    console.error("WG ERROR:", err);
    return false;
  }
}
