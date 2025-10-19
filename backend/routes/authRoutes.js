const express =require ("express");
const { register, login } = require ("../controllers/authController.js");
const { protect } = require ("../Middleware/authMiddleware.js");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// ✅ Add this profile route
router.get("/profile", protect, async (req, res) => {
  try {
    if (!req.user) return res.status(404).json({ message: "User not found" });
    res.json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports= router;
