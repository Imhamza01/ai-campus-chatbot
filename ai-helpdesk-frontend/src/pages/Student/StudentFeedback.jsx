import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import { MessageCircle, Send, PlusCircle } from "lucide-react";

export default function StudentFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState({ subject: "", message: "", category: "Other" });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState(null);

  const categories = ["System", "Chatbot", "UI", "Performance", "Other"];

  const loadFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/feedback/my");
      setFeedbacks(res.data);
    } catch (err) {
      console.error("Load feedback error:", err);
      setMsg({ type: "error", text: "Failed to load feedbacks" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setMsg({ type: "error", text: "Subject and message required" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post("/api/feedback", form);
      setFeedbacks([res.data, ...feedbacks]);
      setForm({ subject: "", message: "", category: "Other" });
      setMsg({ type: "success", text: "Feedback submitted successfully!" });
    } catch (err) {
      console.error("Submit feedback error:", err);
      setMsg({ type: "error", text: "Failed to submit feedback" });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-2">
            <MessageCircle /> My Feedback
          </h1>
          <button
            onClick={loadFeedbacks}
            className="px-3 py-1 bg-gray-800 text-sm rounded hover:bg-gray-700"
          >
            Refresh
          </button>
        </div>

        {msg && (
          <div
            className={`mb-4 p-3 rounded ${
              msg.type === "error" ? "bg-red-700" : "bg-green-700"
            } text-white`}
          >
            {msg.text}
          </div>
        )}

        {/* Submit Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <PlusCircle size={18} className="text-indigo-400" />
            <h2 className="text-xl font-semibold text-indigo-300">
              Submit New Feedback
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="p-3 bg-gray-800 rounded text-white border border-gray-700"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="p-3 bg-gray-800 rounded text-white border border-gray-700"
            >
              {categories.map((cat) => (
                <option key={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <textarea
            rows="4"
            placeholder="Your feedback message..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full mt-4 p-3 bg-gray-800 rounded text-white border border-gray-700"
          ></textarea>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-white flex items-center gap-2"
            >
              <Send size={16} /> {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>

        {/* Feedback History */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4">
            My Previous Feedback
          </h2>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-gray-500 italic">No feedback submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((fb) => (
                <div
                  key={fb._id}
                  className="border border-gray-700 p-4 rounded-lg bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-indigo-300">
                      {fb.subject}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        fb.status === "Resolved"
                          ? "bg-green-700"
                          : fb.status === "Reviewed"
                          ? "bg-yellow-600"
                          : "bg-gray-600"
                      }`}
                    >
                      {fb.status}
                    </span>
                  </div>
                  <p className="text-gray-300 mt-2">{fb.message}</p>
                  <div className="text-sm text-slate-400 mt-2">
                    Category: {fb.category}
                  </div>
                  {fb.reply && (
                    <div className="mt-3 bg-gray-700 p-2 rounded text-sm text-green-300">
                      <strong>Admin reply:</strong> {fb.reply}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-2">
                    {new Date(fb.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
