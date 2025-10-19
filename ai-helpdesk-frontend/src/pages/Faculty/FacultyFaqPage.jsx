import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import { Search, ChevronDown, ChevronUp, BookOpen } from "lucide-react";

export default function FacultyFaqPage() {
  const [faqs, setFaqs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/faq", {
        params: { q: search, category, page, limit: 10 },
      });
      setFaqs(res.data.faqs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setError("Failed to load FAQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, [page, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFaqs();
  };

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
            <BookOpen size={28} /> Faculty Knowledge Base
          </h1>
          <p className="text-slate-400 text-sm mt-2 md:mt-0">
            View common FAQs and admin-provided help guides
          </p>
        </div>

        {/* Search + Filter */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-3 md:items-center"
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute top-3 left-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 text-white pl-10 pr-3 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All Categories</option>
            <option value="general">General</option>
            <option value="technical">Technical</option>
            <option value="academic">Academic</option>
            <option value="support">Support</option>
          </select>

          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-white font-medium"
          >
            Search
          </button>
        </form>

        {/* FAQ List */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-lg p-4 space-y-3">
          {loading ? (
            <p className="text-gray-400 text-center">Loading FAQs...</p>
          ) : error ? (
            <p className="text-red-400 text-center">{error}</p>
          ) : faqs.length === 0 ? (
            <p className="text-gray-400 text-center">
              No FAQs found. Try a different search or category.
            </p>
          ) : (
            faqs.map((faq, idx) => (
              <div
                key={faq._id}
                className="bg-gray-800 rounded-lg p-3 hover:bg-gray-750 transition-all"
              >
                <button
                  onClick={() =>
                    setExpanded(expanded === idx ? null : idx)
                  }
                  className="w-full text-left flex justify-between items-center text-indigo-300 font-semibold"
                >
                  <span>{faq.question}</span>
                  {expanded === idx ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>

                {expanded === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="text-gray-300 mt-2 border-t border-gray-700 pt-2 text-sm"
                  >
                    {faq.answer}
                    {faq.category && (
                      <div className="text-xs text-gray-500 mt-1">
                        Category: {faq.category}
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-gray-300 text-sm">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
