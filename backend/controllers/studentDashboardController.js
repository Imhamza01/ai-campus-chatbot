const Ticket = require("../models/Ticket");
const Feedback = require("../models/Feedback");
const FAQ = require("../models/FAQ");
const Notification = require("../models/Notification");

// 📊 Student Stats
exports.getStudentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [tickets, feedbacks, notifications] = await Promise.all([
      Ticket.countDocuments({ user: userId }),
      Feedback.countDocuments({ user: userId }),
      Notification.countDocuments({
        $or: [
          { recipientRole: "student" },
          { recipientRole: "all" },
        ],
      }),
    ]);

    res.json({
      tickets,
      feedbacks,
      notifications,
      faqs: await FAQ.countDocuments(),
    });
  } catch (err) {
    console.error("Student Dashboard Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🧠 Top FAQs
exports.getTopFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ createdAt: -1 }).limit(6);
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
