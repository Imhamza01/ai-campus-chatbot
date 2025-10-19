// controllers/dashboardController.js
const User = require("../models/UserMain");
const Ticket = require("../models/Ticket");
const FAQ = require("../models/FAQ");
const Feedback = require("../models/Feedback");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
exports.getAdminStats = async (req, res) => {
  try {
    const [users, tickets, faqs, feedbacks, notifications, chats] = await Promise.all([
      User.countDocuments(),
      Ticket.countDocuments(),
      FAQ.countDocuments(),
      Feedback.countDocuments(),
      Notification.countDocuments(),
      Message.countDocuments(),
    ]);

    res.json({
      users,
      tickets,
      faqs,
      feedbacks,
      notifications,
      chats,
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: err.message });
  }
};