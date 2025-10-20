// backend/utils/witai.js
require('dotenv').config()
const axios = require('axios');
const WIT_AI_TOKEN = (process.env.WIT_AI_TOKEN || '').trim();

console.log('🔑 Wit.ai token loaded?', !!WIT_AI_TOKEN);

const INTENT_ANSWER_MAP = {
  'reset_password': 'To reset your LMS password: visit the Portal -> Password Reset or contact IT at it-support@uspmultan.edu.pk.',
  'ask_schedule': 'Check the Student Portal → My Courses to see your schedule.',
  'apply_scholarship': 'Visit Finance → Scholarships on the Portal and fill the application form.',
  // add more mappings for your known intents
};

async function askWitAI(message) {
  if (!WIT_AI_TOKEN) {
    console.warn('Wit.ai token missing; skipping Wit.ai call.');
    return null;
  }

  try {
    const res = await axios.get('https://api.wit.ai/message', {
      params: { q: message, v: '20251012' },
      headers: {
        Authorization: `Bearer ${WIT_AI_TOKEN}`,
        Accept: 'application/vnd.wit.20170307+json',
      },
      timeout: 5000,
    });

    const data = res.data || {};
    // data.intents is an array with confidence
    const topIntent = (data.intents && data.intents[0]) || null;
    if (topIntent && topIntent.name) {
      const mapped = INTENT_ANSWER_MAP[topIntent.name];
      if (mapped) {
        return mapped; // direct canned answer
      } else {
        // If not mapped, return a friendly fallback telling the recognized intent
        return `I detected the intent "${topIntent.name}" (confidence ${topIntent.confidence.toFixed(2)}).`;
      }
    }

    // if entities exist, return a quick message describing them
    const entities = data.entities || {};
    if (Object.keys(entities).length) {
      const parts = Object.keys(entities).map((k) => `${k}`);
      return `Detected entities: ${parts.join(', ')}`;
    }

    // last fallback: return text if Wit sent something (rare)
    if (data.text) return data.text;

    return null;
  } catch (err) {
    console.error('Wit.ai API error:', err.response?.data || err.message);
    return null;
  }
}

module.exports = { askWitAI };
