import React, { useState, useEffect, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { motion } from "framer-motion";
import { GraduationCap, Send, HelpCircle } from "lucide-react";
import api from "../../services/api";

export default function StudentDashboard() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("studentQuickChat");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [topFaqs, setTopFaqs] = useState([]);
  const chatEndRef = useRef(null);
  const [tempSessionId, setTempSessionId] = useState(null);

  // 🌀 Scroll bottom + save chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("studentQuickChat", JSON.stringify(messages));
  }, [messages]);

  // 🧠 Load FAQs
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/api/faq/top");
        setTopFaqs(res.data || []);
      } catch (err) {
        console.error("Error loading FAQs:", err);
        setTopFaqs([
          { question: "How can I reset my LMS password?" },
          { question: "Where can I find my attendance record?" },
          { question: "How do I contact my course instructor?" },
          { question: "How to submit an assignment?" },
          { question: "Where to check class schedules?" },
        ]);
      }
    })();
  }, []);

  // 🧠 Ensure quick-chat session
  const ensureSession = async () => {
    if (tempSessionId) return tempSessionId;
    const res = await api.post("/api/chat/start", { title: "Quick Chat" });
    setTempSessionId(res.data._id);
    return res.data._id;
  };

  // 🚀 Send message
  const sendToChatbot = async (inputMessage) => {
    const userMsg = inputMessage || message;
    if (!userMsg.trim()) return;

    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setMessage("");
    setLoading(true);

    try {
      const sid = await ensureSession();
      const res = await api.post("/api/chat/send", {
        sessionId: sid,
        message: userMsg,
      });

      const aiResponse = res.data.reply || res.data.response || "No response from AI.";
      setMessages((prev) => [...prev, { from: "ai", text: aiResponse }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "ai", text: "⚠️ Error contacting AI assistant." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Typing dots animation
  const TypingDots = () => (
    <div className="flex gap-1 mt-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
    </div>
  );

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-2">
            <GraduationCap size={28} /> USP ChatBot Assistant
          </h1>
          <p className="text-slate-400 text-sm mt-2 md:mt-0">
            Quick AI help for your university queries
          </p>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl shadow-lg p-6 flex flex-col justify-between"
          >
            <div className="flex-1 mb-4 space-y-4 overflow-y-auto min-h-[300px] max-h-[400px] custom-scrollbar pr-2">
              {messages.length === 0 ? (
                <div className="text-gray-500 italic text-center py-10">
                  Start chatting with your AI — ask about university life, LMS, or academics!
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`max-w-[80%] p-3 rounded-xl ${
                      msg.from === "user"
                        ? "bg-indigo-600 text-white ml-auto"
                        : "bg-gray-800 text-gray-200 mr-auto"
                    }`}
                  >
                    {msg.text}
                  </motion.div>
                ))
              )}

              {loading && (
                <div className="bg-gray-800 text-gray-300 p-3 rounded-xl w-fit mr-auto">
                  <TypingDots />
                </div>
              )}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input */}
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyDown={(e) => e.key === "Enter" && sendToChatbot()}
              />
              <button
                onClick={() => sendToChatbot()}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-500 px-5 rounded-lg text-white flex items-center gap-2 transition-all"
              >
                <Send size={18} /> {loading ? "..." : "Send"}
              </button>
            </div>
          </motion.div>

          {/* Quick FAQs */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-5"
          >
            <h2 className="text-xl font-semibold text-indigo-300 flex items-center gap-2 mb-4">
              <HelpCircle /> Quick FAQs
            </h2>
            <ul className="space-y-3 text-slate-300 text-sm">
              {topFaqs.slice(0, 6).map((f, i) => (
                <li
                  key={i}
                  onClick={() => sendToChatbot(f.question)}
                  className="bg-gray-800/70 rounded-lg p-3 hover:bg-gray-800 hover:text-indigo-300 transition cursor-pointer"
                >
                  {f.question}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
