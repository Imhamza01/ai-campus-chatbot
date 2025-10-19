// src/layouts/DashboardLayout.jsx
import React from "react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { motion } from "framer-motion";

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Topbar />

        {/* Content Area */}
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="p-6 overflow-y-auto backdrop-blur-md bg-white/5 rounded-xl shadow-xl mt-4 mx-4"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;
