// controllers/wireguard.controller.js
import Server from "../models/Server.js";
import WireguardClient from "../models/WireguardClient.js";
import { assignClientIP, addPeerToWireguard } from "../utils/wireguard.js";

export const registerWireguardClient = async (req, res) => {
  try {
    const { serverId, clientPublicKey, userId } = req.body;

    const server = await Server.findById(serverId);
    if (!server) return res.status(404).json({ message: "Server topilmadi" });

    const assignedIP = await assignClientIP(serverId);

    await addPeerToWireguard(clientPublicKey, assignedIP);

    const newClient = await WireguardClient.create({
      serverId,
      userId,
      clientPublicKey,
      assignedIP
    });

    res.json({
      assignedIP,
      serverPublicKey: server.wgPublicKey,
      endpoint: `${server.ip}:${server.wgPort}`,
      dns: server.dns,
      allowedIPs: server.allowedIPs
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
