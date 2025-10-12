// utils/chatbot.js
const Fuse = require ("fuse.js");
const FAQ = require ("../models/FAQ.js"); // or ../models/FAQ

let fuseInstance = null;

async function loadFaqIndex() {
  const faqs = await FAQ.find().lean();
  fuseInstance = new Fuse(faqs, {
    keys: ["question"],
    threshold: 0.35,    // tune: lower = stricter
    distance: 100,
    minMatchCharLength: 3,
  });
  return faqs.length;
}

function findBestAnswer(text) {
  if (!fuseInstance) return null;
  const results = fuseInstance.search(text, { limit: 5 });
  if (!results || results.length === 0) return null;
  // results[0].score lower is better
  const best = results[0];
  return { item: best.item, score: best.score };
}
module.exports= {findBestAnswer,loadFaqIndex}