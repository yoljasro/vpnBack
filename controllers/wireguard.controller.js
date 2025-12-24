import Server from "../models/Server.js";
import WireguardClient from "../models/WireguardClient.js";
import {
  addPeerToWireguard,
  removePeerFromWireguard
} from "../utils/wireguard.js";
import { selectBestServer } from "../utils/selectBestServer.js";
import { allocateIp, releaseIp } from "../utils/ipAllocator.js";

/**
 * 1️⃣ Client public keyni ro‘yxatdan o‘tkazish (VPN connect)
 */
export const registerWireguardClient = async (req, res) => {
  try {
    const { serverId, clientPublicKey, userId } = req.body;

    if (!clientPublicKey || !userId) {
      return res.status(400).json({
        success: false,
        message: "Majburiy field yetishmayapti"
      });
    }

    // ✅ Server tanlash
    let server;
    if (!serverId) {
      server = await selectBestServer();
    } else {
      server = await Server.findById(serverId);
      if (!server) {
        return res.status(404).json({
          success: false,
          message: "Server topilmadi"
        });
      }
    }

    // ✅ Shu serverda oldin ro‘yxatdan o‘tganmi?
    const existingClient = await WireguardClient.findOne({
      userId,
      serverId: server._id
    });

    if (existingClient) {
      return res.json({
        success: true,
        message: "Client allaqachon ro‘yxatdan o‘tgan",
        data: {
          interface: {
            address: existingClient.assignedIP,
            dns: server.dns
          },
          peer: {
            publicKey: server.wgPublicKey,
            endpoint: `${server.ip}:${server.wgPort}`,
            allowedIPs: server.allowedIPs
          }
        }
      });
    }

    // ✅ IP ajratish (TO‘G‘RI FUNKSIYA)
    const assignedIP = await allocateIp(server._id);

    // ✅ WireGuard peer qo‘shish
    await addPeerToWireguard(server, clientPublicKey, assignedIP);

    // ✅ DB ga yozish
    await WireguardClient.create({
      serverId: server._id,
      userId,
      clientPublicKey,
      assignedIP
    });

    return res.json({
      success: true,
      data: {
        interface: {
          address: assignedIP,
          dns: server.dns
        },
        peer: {
          publicKey: server.wgPublicKey,
          endpoint: `${server.ip}:${server.wgPort}`,
          allowedIPs: server.allowedIPs
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
 * 2️⃣ Client uchun WireGuard config olish
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
          address: client.assignedIP,
          dns: server.dns
        },
        peer: {
          publicKey: server.wgPublicKey,
          endpoint: `${server.ip}:${server.wgPort}`,
          allowedIPs: server.allowedIPs
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
 * 3️⃣ Clientni o‘chirish (disconnect)
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

    // 1️⃣ WG dan o‘chirish
    await removePeerFromWireguard(client.clientPublicKey);

    // 2️⃣ IP bo‘shatish
    await releaseIp(client.assignedIP);

    // 3️⃣ DB dan o‘chirish
    await client.deleteOne();

    return res.json({
      success: true,
      message: "Client o‘chirildi"
    });

  } catch (err) {
    console.error("❌ DELETE WG ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
