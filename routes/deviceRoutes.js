import express from "express";

const router = express.Router();

// Get device info
router.get("/info/:deviceId", (req, res) => {
  const { deviceId } = req.params;
  res.json({
    success: true,
    deviceId,
    status: "connected",
  });
});

// Register device
router.post("/register", (req, res) => {
  const { deviceName } = req.body;
  res.json({
    success: true,
    message: "Device registered",
    deviceName,
  });
});

// Remove device
router.delete("/remove/:deviceId", (req, res) => {
  const { deviceId } = req.params;
  res.json({
    success: true,
    message: `Device ${deviceId} removed`,
  });
});

export default router;
