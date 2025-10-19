const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "New Chat" },
    messages: [
      {
        role: { type: String, enum: ["user", "ai", "admin"], required: true },
        message: { type: String, required: true },
      },
    ],
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatSession", chatSessionSchema);
