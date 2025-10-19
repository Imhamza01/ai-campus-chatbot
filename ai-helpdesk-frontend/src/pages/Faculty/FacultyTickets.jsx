import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import {
  Loader2,
  ClipboardList,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

export default function FacultyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/tickets"); // Faculty sees only assigned (backend handles role)
      setTickets(res.data || []);
    } catch (err) {
      console.error("Load tickets failed:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setBusyId(id);
    try {
      await api.put(`/api/tickets/status/${id}`, { status });
      await loadTickets();
    } catch (err) {
      console.error("Update status failed:", err);
      alert("Failed to update ticket status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleAddComment = async (id) => {
    if (!commentText.trim()) return;
    setBusyId(id);
    try {
      await api.post(`/api/tickets/${id}/comment`, { message: commentText });
      setCommentText("");
      await loadTickets();
      const refreshed = (await api.get("/api/tickets")).data || [];
      const updated = refreshed.find((x) => x._id === id);
      setSelected(updated || null);
    } catch (err) {
      console.error("Add comment failed:", err);
      alert("Failed to add comment.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-2">
            <ClipboardList /> My Tickets
          </h1>
          <button
            onClick={loadTickets}
            className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-white"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left - Ticket list */}
          <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-3 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="text-gray-400 flex items-center gap-2">
                <Loader2 className="animate-spin" /> Loading tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-gray-500 italic py-10 text-center">
                No assigned tickets yet.
              </div>
            ) : (
              tickets.map((t) => (
                <div
                  key={t._id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer border ${
                    selected?._id === t._id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-800/60 border-gray-700"
                  }`}
                  onClick={() => setSelected(t)}
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-xs text-gray-300">
                        {t.createdBy?.name || "Student"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm capitalize">{t.status}</div>
                      <div className="text-xs text-gray-400">{t.priority}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right - Ticket details */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-5 max-h-[70vh] overflow-y-auto">
            {!selected ? (
              <div className="text-gray-400 italic">
                Select a ticket to view or update.
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{selected.title}</h2>
                    <p className="text-sm text-gray-300">
                      From: {selected.createdBy?.name || "Unknown"} •{" "}
                      {selected.createdBy?.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <select
                    value={selected.status}
                    onChange={(e) =>
                      handleStatusChange(selected._id, e.target.value)
                    }
                    className="p-2 bg-gray-800 border border-gray-700 rounded text-sm"
                    disabled={busyId === selected._id}
                  >
                    <option value="open">Open</option>
                    <option value="pending">Pending</option>
                    <option value="in progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="mt-4 text-gray-300">
                  <h4 className="text-sm font-semibold mb-2">Description:</h4>
                  <p>{selected.description}</p>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">
                    Comments
                  </h4>
                  <div className="space-y-3">
                    {(selected.comments || []).length === 0 ? (
                      <p className="text-gray-500 italic">
                        No comments yet.
                      </p>
                    ) : (
                      selected.comments.map((c, i) => (
                        <div key={i} className="bg-gray-800 p-3 rounded">
                          <p className="text-xs text-gray-400">
                            {c.user?.name || "User"} •{" "}
                            {new Date(c.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm mt-1">{c.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment */}
                  <div className="mt-4 flex gap-2">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment or progress update..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded p-3 text-sm resize-none"
                      rows="3"
                    />
                    <button
                      onClick={() => handleAddComment(selected._id)}
                      disabled={busyId === selected._id}
                      className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white text-sm"
                    >
                      {busyId === selected._id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <MessageCircle size={16} />
                      )}
                      &nbsp;Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
