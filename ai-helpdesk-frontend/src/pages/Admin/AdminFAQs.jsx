// src/pages/Admin/AdminFAQs.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import { Edit3, Trash2, Plus, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ question: "", answer: "", category: "general" });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });

  useEffect(() => {
    fetchFaqs(1);
  }, []);

  const fetchFaqs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get("/api/faq", { params: { q, category, page } });
      if (res.data?.faqs) {
        setFaqs(res.data.faqs);
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          total: res.data.total,
        });
      } else {
        // fallback for non-paginated response
        setFaqs(Array.isArray(res.data) ? res.data : []);
        setPagination({ currentPage: 1, totalPages: 1, total: res.data.length || 0 });
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setMessage({ type: "error", text: "Failed to load FAQs" });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ question: "", answer: "", category: "general" });
    setModalOpen(true);
  };

  const openEdit = (faq) => {
    setEditing(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "general",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) {
      setMessage({ type: "error", text: "Question & answer are required" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/faq/${editing._id}`, form);
        setMessage({ type: "success", text: "FAQ updated successfully" });
      } else {
        await api.post(`/api/faq`, form);
        setMessage({ type: "success", text: "FAQ created successfully" });
      }
      setModalOpen(false);
      fetchFaqs(pagination.currentPage);
    } catch (err) {
      console.error("Error saving FAQ:", err);
      setMessage({ type: "error", text: "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await api.delete(`/api/faq/${id}`);
      setMessage({ type: "success", text: "FAQ deleted" });
      fetchFaqs(pagination.currentPage);
    } catch (err) {
      console.error("Error deleting FAQ:", err);
      setMessage({ type: "error", text: "Delete failed" });
    }
  };

 

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">
              FAQ Knowledge Base
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage chatbot knowledge — update, add, and reindex FAQs.
            </p>
          </div>

          <div className="flex gap-2 items-center">
            
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 rounded hover:bg-indigo-500"
            >
              <Plus size={16} /> Add FAQ
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`px-4 py-2 rounded ${
              message.type === "error"
                ? "bg-red-700"
                : message.type === "success"
                ? "bg-green-700"
                : "bg-gray-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Search / Filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions..."
            className="px-3 py-2 bg-gray-800 rounded text-white w-72"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-2 py-2 bg-gray-800 rounded text-white"
          >
            <option value="">All Categories</option>
            <option value="general">General</option>
            <option value="account">Account</option>
            <option value="academic">Academic</option>
            <option value="technical">Technical</option>
            <option value="other">Other</option>
          </select>
          <button onClick={() => fetchFaqs(1)} className="px-3 py-2 bg-gray-700 rounded">
            Search
          </button>
          <button
            onClick={() => {
              setQ("");
              setCategory("");
              fetchFaqs(1);
            }}
            className="px-3 py-2 bg-gray-700 rounded"
          >
            Reset
          </button>
        </div>

        {/* FAQ List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-slate-400">Loading FAQs...</div>
          ) : faqs.length === 0 ? (
            <div className="text-slate-400">No FAQs found.</div>
          ) : (
            faqs.map((faq) => (
              <motion.div
                key={faq._id}
                whileHover={{ translateY: -3 }}
                className="bg-white/6 border border-white/6 rounded-xl p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="text-slate-300 text-sm mb-1">
                      {faq.category || "general"}
                    </div>
                    <h3 className="text-lg font-semibold text-indigo-300">
                      {faq.question}
                    </h3>
                    <p className="text-slate-400 mt-2">{faq.answer}</p>
                    <div className="text-xs text-slate-500 mt-2">
                      Updated: {new Date(faq.updatedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openEdit(faq)}
                      className="px-3 py-2 bg-indigo-600 rounded text-white flex items-center gap-2"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="px-3 py-2 bg-red-600 rounded text-white flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-6">
            <button
              disabled={pagination.currentPage <= 1}
              onClick={() => fetchFaqs(pagination.currentPage - 1)}
              className="p-2 bg-gray-700 rounded disabled:opacity-40"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-slate-400 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => fetchFaqs(pagination.currentPage + 1)}
              className="p-2 bg-gray-700 rounded disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </motion.div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModalOpen(false)}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-[90%] max-w-2xl bg-gray-900/80 p-6 rounded-xl border border-white/10 shadow-2xl"
          >
            <h3 className="text-xl font-semibold text-indigo-300 mb-3">
              {editing ? "Edit FAQ" : "Add FAQ"}
            </h3>
            <label className="block mb-3">
              <div className="text-sm text-slate-300">Question</div>
              <input
                value={form.question}
                onChange={(e) =>
                  setForm((f) => ({ ...f, question: e.target.value }))
                }
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
            </label>
            <label className="block mb-3">
              <div className="text-sm text-slate-300">Answer</div>
              <textarea
                value={form.answer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, answer: e.target.value }))
                }
                rows={6}
                className="w-full p-2 rounded bg-gray-800 text-white"
              />
            </label>
            <label className="block mb-4">
              <div className="text-sm text-slate-300">Category</div>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
                className="p-2 rounded bg-gray-800 text-white"
              >
                <option value="general">General</option>
                <option value="account">Account</option>
                <option value="academic">Academic</option>
                <option value="technical">Technical</option>
                <option value="other">Other</option>
              </select>
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-2 bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-indigo-600 rounded text-white"
              >
                {saving ? "Saving..." : editing ? "Update FAQ" : "Create FAQ"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
