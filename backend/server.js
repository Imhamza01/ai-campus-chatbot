const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const faqRoutes = require("./routes/faqRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const chatRoutes = require("./routes/chatRoutes");
const rateLimit = require("express-rate-limit");
const { loadFaqIndex } = require("./utils/chatbot");

dotenv.config();
connectDB();

// Load Fuse.js FAQ index on server start
loadFaqIndex()
  .then((n) => console.log(`✅ FAQs indexed: ${n}`))
  .catch((e) => console.error("❌ FAQ index error:", e));

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,
  message: "Too many requests, try again later.",
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/chat", chatRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));

app.use("/api/", apiLimiter);

// Test route
app.get("/", (req, res) => {
  res.send("AI Campus Chatbot Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
