// src/layouts/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LogOut,
  MessageSquare,
  HelpCircle,
  FileText,
  Bell,
  ThumbsUp,
  Users,
  UserCog,
  GraduationCap,
} from "lucide-react";
import useAuth from "../hooks/useAuth";

const Sidebar = () => {
  const { logout, user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isStudent = user?.role === "student";
  const isFaculty = user?.role === "faculty";

  const adminMenu = [
    { name: "Dashboard", path: "/admin", icon: Users },
    { name: "Chat", path: "/admin/chat", icon: MessageSquare },
    { name: "Users", path: "/admin/users", icon: UserCog },
    { name: "FAQs", path: "/admin/faqs", icon: HelpCircle },
    { name: "Tickets", path: "/admin/tickets", icon: FileText },
    { name: "Feedback", path: "/admin/feedback", icon: ThumbsUp },
    
  ];

  const studentMenu = [
    { name: "Dashboard", path: "/student", icon: GraduationCap },
    { name: "Chat", path: "/student/chat", icon: MessageSquare },
    { name: "FAQs", path: "/student/faqs", icon: HelpCircle },
    { name: "My Tickets", path: "/student/tickets", icon: FileText },
    { name: "Feedback", path: "/student/feedback", icon: ThumbsUp },
   
  ];

  const facultyMenu = [
  { name: "Dashboard", path: "/faculty", icon: GraduationCap },
  { name: "My Tickets", path: "/faculty/tickets", icon: FileText },
  { name: "Chatbot", path: "/faculty/chat", icon: MessageSquare },
  { name: "FAQs", path: "/faculty/faqs", icon: HelpCircle },
  { name: "Feedback", path: "/faculty/feedback", icon: ThumbsUp },
  
];

  const menuItems = isAdmin
    ? adminMenu
    : isStudent
    ? studentMenu
    : facultyMenu;

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 p-5 flex flex-col shadow-2xl"
    >
      {/* Logo */}
      <div className="flex items-center justify-center mb-8">
        <img src="/usp-logo.png" alt="USP Logo" className="h-14 drop-shadow-lg" />
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-3">
        {menuItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "hover:bg-gray-700 hover:text-indigo-400"
              }`
            }
          >
            <Icon size={20} />
            {name}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 mt-6 text-red-400 hover:text-red-600 transition"
      >
        <LogOut size={18} /> Logout
      </button>
    </motion.aside>
  );
};

export default Sidebar;
