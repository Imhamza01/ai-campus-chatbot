import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { motion } from "framer-motion";
import { Search, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import api from "../../services/api";

export default function StudentFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);

  // 📚 Load FAQs from backend
  const loadFAQs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/faq`, {
        params: { q: search, category, page, limit: 6 },
      });
      setFaqs(res.data.faqs);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.error("Error loading FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFAQs();
  }, [search, category, page]);

  const toggleExpand = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  const categories = ["all", "general", "admissions", "academics", "finance", "technical"];

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* 🏷️ Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-2">
            <HelpCircle size={28} /> Frequently Asked Questions
          </h1>
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="w-full p-2 pl-9 rounded-lg bg-gray-800 text-gray-100 border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <Search className="absolute top-2.5 left-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* 📂 Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setPage(1);
                setCategory(cat);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>

        {/* 📘 FAQs List */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg divide-y divide-gray-800">
          {loading ? (
            <div className="p-6 text-gray-400 text-center">Loading FAQs...</div>
          ) : faqs.length === 0 ? (
            <div className="p-6 text-gray-500 text-center">No FAQs found.</div>
          ) : (
            faqs.map((faq) => (
              <motion.div
                key={faq._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="p-5 hover:bg-gray-800/70 cursor-pointer"
                onClick={() => toggleExpand(faq._id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-indigo-300">{faq.question}</h3>
                  {expanded === faq._id ? (
                    <ChevronUp className="text-indigo-400" />
                  ) : (
                    <ChevronDown className="text-gray-400" />
                  )}
                </div>
                {expanded === faq._id && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 text-gray-300 leading-relaxed"
                  >
                    {faq.answer}
                  </motion.p>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* 📄 Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-1.5 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
