// backend/controllers/profileController.js
const User = require("../models/UserMain");
const bcrypt = require("bcryptjs");

/**
 * GET /api/profile
 * Protected - returns current user's public profile (no password)
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/profile
 * Protected - update name/email (admin-only fields not allowed here)
 */
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (email) {
      // if email changed, ensure uniqueness
      if (email !== user.email) {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already in use" });
        user.email = email;
      }
    }

    await user.save();
    const out = await User.findById(user._id).select("-password");
    res.json({ message: "Profile updated", user: out });
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * PUT /api/profile/password
 * Protected - change password; requires currentPassword + newPassword
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword; // pre-save middleware in model will hash
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("changePassword error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
