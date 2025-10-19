const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../Middleware/authMiddleware");
const { getStudentStats, getTopFAQs } = require("../controllers/studentDashboardController");

router.get("/stats", protect, authorize("student"), getStudentStats);
router.get("/faqs/top", protect, authorize("student"), getTopFAQs);

module.exports = router;
