const Feedback = require('../models/Feedback');

// Submit feedback (student)
const submitFeedback = async (req, res) => {
  try {
    const { message, rating } = req.body;
    const feedback = await Feedback.create({ user: req.user._id, message, rating });
    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all feedback (admin)
const getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('user', 'name email');
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitFeedback, getAllFeedback };
