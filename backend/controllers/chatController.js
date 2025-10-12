// controllers/chatController.js
const fetch = require("node-fetch");
const Message = require("../models/Message.js");
const { findBestAnswer } = require("../utils/chatbot.js");
const dotenv = require("dotenv");

dotenv.config();

const sendMessage = async (req, res) => {
  const { userId, message } = req.body;

  try {
    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message text is required." });
    }

    // 1️⃣ Try local FAQ fuzzy match
    const match = findBestAnswer(message);

    if (match && match.score < 0.45) {
      const responseText = match.item.answer;
      const chat = await Message.create({
        user: userId,
        message,
        response: responseText,
      });
      return res.json(chat);
    }

    // 2️⃣ Fallback to Wit.ai if available
    let responseText = "Sorry, I don’t have an answer for that.";

    if (process.env.WIT_AI_TOKEN) {
      const witResponse = await fetch(
        `https://api.wit.ai/message?v=20251012&q=${encodeURIComponent(message)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.WIT_AI_TOKEN}`,
          },
        }
      );

      const data = await witResponse.json();
      const intent = data.intents?.[0]?.name || "unknown";
      responseText = `Hmm... I detected intent: ${intent}`;
    }

    // 3️⃣ Save chat in DB
    const chat = await Message.create({
      user: userId,
      message,
      response: responseText,
    });

    res.json(chat);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendMessage };
