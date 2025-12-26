import Server from "../models/Server.js"; // .js extension qo‘shildi

export const getServers = async (req, res) => {
  try {
    const servers = await Server.find();
    res.json(servers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getServerById = async (req, res) => {
  try {
    const server = await Server.findById(req.params.id);
    if (!server) return res.status(404).json({ message: "Server topilmadi" });
    res.json(server);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createServer = async (req, res) => {
  const { name, ip, location, protocol, status, load } = req.body;
  try {
    const newServer = new Server({ name, ip, location, protocol, status, load });
    await newServer.save();
    res.status(201).json(newServer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateServer = async (req, res) => {
  try {
    const server = await Server.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!server) return res.status(404).json({ message: "Server topilmadi" });
    res.json(server);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteServer = async (req, res) => {
  try {
    const server = await Server.findByIdAndDelete(req.params.id);
    if (!server) return res.status(404).json({ message: "Server topilmadi" });
    res.json({ message: "Server o'chirildi" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};