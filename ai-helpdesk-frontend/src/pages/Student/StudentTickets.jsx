import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import { Ticket, Send, PlusCircle, MessageCircle } from "lucide-react";

export default function StudentTickets() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", category: "general", priority: "medium" });
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [comment, setComment] = useState("");

  const categories = ["general", "technical", "billing", "other"];
  const priorities = ["low", "medium", "high"];

  // Load all my tickets
  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/tickets");
      setTickets(res.data);
    } catch (err) {
      console.error("Ticket load error:", err);
      setMsg({ type: "error", text: "Failed to load tickets" });
    } finally {
      setLoading(false);
    }
  };

  // Create new ticket
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setMsg({ type: "error", text: "Please fill all fields" });
      return;
    }

    try {
      setCreating(true);
      const res = await api.post("/api/tickets", form);
      setTickets([res.data, ...tickets]);
      setForm({ title: "", description: "", category: "general", priority: "medium" });
      setMsg({ type: "success", text: "Ticket created successfully!" });
    } catch (err) {
      console.error("Ticket create error:", err);
      setMsg({ type: "error", text: err.response?.data?.message || "Failed to create ticket" });
    } finally {
      setCreating(false);
    }
  };

  // Add comment
  const handleComment = async (ticketId) => {
    if (!comment.trim()) return;
    try {
      const res = await api.post(`/api/tickets/${ticketId}/comment`, { message: comment });
      setTickets(
        tickets.map((t) =>
          t._id === ticketId ? { ...t, comments: res.data } : t
        )
      );
      setComment("");
      setMsg({ type: "success", text: "Comment added successfully!" });
    } catch (err) {
      console.error("Add comment error:", err);
      setMsg({ type: "error", text: "Failed to add comment" });
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-2">
            <Ticket /> My Tickets
          </h1>
          <button
            onClick={loadTickets}
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

        {/* === Create Ticket === */}
        <form
          onSubmit={handleCreate}
          className="bg-gray-900 border border-gray-700 rounded-2xl p-5 mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <PlusCircle size={18} className="text-indigo-400" />
            <h2 className="text-xl font-semibold text-indigo-300">
              Create New Ticket
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Ticket Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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

          <div className="grid md:grid-cols-2 gap-4 mt-3">
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="p-3 bg-gray-800 rounded text-white border border-gray-700"
            >
              {priorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>

          <textarea
            rows="4"
            placeholder="Describe your issue..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mt-4 p-3 bg-gray-800 rounded text-white border border-gray-700"
          ></textarea>

          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={creating}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-white flex items-center gap-2"
            >
              <Send size={16} /> {creating ? "Creating..." : "Create Ticket"}
            </button>
          </div>
        </form>

        {/* === My Tickets === */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-5">
          <h2 className="text-xl font-semibold text-indigo-300 mb-4">
            My Tickets
          </h2>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500 italic">No tickets found.</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id}
                  className="border border-gray-700 p-4 rounded-lg bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-indigo-300">
                      {ticket.title}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        ticket.status === "closed"
                          ? "bg-green-700"
                          : ticket.status === "in progress"
                          ? "bg-yellow-700"
                          : "bg-gray-700"
                      }`}
                    >
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-400 mt-1">
                    Category: {ticket.category} | Priority:{" "}
                    <span
                      className={`font-medium ${
                        ticket.priority === "high"
                          ? "text-red-400"
                          : ticket.priority === "medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </div>

                  <p className="text-gray-300 mt-2">{ticket.description}</p>

                  {/* Comments */}
                  {activeTicket === ticket._id ? (
                    <div className="mt-4 border-t border-gray-700 pt-3">
                      <h4 className="text-sm text-indigo-300 mb-2 flex items-center gap-2">
                        <MessageCircle size={14} /> Comments
                      </h4>

                      <div className="max-h-40 overflow-y-auto space-y-2 mb-3">
                        {ticket.comments?.length ? (
                          ticket.comments.map((c, i) => (
                            <div
                              key={i}
                              className="text-sm bg-gray-700 p-2 rounded"
                            >
                              <strong>{c.user?.name || "User"}:</strong>{" "}
                              {c.message}
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(c.createdAt).toLocaleString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm italic">
                            No comments yet.
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Type a comment..."
                          className="flex-1 p-2 bg-gray-800 border border-gray-700 rounded text-white"
                        />
                        <button
                          onClick={() => handleComment(ticket._id)}
                          className="bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-white"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        setActiveTicket(
                          activeTicket === ticket._id ? null : ticket._id
                        )
                      }
                      className="text-sm text-indigo-400 hover:text-indigo-300 mt-3"
                    >
                      {activeTicket === ticket._id
                        ? "Hide Comments"
                        : "View / Add Comments"}
                    </button>
                  )}

                  <div className="text-xs text-slate-500 mt-2">
                    Created: {new Date(ticket.createdAt).toLocaleString()}
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
