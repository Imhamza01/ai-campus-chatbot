const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");
const { loadFaqIndex } = require("./utils/chatbot");

// Route imports
const faqRoutes = require("./routes/faqRoutes");
const chatRoutes = require("./routes/chatRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentDashboardRoutes = require("./routes/studentDashboardRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const profileRoutes = require("./routes/profileRoutes")

dotenv.config();
connectDB();

// 🔄 Load Fuse FAQ index
loadFaqIndex()
  .then((n) => console.log(`✅ FAQs indexed: ${n}`))
  .catch((e) => console.error("❌ FAQ index error:", e));

const app = express();
app.use(cors());
app.use(express.json());

// 🧱 Global rate limiter
app.use("/api/", rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: "Too many requests, try again later."
}));

// 🔗 Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/chat", chatRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/studentDashboard", studentDashboardRoutes);
app.use("/api/profile", profileRoutes);

// 🧪 Test route
app.get("/", (req, res) => {
  res.send("AI Campus Chatbot Backend is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
