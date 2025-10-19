// backend/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../Middleware/authMiddleware");
const { getProfile, updateProfile, changePassword } = require("../controllers/profileController");

router.use(protect);

router.get("/", getProfile);
router.put("/", updateProfile);
router.put("/password", changePassword);

module.exports = router;
