// src/pages/admin/AdminNotifications.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import { Bell, Trash2, CheckCircle2, PlusCircle, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info",
    recipientRole: "all",
  });
  const [showForm, setShowForm] = useState(false);

  // === Load notifications ===
  const loadNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error loading notifications", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000); // auto-refresh
    return () => clearInterval(interval);
  }, []);

  // === Create ===
  const handleCreate = async () => {
    if (!form.title.trim() || !form.message.trim()) return toast.error("Please fill all fields");
    try {
      await api.post("/api/notifications", form);
      setForm({ title: "", message: "", type: "info", recipientRole: "all" });
      setShowForm(false);
      toast.success("Notification sent!");
      loadNotifications();
    } catch (err) {
      console.error("Create notification failed", err);
      toast.error("Failed to send notification");
    }
  };

  // === Delete ===
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    await api.delete(`/api/notifications/${id}`);
    toast.success("Deleted!");
    loadNotifications();
  };

  // === Mark single as read ===
  const markAsRead = async (id) => {
    await api.put(`/api/notifications/${id}/read`);
    loadNotifications();
  };

  // === Mark all as read ===
  const markAllAsRead = async () => {
    await api.put("/api/notifications/mark-all/read");
    toast.success("All marked as read");
    loadNotifications();
  };

  const isRead = (notif) => notif.readBy && notif.readBy.length > 0;

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-2">
            <Bell /> Notifications Center
          </h1>
          <div className="flex gap-2">
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 px-4 py-2 rounded text-white"
            >
              <CheckSquare size={18} /> Mark All Read
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded text-white"
            >
              <PlusCircle size={18} /> New Notification
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-900 p-4 rounded-xl border border-gray-700"
          >
            <input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full mb-2 p-2 rounded bg-gray-800 text-white"
            />
            <textarea
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={3}
              className="w-full mb-2 p-2 rounded bg-gray-800 text-white"
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="p-2 bg-gray-800 text-white rounded"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
              </select>
              <select
                value={form.recipientRole}
                onChange={(e) => setForm({ ...form, recipientRole: e.target.value })}
                className="p-2 bg-gray-800 text-white rounded"
              >
                <option value="all">All</option>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleCreate}
                className="bg-green-600 px-4 rounded text-white hover:bg-green-500"
              >
                Send
              </button>
            </div>
          </motion.div>
        )}

        {/* List */}
        <div className="grid gap-3">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="text-gray-500 italic">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <motion.div
                key={n._id}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-xl border transition-all ${
                  isRead(n)
                    ? "border-gray-700 bg-gray-900/60"
                    : "border-indigo-600 bg-gray-800/80"
                } flex justify-between items-start`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-indigo-300 font-semibold">{n.title}</h3>
                    {!isRead(n) && (
                      <span className="text-xs bg-indigo-500 px-2 py-0.5 rounded">New</span>
                    )}
                  </div>
                  <p className="text-gray-300 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    For: {n.recipientRole} |{" "}
                    {new Date(n.createdAt).toLocaleString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "short",
                    })}
                  </p>
                </div>

                <div className="flex gap-2">
                  {!isRead(n) && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-green-400 hover:text-green-500"
                    >
                      <CheckCircle2 />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(n._id)}
                    className="text-red-400 hover:text-red-500"
                  >
                    <Trash2 />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
