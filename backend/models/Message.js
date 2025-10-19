const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ChatSession",
      required: false, // ✅ make optional so dashboard chatbot works without session
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: {
      type: String,
      enum: ["student", "faculty", "admin", "ai"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    response: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
