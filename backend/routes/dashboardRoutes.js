// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const { getAdminStats } = require("../controllers/dashboardController");
const { protect, authorize } = require("../Middleware/authMiddleware");

router.get("/stats", protect, authorize("admin"), getAdminStats);

module.exports = router;
