// controllers/wireguard.controller.js
import Server from "../models/Server.js";
import WireguardClient from "../models/WireguardClient.js";
import { assignClientIP, addPeerToWireguard } from "../utils/wireguard.js";

// 1️⃣ Client public keyni ro‘yxatdan o‘tkazish (VPN connect)
export const registerWireguardClient = async (req, res) => {
  try {
    const { serverId, clientPublicKey, userId } = req.body;

    if (!serverId || !clientPublicKey || !userId) {
      return res.status(400).json({ message: "Majburiy field yetishmayapti" });
    }

    const server = await Server.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server topilmadi" });
    }

    // Client allaqachon ro‘yxatdan o‘tganmi?
    const existingClient = await WireguardClient.findOne({ userId });
    if (existingClient) {
      return res.status(400).json({ message: "Client allaqachon mavjud" });
    }

    const assignedIP = await assignClientIP(serverId);

    // Peer qo‘shish (serverda)
    await addPeerToWireguard(clientPublicKey, assignedIP);

    const newClient = await WireguardClient.create({
      serverId,
      userId,
      clientPublicKey,
      assignedIP
    });

    res.json({
      interface: {
        address: assignedIP,
        dns: server.dns
      },
      peer: {
        publicKey: server.wgPublicKey,
        endpoint: `${server.ip}:${server.wgPort}`,
        allowedIPs: server.allowedIPs // ARRAY
      }
    });

  } catch (err) {
    console.error("REGISTER WG ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// 2️⃣ Client uchun tayyor WireGuard config olish
export const getUserWireguardConfig = async (req, res) => {
  try {
    const { userId } = req.params;

    const client = await WireguardClient.findOne({ userId });
    if (!client) {
      return res.status(404).json({ message: "Client topilmadi" });
    }

    const server = await Server.findById(client.serverId);
    if (!server) {
      return res.status(404).json({ message: "Server topilmadi" });
    }

    res.json({
      interface: {
        address: client.assignedIP,
        dns: server.dns
      },
      peer: {
        publicKey: server.wgPublicKey,
        endpoint: `${server.ip}:${server.wgPort}`,
        allowedIPs: server.allowedIPs // ARRAY
      }
    });

  } catch (err) {
    console.error("GET WG CONFIG ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
