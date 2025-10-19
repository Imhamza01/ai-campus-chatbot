// src/pages/admin/AdminTickets.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import {
  Loader2,
  Search,
  UserCheck,
  ClipboardList,
  MessageCircle,
  Trash2,
} from "lucide-react";

export default function AdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]); // for assign dropdown (faculty list)
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filters, setFilters] = useState({
    q: "",
    status: "all",
    priority: "all",
    assignedTo: "all",
  });
  const [selected, setSelected] = useState(null); // selected ticket for details
  const [commentText, setCommentText] = useState("");

  // initial load
  useEffect(() => {
    loadAll();
    loadUsers();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/tickets");
      setTickets(res.data || []);
    } catch (err) {
      console.error("Load tickets error:", err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // fetch faculty list for assign dropdown
      // endpoint: admin users - adjust path if different in your codebase
      const res = await api.get("/api/admin/users");
      // pick only faculty
      const fac = (res.data || []).filter((u) => u.role === "faculty");
      setUsers(fac);
    } catch (err) {
      console.warn("Failed to load users:", err);
      setUsers([]);
    }
  };

  // Filtering
  const filtered = tickets.filter((t) => {
    const q = filters.q.trim().toLowerCase();
    if (q) {
      const inTitle = (t.title || "").toLowerCase().includes(q);
      const inDesc = (t.description || "").toLowerCase().includes(q);
      const inCreator = (t.createdBy?.name || "").toLowerCase().includes(q);
      if (!(inTitle || inDesc || inCreator)) return false;
    }
    if (filters.status !== "all" && t.status !== filters.status) return false;
    if (filters.priority !== "all" && t.priority !== filters.priority) return false;
    if (filters.assignedTo !== "all") {
      if (!t.assignedTo) return false;
      if (t.assignedTo._id !== filters.assignedTo) return false;
    }
    return true;
  });

  // Assign ticket
  const handleAssign = async (ticketId, userId) => {
    setBusyId(ticketId);
    try {
      await api.put(`/api/tickets/assign/${ticketId}`, { assignedTo: userId });
      await loadAll();
    } catch (err) {
      console.error("Assign failed:", err);
      alert("Failed to assign ticket.");
    } finally {
      setBusyId(null);
    }
  };

  // Update status
  const handleStatus = async (ticketId, status) => {
    setBusyId(ticketId);
    try {
      await api.put(`/api/tickets/status/${ticketId}`, { status });
      await loadAll();
    } catch (err) {
      console.error("Update status failed:", err);
      alert("Failed to update status.");
    } finally {
      setBusyId(null);
    }
  };

  // Update priority
  const handlePriority = async (ticketId, priority) => {
    setBusyId(ticketId);
    try {
      await api.put(`/api/tickets/${ticketId}/priority`, { priority });
      await loadAll();
    } catch (err) {
      console.error("Update priority failed:", err);
      alert("Failed to update priority.");
    } finally {
      setBusyId(null);
    }
  };

  // Add comment
  const handleComment = async (ticketId) => {
    if (!commentText.trim()) return;
    setBusyId(ticketId);
    try {
      await api.post(`/api/tickets/${ticketId}/comment`, { message: commentText });
      setCommentText("");
      // refresh selected ticket details (reload all for simplicity)
      await loadAll();
      // keep the details open
      const refreshed = (await api.get("/api/tickets")).data || [];
      const updated = refreshed.find((x) => x._id === ticketId);
      setSelected(updated || null);
    } catch (err) {
      console.error("Comment failed:", err);
      alert("Failed to add comment.");
    } finally {
      setBusyId(null);
    }
  };

  // Delete ticket (optional admin helper) - you might not have route; comment if not present
  const handleDelete = async (ticketId) => {
    if (!window.confirm("Delete this ticket? This cannot be undone.")) return;
    setBusyId(ticketId);
    try {
      await api.delete(`/api/tickets/${ticketId}`); // ensure backend supports it
      await loadAll();
      if (selected && selected._id === ticketId) setSelected(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete ticket.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-2">
            <ClipboardList /> Ticket Management
          </h1>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={filters.q}
                onChange={(e) => setFilters((s) => ({ ...s, q: e.target.value }))}
                placeholder="Search by title / description / student"
                className="pl-10 pr-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-sm w-80"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <button
              onClick={loadAll}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-white"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <select
            value={filters.status}
            onChange={(e) => setFilters((s) => ({ ...s, status: e.target.value }))}
            className="p-2 bg-gray-800 border border-gray-700 rounded"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters((s) => ({ ...s, priority: e.target.value }))}
            className="p-2 bg-gray-800 border border-gray-700 rounded"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={filters.assignedTo}
            onChange={(e) => setFilters((s) => ({ ...s, assignedTo: e.target.value }))}
            className="p-2 bg-gray-800 border border-gray-700 rounded"
          >
            <option value="all">All Assignees</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name} ({u.email})
              </option>
            ))}
          </select>
        </div>

        {/* Main area: left list, right detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Ticket list */}
          <div className="lg:col-span-1 bg-gray-900 border border-gray-800 rounded-2xl p-3 max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="text-gray-400 flex items-center gap-2">
                <Loader2 className="animate-spin" /> Loading tickets...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-gray-500 italic py-10 text-center">No tickets found.</div>
            ) : (
              filtered.map((t) => (
                <div
                  key={t._id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer border ${
                    selected?._id === t._id ? "bg-indigo-600 text-white" : "bg-gray-800/60 border-gray-700"
                  }`}
                  onClick={() => setSelected(t)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-xs text-gray-300">
                        {t.createdBy?.name || "Unknown"} • {new Date(t.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm capitalize">{t.status}</div>
                      <div className="text-xs text-gray-300">{t.priority}</div>
                    </div>
                  </div>

                  <div className="mt-2 text-sm text-gray-300 line-clamp-2">{t.description}</div>
                </div>
              ))
            )}
          </div>

          {/* Details & actions */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-4 max-h-[70vh] overflow-y-auto">
            {!selected ? (
              <div className="text-gray-400 italic">Select a ticket to view details and perform actions.</div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selected.title}</h2>
                    <p className="text-sm text-gray-300">
                      Created by: {selected.createdBy?.name || "Unknown"} • {selected.createdBy?.email}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(selected.createdAt).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <select
                        value={selected.status}
                        onChange={(e) => handleStatus(selected._id, e.target.value)}
                        className="p-2 bg-gray-800 border border-gray-700 rounded"
                        disabled={busyId === selected._id}
                      >
                        <option value="open">Open</option>
                        <option value="pending">Pending</option>
                        <option value="in progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>

                      <select
                        value={selected.priority}
                        onChange={(e) => handlePriority(selected._id, e.target.value)}
                        className="p-2 bg-gray-800 border border-gray-700 rounded"
                        disabled={busyId === selected._id}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <select
                        value={selected.assignedTo?._id || ""}
                        onChange={(e) => handleAssign(selected._id, e.target.value)}
                        className="p-2 bg-gray-800 border border-gray-700 rounded"
                        disabled={busyId === selected._id}
                      >
                        <option value="">Assign to...</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => {
                          // quick open comment box focus
                          const el = document.getElementById("admin-comment-input");
                          el?.focus();
                        }}
                        className="bg-indigo-600 px-3 py-2 rounded text-white"
                      >
                        <MessageCircle size={16} /> Comment
                      </button>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4 text-gray-200">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Description</h4>
                  <p className="text-sm">{selected.description}</p>
                </div>

                {/* Comments */}
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Comments</h4>
                  <div className="space-y-3">
                    {(selected.comments || []).length === 0 ? (
                      <div className="text-gray-500 italic">No comments yet.</div>
                    ) : (
                      (selected.comments || []).map((c) => (
                        <div key={c._id || Math.random()} className="p-3 bg-gray-800 rounded">
                          <div className="text-xs text-gray-300">
                            {c.user?.name || "User"} • {new Date(c.createdAt).toLocaleString()}
                          </div>
                          <div className="mt-1 text-sm text-gray-200">{c.message}</div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add comment */}
                  <div className="mt-4 flex gap-2 items-start">
                    <textarea
                      id="admin-comment-input"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write an internal note or reply to the student..."
                      className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded resize-none min-h-[80px]"
                    />
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleComment(selected._id)}
                        className="bg-green-600 px-4 py-2 rounded text-white"
                        disabled={busyId === selected._id}
                      >
                        {busyId === selected._id ? "Saving..." : "Add Comment"}
                      </button>
                      <button
                        onClick={() => handleDelete(selected._id)}
                        className="bg-red-600 px-3 py-2 rounded text-white"
                        title="Delete ticket (admin only)"
                      >
                        <Trash2  size={16}  />
                        Delete
                      </button>
                    </div>
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
