import Server from "../models/Server.js";
import WireguardClient from "../models/WireguardClient.js";

/**
 * Eng kam yuklangan serverni tanlash
 * @returns {Object} Server document
 */
export async function selectBestServer() {
  const servers = await Server.find({
    status: "online",
    protocol: "WireGuard"
  });

  if (!servers.length) {
    throw new Error("NO_ACTIVE_SERVERS");
  }

  let bestServer = null;
  let minClients = Infinity;

  for (const server of servers) {
    const clientCount = await WireguardClient.countDocuments({
      serverId: server._id
    });

    if (clientCount < minClients) {
      minClients = clientCount;
      bestServer = server;
    }
  }

  return bestServer;
}