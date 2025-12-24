import Server from "../models/Server.js";
import WireguardClient from "../models/WireguardClient.js";

/**
 * Eng kam yuklangan serverni tanlash
 * @returns {Object} Server document
 */
export async function selectBestServer() {
  // Barcha aktiv serverlarni olamiz
  const servers = await Server.find({ isActive: true });

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

  if (!bestServer) {
    throw new Error("SERVER_NOT_FOUND");
  }

  return bestServer;
}
