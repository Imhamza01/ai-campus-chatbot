// backend/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../Middleware/authMiddleware");
const {
  getAllNotifications,
  getRoleNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

// GET notifications for current user role (student/faculty/admin) - protected
router.get("/me", protect, getRoleNotifications);

// PUT mark all relevant notifications as read for this user
router.put("/mark-all/read", protect, markAllAsRead);

// PUT mark single notification as read
router.put("/:id/read", protect, markAsRead);

// Admin endpoints
router.get("/", protect, authorize("admin"), getAllNotifications);
router.post("/", protect, authorize("admin"), createNotification);
router.delete("/:id", protect, authorize("admin"), deleteNotification);

module.exports = router;
