// backend/controllers/notificationController.js
const Notification = require("../models/Notification");

/**
 * Helper to map notifications with isRead (for current user)
 */
function mapWithIsRead(notifications, userId) {
  return notifications.map((n) => {
    // Convert to plain object (in case it's a mongoose doc)
    const obj = typeof n.toObject === "function" ? n.toObject() : { ...n };
    obj.isRead = Array.isArray(obj.readBy) && obj.readBy.some((id) => id?.toString() === userId?.toString());
    // Do not return full readBy (optional) — keep for debugging
    return obj;
  });
}

// Admin: get all notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(200).lean();
    const userId = req.user?._id?.toString();
    return res.json(mapWithIsRead(notifications, userId));
  } catch (err) {
    console.error("getAllNotifications error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Generic role-based notifications (student/faculty/admin)
const getRoleNotifications = async (req, res) => {
  try {
    const role = req.user?.role || "student";
    // fetch notifications addressed to this role or "all" or to the user specifically (if you ever add personal ones)
    const notifications = await Notification.find({
      $or: [{ recipientRole: role }, { recipientRole: "all" }],
    })
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    const userId = req.user?._id?.toString();
    return res.json(mapWithIsRead(notifications, userId));
  } catch (err) {
    console.error("getRoleNotifications error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Create
const createNotification = async (req, res) => {
  try {
    const { title, message, type, recipientRole } = req.body;
    const notification = await Notification.create({ title, message, type, recipientRole });
    return res.status(201).json(notification);
  } catch (err) {
    console.error("createNotification error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Mark single notification as read (per-user)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id === "mark-all") return res.status(400).json({ message: "Invalid id" });

    const notification = await Notification.findById(id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    const userId = req.user._id;
    // Use addToSet to avoid duplicates
    if (!notification.readBy.some((u) => u.toString() === userId.toString())) {
      notification.readBy.push(userId);
      await notification.save();
    }

    return res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("markAsRead error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Mark all relevant notifications as read for requesting user only
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    // Limit to notifications visible to this role (or all)
    const filter = {
      $and: [
        { readBy: { $ne: userId } },
        { $or: [{ recipientRole: role }, { recipientRole: "all" }] },
      ],
    };

    await Notification.updateMany(filter, { $addToSet: { readBy: userId } });

    return res.json({ message: "All notifications marked as read for you" });
  } catch (err) {
    console.error("markAllAsRead error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Delete (admin)
const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    return res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("deleteNotification error:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllNotifications,
  getRoleNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
