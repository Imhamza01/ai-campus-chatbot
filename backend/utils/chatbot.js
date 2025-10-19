const Fuse = require("fuse.js");
const FAQ = require("../models/FAQ.js");

let fuseInstance = null;

/**
 * Load FAQ index initially or manually.
 */
async function loadFaqIndex() {
  const faqs = await FAQ.find().lean();
  if (!faqs.length) {
    console.warn("⚠️ No FAQs found in database.");
    return 0;
  }

  fuseInstance = new Fuse(faqs, {
    keys: ["question", "answer"], // ✅ search both
    includeScore: true,
    threshold: 0.45, // ✅ more flexible
    distance: 200,   // ✅ tolerate minor differences
    minMatchCharLength: 2,
  });

  console.log(`🔁 Loaded ${faqs.length} FAQ(s) into Fuse index`);
  return faqs.length;
}

/**
 * Find the best answer for chatbot query
 */
function findBestAnswer(text) {
  if (!fuseInstance) return null;
  const results = fuseInstance.search(text, { limit: 5 });
  if (!results.length) return null;
  const best = results[0];
  return { item: best.item, score: best.score };
}

module.exports = { findBestAnswer, loadFaqIndex };
