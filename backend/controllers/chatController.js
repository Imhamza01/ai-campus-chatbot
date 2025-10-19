const ChatSession = require("../models/ChatSession");
const Message = require("../models/Message");
const { askWitAI } = require("../utils/witai");
const { findBestAnswer } = require("../utils/chatbot");

// 🟢 Start new session
const startChat = async (req, res) => {
  try {
    const { title } = req.body;
    const session = await ChatSession.create({
      user: req.user._id,
      title: title || "New Chat",
      messages: [],
    });
    res.status(201).json(session);
  } catch (err) {
    console.error("Start chat error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Get all sessions for the logged-in student
const getHistory = async (req, res) => {
  try {
    const sessions = await ChatSession.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🟢 Get messages in a specific session
const getSessionMessages = async (req, res) => {
  try {
    const session = await ChatSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session.messages || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🧠 Handle chat + AI logic (Fuse + Wit.ai)
const sendMessage = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: "Message is required" });

    const userId = req.user._id;
    let session =
      sessionId
        ? await ChatSession.findById(sessionId)
        : await ChatSession.findOne({ user: userId });

    if (!session) {
      session = await ChatSession.create({
        user: userId,
        title: "New Chat",
        messages: [],
      });
    }

    // 💡 Step 1: Search Fuse FAQ
    let responseText = "Sorry, I don't have an answer for that.";
    const match = findBestAnswer(message);

    if (match && match.item && match.score <= 0.5) {
      responseText = match.item.answer;
      console.log("✅ Fuse matched:", match.item.question, "score:", match.score);
    } else {
      // 💬 Step 2: Ask Wit.ai
      const witReply = await askWitAI(message);
      if (witReply) {
        responseText = witReply;
        console.log("🤖 Wit.ai replied:", witReply);
      } else {
        console.log("❌ No Wit.ai reply or FAQ match.");
      }
    }

    // 💾 Step 3: Save in `Message` model
    const msg = await Message.create({
      user: userId,
      session: session._id,
      senderRole: req.user.role,
      message,
      response: responseText,
    });

    // 🧠 Step 4: Also update ChatSession.messages for history
    session.messages.push({ role: "user", message });
    session.messages.push({ role: "ai", message: responseText });
    session.updatedAt = new Date();
    await session.save();

    res.status(201).json({ reply: responseText, sessionId: session._id });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ message: "Error contacting AI assistant." });
  }
};

// 🧑‍🏫 Admin: view all sessions
const getAllSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find()
      .populate("user", "name email role")
      .sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error("getAllSessions error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🧑‍🏫 Admin: reply in chat
const adminReply = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message)
      return res.status(400).json({ message: "Missing session or message" });

    const session = await ChatSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.messages.push({ role: "admin", message });
    session.updatedAt = new Date();
    await session.save();

    res.status(201).json(session);
  } catch (err) {
    console.error("adminReply error:", err);
    res.status(500).json({ message: err.message });
  }
};

// 🧑‍🏫 Mark chat resolved/unresolved
const markChatResolved = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolved } = req.body;

    const session = await ChatSession.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    session.resolved = resolved;
    await session.save();

    res.json({ message: `Chat marked as ${resolved ? "resolved" : "unresolved"}` });
  } catch (err) {
    console.error("markChatResolved error:", err);
    res.status(500).json({ message: err.message });
  }
};
const renameSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });

    const session = await ChatSession.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    // ensure only owner or admin can rename
    if (req.user.role !== "admin" && session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not permitted" });
    }

    session.title = title.trim();
    await session.save();
    return res.json({ message: "Renamed successfully", session });
  } catch (err) {
    console.error("renameSession error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// Delete session
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await ChatSession.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (req.user.role !== "admin" && session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not permitted" });
    }

    await ChatSession.findByIdAndDelete(id);
    // Optionally also delete messages in Message collection: await Message.deleteMany({ session: id });
    return res.json({ message: "Session deleted successfully" });
  } catch (err) {
    console.error("deleteSession error:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  startChat,
  sendMessage,
  getHistory,
  getSessionMessages,
  getAllSessions,
  adminReply,
  markChatResolved,
  renameSession,
  deleteSession,
};
