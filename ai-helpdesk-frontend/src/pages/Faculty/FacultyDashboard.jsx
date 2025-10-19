import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import { Ticket, Loader2, CheckCircle, Clock, AlertTriangle, Inbox } from "lucide-react";

export default function FacultyDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch tickets assigned to logged-in faculty
useEffect(() => {
  const fetchTickets = async () => {
    try {
      const res = await api.get("/api/tickets");
      setTickets(res.data || []);
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchTickets();

  const interval = setInterval(fetchTickets, 20000); // every 20s
  return () => clearInterval(interval);
}, []);
  // 🧮 Ticket stats
  const total = tickets.length;
  const open = tickets.filter((t) => t.status === "open").length;
  const inProgress = tickets.filter((t) => t.status === "in progress").length;
  const closed = tickets.filter((t) => t.status === "closed").length;

  const recentTickets = tickets.slice(0, 5);

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
            <Ticket size={26} /> Faculty Dashboard
          </h1>
        </div>

        {/* Cards Section */}
        {loading ? (
          <div className="flex justify-center items-center py-10 text-gray-400">
            <Loader2 className="animate-spin" size={28} />
            <span className="ml-2">Loading your tickets...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard
              icon={<Inbox className="text-indigo-400" size={28} />}
              title="Total Assigned"
              value={total}
              color="from-indigo-600 to-indigo-400"
            />
            <StatCard
              icon={<Clock className="text-yellow-400" size={28} />}
              title="Open"
              value={open}
              color="from-yellow-600 to-yellow-400"
            />
            <StatCard
              icon={<AlertTriangle className="text-orange-400" size={28} />}
              title="In Progress"
              value={inProgress}
              color="from-orange-600 to-orange-400"
            />
            <StatCard
              icon={<CheckCircle className="text-green-400" size={28} />}
              title="Closed"
              value={closed}
              color="from-green-600 to-green-400"
            />
          </div>
        )}

        {/* Recent Tickets */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-lg p-5">
          <h2 className="text-lg font-semibold text-indigo-300 mb-3">
            Recent Tickets
          </h2>

          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : recentTickets.length === 0 ? (
            <p className="text-gray-500 italic">No tickets assigned yet.</p>
          ) : (
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                  <th className="py-2">Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((t) => (
                  <tr
                    key={t._id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                  >
                    <td className="py-2">{t.title}</td>
                    <td className="capitalize">{t.status}</td>
                    <td className="capitalize text-gray-400">{t.priority}</td>
                    <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}

// ✅ Small reusable card
const StatCard = ({ icon, title, value, color }) => (
  <div
    className={`p-4 rounded-xl bg-gradient-to-br ${color} bg-opacity-20 flex items-center gap-3 shadow-md`}
  >
    {icon}
    <div>
      <h3 className="text-gray-200 text-sm">{title}</h3>
      <p className="text-white text-xl font-bold">{value}</p>
    </div>
  </div>
);
