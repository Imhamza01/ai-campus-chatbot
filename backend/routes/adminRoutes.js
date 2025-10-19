const express = require("express");
const { protect, authorize } = require("../Middleware/authMiddleware");
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,getProfile,updateProfile
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.get("/users", protect, authorize("admin", "faculty"), getAllUsers);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

module.exports = router;
