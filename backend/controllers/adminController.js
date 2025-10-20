const User = require("../models/UserMain");
const { sendEmail } = require("../utils/mailer");
const { createNotification } = require("../utils/notifications");

// GET all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const users = await User.find(filter).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// GET a single user by ID (admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE user (admin only)
const createUser = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;

    if (!name || !email || !role || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["student", "faculty", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    } 

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({ name, email, role, password });

    // 🔔 Create notification
    await createNotification(
      user._id,
      `Your account has been created. Check your email for credentials`
    );

    // 📧 Send account email
    try {
      await sendEmail({
        to: email,
        subject: "Your Account Has Been Created",
        html: `
          <h3>Welcome ${name}!</h3>
          <p>Your account has been created by admin.</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Password:</strong> ${password}</p>
          <p>Please login and change your password immediately.</p>
        `,
      });
    } catch (err) {
      console.error("Error sending account email:", err.message);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE user (admin only)
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, role, password } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role && ["student", "faculty"].includes(role)) user.role = role;
    if (password) user.password = password;

    await user.save();
    res.json({ message: "User updated", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE user (admin only)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✏️ Update Admin Profile
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.save();

    await createNotification(
      user._id,
      "Your profile was successfully updated."
    );

    res.json({
      message: "Profile updated successfully",
      user: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile
};
