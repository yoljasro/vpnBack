// scripts/defaultServers.js
import mongoose from "mongoose";
import Server from "../models/Server.js";

const defaultServers = [
  { name: "Germany Server", ip: "81.0.0.1", location: "Germany", protocol: "OpenVPN", status: "online", load: 20 },
  { name: "Latvia Server", ip: "85.0.0.2", location: "Latvia", protocol: "WireGuard", status: "online", load: 10 },
  { name: "Estonia Server", ip: "91.0.0.3", location: "Estonia", protocol: "OpenVPN", status: "online", load: 5 },
  { name: "Turkey Server", ip: "95.0.0.4", location: "Turkey", protocol: "WireGuard", status: "online", load: 15 },
  { name: "Singapore Server", ip: "101.0.0.5", location: "Singapore", protocol: "OpenVPN", status: "online", load: 30 },
  { name: "USA Server", ip: "104.0.0.6", location: "USA", protocol: "WireGuard", status: "online", load: 25 },
];

mongoose.connect("mongodb://127.0.0.1:27017/vpn", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log("MongoDB ulandi, default serverlar qo‘shilyapti...");
  for (let server of defaultServers) {
    const exists = await Server.findOne({ name: server.name });
    if (!exists) await new Server(server).save();
  }
  console.log("Default serverlar qo‘shildi");
  process.exit();
})
.catch(err => console.log(err));
