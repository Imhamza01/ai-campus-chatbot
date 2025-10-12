// scripts/seedFaqs.js
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const FAQ = (await import('../models/FAQ.js')).default; // adjust path if needed

const MONGO = process.env.MONGO_URI;

async function seed() {
  await mongoose.connect(MONGO);
  const data = JSON.parse(fs.readFileSync('./utils/faqSeed.json', 'utf8'));
  await FAQ.deleteMany({});
  await FAQ.insertMany(data);
  console.log('FAQs seeded:', data.length);
  await mongoose.disconnect();
}
seed().catch(err => { console.error(err); process.exit(1); });
