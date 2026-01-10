import Server from "../models/Server.js";
import WireguardClient from "../models/WireguardClient.js";
import {
  addPeerToWireguard,
  removePeerFromWireguard
} from "../utils/wireguard.js";
import { selectBestServer } from "../utils/selectBestServer.js";
import { allocateIp, releaseIp } from "../utils/ipAllocator.js";

/**
 * ======================================================
 * 1️⃣ VPN CONNECT / REGISTER
 * ======================================================
 */
export const registerWireguardClient = async (req, res) => {
  try {
    const {
      serverId,
      clientPublicKey,
      clientPrivateKey,
      userId
    } = req.body;

    // 🔹 Validation
    if (!clientPublicKey || !clientPrivateKey || !userId) {
      return res.status(400).json({
        success: false,
        message: "clientPublicKey, clientPrivateKey yoki userId yetishmayapti"
      });
    }

    /**
     * 🔹 Server tanlash
     */
    let server;
    if (serverId) {
      server = await Server.findById(serverId);
      if (!server || server.status !== "online") {
        return res.status(404).json({
          success: false,
          message: "Server topilmadi yoki offline"
        });
      }
    } else {
      server = await selectBestServer();
      if (!server) {
        return res.status(500).json({
          success: false,
          message: "Mos server topilmadi"
        });
      }
    }

    /**
     * 🔹 Client allaqachon ulanganmi?
     */
    const existingClient = await WireguardClient.findOne({
      userId,
      serverId: server._id
    });

    if (existingClient) {
      return res.json({
        success: true,
        message: "Client allaqachon ulangan",
        data: {
          interface: {
            privateKey: existingClient.clientPrivateKey,
            address: `${existingClient.assignedIP}/32`,
            dns: server.dns // ✅ FAQAT server DNS
          },
          peer: {
            publicKey: server.wgPublicKey,
            endpoint: `${server.ip}:${server.wgPort}`,
            allowedIPs: ["0.0.0.0/0", "::/0"],
            persistentKeepalive: 25
          }
        }
      });
    }

    /**
     * 🔹 IP ajratish
     */
    const assignedIP = await allocateIp();
    if (!assignedIP) {
      return res.status(500).json({
        success: false,
        message: "Bo‘sh IP topilmadi"
      });
    }

    /**
     * 🔹 WireGuard peer qo‘shish
     */
    await addPeerToWireguard(server, clientPublicKey, assignedIP);

    /**
     * 🔹 DB ga yozish
     */
    await WireguardClient.create({
      serverId: server._id,
      userId,
      clientPublicKey,
      clientPrivateKey,
      assignedIP
    });

    /**
     * 🔹 Clientga config qaytarish
     */
    return res.json({
      success: true,
      message: "VPN muvaffaqiyatli ulandi",
      data: {
        interface: {
          privateKey: clientPrivateKey,
          address: `${assignedIP}/32`,
          dns: server.dns // ✅ MUHIM FIX
        },
        peer: {
          publicKey: server.wgPublicKey,
          endpoint: `${server.ip}:${server.wgPort}`,
          allowedIPs: ["0.0.0.0/0", "::/0"],
          persistentKeepalive: 25
        }
      }
    });

  } catch (err) {
    console.error("❌ REGISTER WG ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "WireGuard client ro‘yxatdan o‘tkazilmadi",
      error: err.message
    });
  }
};

/**
 * ======================================================
 * 2️⃣ CONFIG OLISH
 * ======================================================
 */
export const getUserWireguardConfig = async (req, res) => {
  try {
    const { userId } = req.params;

    const client = await WireguardClient.findOne({ userId });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client topilmadi"
      });
    }

    const server = await Server.findById(client.serverId);
    if (!server) {
      return res.status(404).json({
        success: false,
        message: "Server topilmadi"
      });
    }

    return res.json({
      success: true,
      data: {
        interface: {
          privateKey: client.clientPrivateKey,
          address: `${client.assignedIP}/32`,
          dns: server.dns // ✅ FAQAT server DNS
        },
        peer: {
          publicKey: server.wgPublicKey,
          endpoint: `${server.ip}:${server.wgPort}`,
          allowedIPs: ["0.0.0.0/0", "::/0"],
          persistentKeepalive: 25
        }
      }
    });

  } catch (err) {
    console.error("❌ GET WG CONFIG ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "WireGuard config olinmadi",
      error: err.message
    });
  }
};

/**
 * ======================================================
 * 3️⃣ VPN DISCONNECT
 * ======================================================
 */
export const deleteWireguardClient = async (req, res) => {
  try {
    const { userId } = req.params;

    const client = await WireguardClient.findOne({ userId });
    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client topilmadi"
      });
    }

    const server = await Server.findById(client.serverId);
    if (!server) {
      return res.status(404).json({
        success: false,
        message: "Server topilmadi"
      });
    }

    /**
     * 🔹 Peer o‘chirish
     */
    await removePeerFromWireguard(server, client.clientPublicKey);

    /**
     * 🔹 IP bo‘shatish
     */
    await releaseIp(client.assignedIP);

    /**
     * 🔹 DB dan o‘chirish
     */
    await client.deleteOne();

    return res.json({
      success: true,
      message: "VPN muvaffaqiyatli o‘chirildi"
    });

  } catch (err) {
    console.error("❌ DELETE WG ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Clientni o‘chirishda xatolik",
      error: err.message
    });
  }
};
