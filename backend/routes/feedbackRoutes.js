const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../Middleware/authMiddleware");
const {
  submitFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  deleteFeedback,
  getMyFeedbacks,
  adminReply,
} = require("../controllers/feedbackController");

// Student routes
router.post("/", protect, submitFeedback);
router.get("/my", protect, getMyFeedbacks);

// Admin routes
router.get("/", protect, authorize("admin"), getAllFeedback);
router.put("/:id/status", protect, authorize("admin"), updateFeedbackStatus);
router.put("/:id/reply", protect, authorize("admin"), adminReply);
router.delete("/:id", protect, authorize("admin"), deleteFeedback);

module.exports = router;
