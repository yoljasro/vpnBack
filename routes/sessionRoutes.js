import express from "express";

const router = express.Router();

// Start VPN session
router.post("/start", (req, res) => {
  res.json({
    success: true,
    sessionId: "ABC123",
    message: "Session started",
  });
});

// Stop VPN session
router.post("/stop", (req, res) => {
  res.json({
    success: true,
    message: "Session stopped",
  });
});

// Get session history
router.get("/history", (req, res) => {
  res.json({
    success: true,
    sessions: [
      { id: 1, duration: "10 min", date: "2025-11-29" },
      { id: 2, duration: "22 min", date: "2025-11-28" },
    ],
  });
});

export default router;
