// backend/routes/chatRoutes.js
const express = require("express");
const router = express.Router();
const {
  startChat,
  getHistory,
  getSessionMessages,
  sendMessage,
  getAllSessions,
  adminReply,
  renameSession,
  deleteSession,
  markChatResolved,
} = require("../controllers/chatController");
const { protect, authorize } = require("../Middleware/authMiddleware");

// user endpoints
router.post("/start", protect, startChat);
router.get("/history", protect, getHistory);
router.get("/:id/messages", protect, getSessionMessages);
router.post("/send", protect, sendMessage);

// admin endpoints
router.get("/sessions", protect, authorize("admin"), getAllSessions);
router.post("/reply", protect, authorize("admin"), adminReply);

// session actions
router.put("/:id", protect, renameSession); // rename
router.delete("/:id", protect, deleteSession); // delete
router.put("/:id/resolve", protect, authorize("admin"), markChatResolved);

module.exports = router;
  