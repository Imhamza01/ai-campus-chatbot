const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const FAQ = require('../models/FAQ');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const filePath = path.join(__dirname, 'faqSeed.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    await FAQ.deleteMany({});
    await FAQ.insertMany(data);
    console.log(`✅ FAQs seeded successfully: ${data.length} entries`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding FAQs:", err);
  }
}
seed();
