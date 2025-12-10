import express from "express";
import {
  getServers,
  getServerById,
  createServer,
  updateServer,
  deleteServer
} from "../controllers/server.controller.js";  // .js qo‘shildi

const router = express.Router();

router.get("/", getServers);
router.get("/:id", getServerById);
router.post("/", createServer);
router.patch("/:id", updateServer);
router.delete("/:id", deleteServer);

export default router;
