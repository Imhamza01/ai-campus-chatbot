import React from "react";
import { Bell, UserCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleNotifications = () => {
    if (user?.role === "admin") navigate("/admin/notifications");
    else if (user?.role === "faculty") navigate("/faculty/notifications");
    else navigate("/student/notifications");
  };

  const handleProfile = () => {
    if (user?.role === "admin") navigate("/admin/profile");
    else if (user?.role === "faculty") navigate("/faculty/profile");
    else navigate("/student/profile");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600 shadow-lg"
    >
      <h1 className="text-lg font-semibold text-indigo-400">
        Welcome, {user?.name || "Guest"} 👋
      </h1>

      <div className="flex items-center gap-4">
        {/* 🔔 Notifications */}
        <button onClick={handleNotifications} className="relative">
          <Bell size={22} className="text-gray-300 hover:text-indigo-400 transition" />
          <span className="absolute top-0 right-0 bg-red-500 rounded-full w-2.5 h-2.5"></span>
        </button>

        {/* 👤 Profile */}
        <button
          onClick={handleProfile}
          className="hover:text-indigo-400 transition"
          title="Profile"
        >
          <UserCircle2 size={28} className="text-gray-300" />
        </button>
      </div>
    </motion.header>
  );
};

export default Topbar;
