// backend/scripts/seedFaqs.js
import fs from "fs";
import mongoose from "mongoose";
import dotenv from "dotenv";
import FAQ from "../models/FAQ.js";

dotenv.config();

const MONGO = process.env.MONGO_URI;

async function seed() {
  try {
    await mongoose.connect(MONGO);
    console.log("✅ Connected to MongoDB");

    const data = JSON.parse(fs.readFileSync("./backend/scripts/faqSeed.json", "utf8")); // ✅ FIXED path

    await FAQ.deleteMany({});
    await FAQ.insertMany(data);
    console.log(`✅ FAQs seeded successfully: ${data.length} entries`);

    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error seeding FAQs:", err);
    process.exit(1);
  }
}

seed();
