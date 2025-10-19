import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { motion } from "framer-motion";
import { MessageCircle, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";
import api from "../../services/api";

export default function FacultyFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("System");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch faculty's own feedbacks
  const loadFeedbacks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/feedback/my");
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setError("Failed to load your feedbacks.");
    } finally {
      setLoading(false);
    }
  };

  // Submit new feedback
  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError("Subject and message are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/api/feedback", { subject, message, category });
      setSuccess("Feedback submitted successfully ✅");
      setSubject("");
      setMessage("");
      setCategory("System");
      await loadFeedbacks();
    } catch (err) {
      console.error("Submit feedback error:", err);
      setError("Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Resolved":
        return "text-green-400";
      case "Reviewed":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Resolved":
        return <CheckCircle size={16} className="text-green-400" />;
      case "Reviewed":
        return <Clock size={16} className="text-yellow-400" />;
      default:
        return <AlertCircle size={16} className="text-gray-400" />;
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-2">
            <MessageCircle size={26} /> Faculty Feedback
          </h1>
          <p className="text-slate-400 text-sm mt-2 md:mt-0">
            Share issues or suggestions about the AI Helpdesk system.
          </p>
        </div>

        {/* Submit Feedback Form */}
        <motion.form
          onSubmit={submitFeedback}
          className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Enter feedback subject..."
                className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="System">System</option>
                <option value="Chatbot">Chatbot</option>
                <option value="UI">UI</option>
                <option value="Performance">Performance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Describe your issue or suggestion..."
              className="w-full p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 px-5 py-2 rounded-lg text-white font-medium flex items-center gap-2"
          >
            <Send size={16} /> {loading ? "Submitting..." : "Submit Feedback"}
          </button>

          {error && <div className="text-red-400 text-sm">{error}</div>}
          {success && <div className="text-green-400 text-sm">{success}</div>}
        </motion.form>

        {/* Feedback History */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-5">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4">
            My Feedback History
          </h2>

          {loading ? (
            <p className="text-gray-400">Loading feedbacks...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-gray-500 italic">
              No feedback submitted yet.
            </p>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((fb) => (
                <motion.div
                  key={fb._id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-indigo-300 font-semibold">{fb.subject}</h3>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(fb.status)}
                      <span className={`text-sm ${getStatusColor(fb.status)}`}>
                        {fb.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{fb.message}</p>
                  <div className="text-xs text-gray-500">
                    Category: {fb.category} |{" "}
                    {new Date(fb.createdAt).toLocaleString()}
                  </div>

                  {fb.reply && (
                    <div className="mt-3 bg-gray-700 rounded-lg p-3 text-sm text-gray-200">
                      <strong className="text-indigo-400">Admin Reply:</strong>{" "}
                      {fb.reply}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
