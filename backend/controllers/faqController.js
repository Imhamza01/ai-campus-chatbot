const FAQ = require('../models/FAQ');

// Get all FAQs (students & faculty)
const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find().populate('createdBy', 'name email');
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new FAQ (admin only)
const addFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ message: "Both question and answer are required" });
    }

    const faq = await FAQ.create({
      question,
      answer,
      createdBy: req.user._id
    });

    res.status(201).json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update FAQ (admin only)
const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    faq.question = req.body.question || faq.question;
    faq.answer = req.body.answer || faq.answer;
    await faq.save();

    res.status(200).json(faq);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete FAQ (admin only)
const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    await FAQ.deleteOne({ _id: id });
    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllFAQs, addFAQ, updateFAQ, deleteFAQ };
