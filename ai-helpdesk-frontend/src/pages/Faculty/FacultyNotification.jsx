import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle, Info, AlertTriangle, Loader2 } from "lucide-react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";

export default function FacultyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/notifications/me");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      await api.put(`/api/notifications/${id}/read`);
    } catch (err) {
      console.error("Mark read failed:", err);
      await loadNotifications();
    }
  };

  const handleMarkAll = async () => {
    try {
      setMarking(true);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      await api.put("/api/notifications/mark-all/read");
    } catch (err) {
      console.error("Mark all failed:", err);
      await loadNotifications();
    } finally {
      setMarking(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="text-red-400" size={22} />;
      case "warning":
        return <AlertTriangle className="text-yellow-400" size={22} />;
      default:
        return <Info className="text-blue-400" size={22} />;
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-indigo-400 flex items-center gap-2"><Bell size={26} /> Notifications</h1>
          <button onClick={handleMarkAll} disabled={marking || notifications.length === 0} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all">
            {marking ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />} Mark All Read
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg p-5 space-y-3 max-h-[550px] overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="text-gray-400 text-center py-10">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="text-gray-500 text-center italic py-10">No notifications yet.</div>
          ) : (
            notifications.map((n) => (
              <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className={`flex items-start gap-3 p-4 rounded-lg border ${n.isRead ? "bg-gray-800/60 border-gray-700" : "bg-indigo-950/30 border-indigo-700"}`}>
                <div className="mt-1">{getIcon(n.type)}</div>
                <div className="flex-1">
                  <h3 className="text-indigo-300 font-semibold text-sm">{n.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">{n.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n._id)} className="text-indigo-400 text-xs hover:text-indigo-300">Mark Read</button>
                )}
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
