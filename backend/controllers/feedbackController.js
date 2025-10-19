// controllers/feedbackController.js
const Feedback = require("../models/Feedback");

// 🧠 User submits feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { subject, message, category } = req.body;
    const feedback = await Feedback.create({
      user: req.user._id,
      subject,
      message,
      category,
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👑 Admin: Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 👑 Admin: Update status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status is required" });

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!feedback)
      return res.status(404).json({ message: "Feedback not found" });

    res.json({ message: `Feedback marked as ${status}`, feedback });
  } catch (err) {
    console.error("Update feedback status error:", err);
    res.status(500).json({ message: err.message });
  }
};  
// 👑 Admin: Delete feedback
exports.deleteFeedback = async (req, res) => {
  try {
    const fb = await Feedback.findByIdAndDelete(req.params.id);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    console.error("Get my feedback error:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.adminReply = async (req, res) => {
  try {
    const { reply } = req.body;
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });
    fb.reply = reply;
    fb.status = "Reviewed";
    await fb.save();
    res.json({ message: "Reply saved", feedback: fb });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};  
