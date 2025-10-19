import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import {
  Users,
  MessageSquare,
  Bell,
  HelpCircle,
  Activity,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    chats: 0,
    faqs: 0,
    tickets: 0,
    feedbacks: 0,
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);

  // Example analytics data (replace with real later)
  const analyticsData = [
    { name: "Mon", Chats: 120, Tickets: 8, Feedback: 15 },
    { name: "Tue", Chats: 150, Tickets: 10, Feedback: 18 },
    { name: "Wed", Chats: 180, Tickets: 6, Feedback: 25 },
    { name: "Thu", Chats: 210, Tickets: 12, Feedback: 20 },
    { name: "Fri", Chats: 160, Tickets: 9, Feedback: 22 },
    { name: "Sat", Chats: 90, Tickets: 4, Feedback: 10 },
    { name: "Sun", Chats: 50, Tickets: 2, Feedback: 5 },
  ];

useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await api.get("/api/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard stats fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchStats();
}, []);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-indigo-400 tracking-wide">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-2 md:mt-0">
            University of Southern Punjab | AI Helpdesk Management System
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[
            {
              label: "Total Users",
              icon: Users,
              value: stats.users,
              color: "from-blue-500 to-indigo-500",
            },
            {
              label: "Chat Sessions",
              icon: MessageSquare,
              value: stats.chats,
              color: "from-emerald-500 to-teal-500",
            },
            {
              label: "Knowledge Base (FAQs)",
              icon: HelpCircle,
              value: stats.faqs,
              color: "from-purple-500 to-pink-500",
            },
            {
              label: "Tickets",
              icon: AlertCircle,
              value: stats.tickets,
              color: "from-red-500 to-orange-500",
            },
            {
              label: "Feedback",
              icon: Activity,
              value: stats.feedbacks,
              color: "from-yellow-500 to-amber-500",
            },
            {
              label: "Notifications",
              icon: Bell,
              value: stats.notifications,
              color: "from-cyan-500 to-blue-500",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg hover:shadow-2xl text-white relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold mb-1">{card.label}</h2>
                  <p className="text-3xl font-bold">
                    {loading ? "..." : card.value}
                  </p>
                </div>
                <card.icon className="w-10 h-10 opacity-80" />
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20"></div>
            </motion.div>
          ))}
        </div>

        {/* Analytics Chart Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 border border-white/10 p-6 rounded-xl shadow-lg backdrop-blur-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="text-indigo-400" />
            <h2 className="text-xl font-semibold text-indigo-300">
              Weekly AI Chat & Ticket Analytics
            </h2>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1e1e",
                    border: "1px solid #333",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Chats"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Tickets"
                  stroke="#f87171"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Feedback"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* System Overview */}
        <div className="mt-8 bg-white/10 border border-white/10 p-6 rounded-xl shadow-lg backdrop-blur-lg">
          <h2 className="text-xl font-semibold mb-3 text-indigo-300">
            System Overview
          </h2>
          <p className="text-slate-300 leading-relaxed">
            The <b>Admin Dashboard</b> provides centralized control of all AI
            Helpdesk modules — including user management, chatbot monitoring,
            FAQ updates, feedback reviews, and ticket handling. Each widget and
            chart provides a snapshot of live backend activity to help admins
            maintain smooth academic support operations.
          </p>
          <ul className="list-disc list-inside text-slate-400 mt-3 space-y-1">
            <li>🔹 Manage users, faculty, and students</li>
            <li>🔹 Review chat sessions & AI assistant accuracy</li>
            <li>🔹 Add or update FAQ entries to improve responses</li>
            <li>🔹 Track student feedback & open tickets</li>
            <li>🔹 Send notifications or announcements system-wide</li>
          </ul>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
