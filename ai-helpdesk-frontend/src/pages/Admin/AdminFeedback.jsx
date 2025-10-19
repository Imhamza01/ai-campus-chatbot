import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import { MessageSquare, Trash2, CheckCircle2, Clock, Filter } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const loadFeedback = async () => {
    try {
      const res = await api.get("/api/feedback");
      setFeedbacks(res.data || []);
    } catch (err) {
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/api/feedback/${id}/status`, { status });
      toast.success(`Marked as ${status}`);
      loadFeedback();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this feedback?")) return;
    await api.delete(`/api/feedback/${id}`);
    toast.success("Feedback deleted");
    loadFeedback();
  };

  const filteredFeedbacks =
    filter === "All" ? feedbacks : feedbacks.filter((f) => f.status === filter);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-2">
            <MessageSquare /> Feedback Management
          </h1>
          <div className="flex items-center gap-2">
            <Filter />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-gray-800 text-white px-3 py-1 rounded"
            >
              <option>All</option>
              <option>Pending</option>
              <option>Reviewed</option>
              <option>Resolved</option>
            </select>
          </div>
        </div>

        {/* Feedback List */}
        {loading ? (
          <div className="text-gray-400">Loading feedback...</div>
        ) : filteredFeedbacks.length === 0 ? (
          <div className="text-gray-500 italic">No feedback available.</div>
        ) : (
          <div className="grid gap-3">
            {filteredFeedbacks.map((f) => (
              <motion.div
                key={f._id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border ${
                  f.status === "Resolved"
                    ? "border-green-600 bg-green-900/20"
                    : f.status === "Reviewed"
                    ? "border-yellow-600 bg-yellow-900/20"
                    : "border-gray-700 bg-gray-900/70"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg text-indigo-300 font-semibold">{f.subject}</h3>
                    <p className="text-gray-300 mt-1">{f.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      From: {f.user?.name || "Unknown"} ({f.user?.role}) |{" "}
                      {new Date(f.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {f.status !== "Resolved" && (
                      <button
                        onClick={() => handleStatusChange(f._id, "Resolved")}
                        className="text-green-400 hover:text-green-500"
                        title="Mark as Resolved"
                      >
                        <CheckCircle2 />
                      </button>
                    )}
                    {f.status === "Pending" && (
                      <button
                        onClick={() => handleStatusChange(f._id, "Reviewed")}
                        className="text-yellow-400 hover:text-yellow-500"
                        title="Mark as Reviewed"
                      >
                        <Clock />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(f._id)}
                      className="text-red-400 hover:text-red-500"
                      title="Delete Feedback"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
