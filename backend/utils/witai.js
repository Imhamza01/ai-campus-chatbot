// backend/utils/witai.js
const axios = require("axios");
const WIT_AI_TOKEN = (process.env.WIT_AI_TOKEN || "").trim();
console.log("🔑 Wit.ai token loaded?", !!WIT_AI_TOKEN);

async function askWitAI(message) {
  if (!WIT_AI_TOKEN) {
    console.warn("⚠️ askWitAI called but no token available");
    return null;
  }

  try {
    const res = await axios.get("https://api.wit.ai/message", {
      params: {
        q: message,
        v: "20251012"
      },
      headers: {
        Authorization: `Bearer ${WIT_AI_TOKEN}`,
        Accept: "application/vnd.wit.20180315+json"
      }
    });

    if (res.data) {
      console.log("📬 Wit.ai raw response:", JSON.stringify(res.data));
      const { text, intents, entities, _text } = res.data;
      if (text) {
        return text;
      }
      // sometimes _text contains original message, so use it as fallback
      if (_text && intents && intents.length > 0) {
        return `Intent detected: ${intents[0].name}`;
      }
      if (entities && Object.keys(entities).length) {
        return `Detected entities: ${Object.keys(entities).join(", ")}`;
      }
    }

    return null;
  } catch (err) {
    console.error("❌ Wit.ai API error:", err.response?.data || err.message);
    return null;
  }
}

module.exports = { askWitAI };
