const FAQ = require('../models/FAQ');
const { reindexFAQs } = require('../utils/chatbot');

/**
 * @desc Get all FAQs (with pagination, search & category filter)
 * @route GET /api/faq
 * @access Protected (student/faculty/admin)
 */
const getAllFAQs = async (req, res) => {
  try {
    const { q, category, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (q && q.trim()) {
      filter.question = { $regex: q.trim(), $options: "i" };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [faqs, total] = await Promise.all([
      FAQ.find(filter)
        .populate("createdBy", "name email")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      FAQ.countDocuments(filter),
    ]);

    res.status(200).json({
      faqs,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("❌ Error fetching FAQs:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Add new FAQ (admin only)
 * @route POST /api/faq
 * @access Admin
 */
const addFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    if (!question || !answer) {
      return res
        .status(400)
        .json({ message: "Both question and answer are required." });
    }

    const faq = await FAQ.create({
      question,
      answer,
      category: category || "general",
      createdBy: req.user?._id || null,
    });

    // 🔁 Auto-reindex chatbot after creation
    await reindexFAQs();

    res.status(201).json(faq);
  } catch (error) {
    console.error("❌ Error adding FAQ:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Update FAQ (admin only)
 * @route PUT /api/faq/:id
 * @access Admin
 */
const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    faq.question = req.body.question || faq.question;
    faq.answer = req.body.answer || faq.answer;
    faq.category = req.body.category || faq.category || "general";

    await faq.save();

    // 🔁 Auto-reindex chatbot after update
    await reindexFAQs();

    res.status(200).json(faq);
  } catch (error) {
    console.error("❌ Error updating FAQ:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Delete FAQ (admin only)
 * @route DELETE /api/faq/:id
 * @access Admin
 */
const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const faq = await FAQ.findById(id);
    if (!faq) return res.status(404).json({ message: "FAQ not found" });

    await FAQ.deleteOne({ _id: id });

    // 🔁 Auto-reindex chatbot after deletion
    

    res.status(200).json({ message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting FAQ:", error);
    res.status(500).json({ message: error.message });
  }
};

const getTopFAQs = async (req, res) => {
  try {
    // return top N most recent or most used - here we return most recent
    const top = await FAQ.find().sort({ updatedAt: -1 }).limit(6).lean();
    return res.json(top);
  } catch (err) {
    console.error("getTopFAQs:", err);
    return res.status(500).json({ message: err.message });
  }
};

const getFaqCount = async (req, res) => {
  try {
    const count = await FAQ.countDocuments();
    return res.json({ count });
  } catch (err) {
    console.error("getFaqCount:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  getTopFAQs,
  getFaqCount,
};
