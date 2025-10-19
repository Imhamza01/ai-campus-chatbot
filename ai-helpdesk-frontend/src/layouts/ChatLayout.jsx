// src/layouts/ChatLayout.jsx
import React from "react";
import { motion } from "framer-motion";
import { Users, MessageSquare } from "lucide-react";
import useAuth from "../hooks/useAuth";

/**
 * ChatLayout
 * children is a render prop: children({ sessions, selectedSession, setSelectedSession, refreshSessions })
 */
export default function ChatLayout({ children, sessions = [], selectedSession, setSelectedSession, refreshSessions }) {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-200">
      {/* Left: session list */}
      <aside className="w-80 hidden md:flex flex-col gap-4 p-4 border-r border-white/6 bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="flex items-center gap-3 px-2">
          <img src="/usp-logo.png" alt="USP" className="h-10" />
          <div>
            <div className="text-sm font-semibold text-indigo-300">USP Chat Bot</div>
            <div className="text-xs text-slate-400">Conversations</div>
          </div>
        </div>

        <div className="mt-3 flex-1 overflow-y-auto space-y-2 px-1">
          {sessions.length === 0 ? (
            <div className="text-sm text-slate-400 p-2">No conversations yet — start a new chat.</div>
          ) : (
            sessions.map((s) => (
              <motion.div
                key={s._id}
                onClick={() => setSelectedSession(s)}
                whileHover={{ scale: 1.01 }}
                className={`cursor-pointer p-3 rounded-lg transition-all border ${
                  selectedSession?._id === s._id ? "bg-indigo-700 border-indigo-500" : "bg-gray-800/40 border-transparent hover:bg-gray-800/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{s.user?.name || "You"}</div>
                    <div className="text-xs text-slate-400 truncate max-w-[200px]">{s.message?.slice(0, 60) || s.response?.slice(0,60)}</div>
                  </div>
                  <div className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleString()}</div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* New chat button + quick info */}
        <div className="px-2">
          <button
            onClick={() => {
              // create local empty session object to start a new one
              const tmp = { _id: `local-${Date.now()}`, user: { name: user?.name }, messages: [], createdAt: new Date().toISOString(), isLocal: true };
              setSelectedSession(tmp);
            }}
            className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            + New Conversation
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col p-6">
        {children({ sessions, selectedSession, setSelectedSession, refreshSessions })}
      </main>

      {/* Right: FAQs + shortcuts */}
      <aside className="w-80 hidden xl:flex flex-col gap-4 p-4 border-l border-white/6 bg-gradient-to-b from-gray-900 to-gray-800">
        <div>
          <h4 className="text-sm font-semibold text-indigo-300">Top FAQs</h4>
          <p className="text-xs text-slate-400 mt-1">Quick answers from knowledge base</p>
        </div>

        <div className="space-y-2 overflow-y-auto">
          {/* Placeholder: parent will populate via state or you can fill default */}
          <div className="text-slate-400 text-sm">Loading top FAQs…</div>
        </div>

        <div className="mt-auto">
          <h5 className="text-xs text-slate-400 mb-2">Quick Actions</h5>
          <div className="space-y-2">
            <button onClick={() => window.location.href = "/student/tickets"} className="w-full py-2 rounded bg-gray-800/50 hover:bg-gray-800/70 text-white">Create Ticket</button>
            <button onClick={() => window.location.href = "/student/feedback"} className="w-full py-2 rounded bg-gray-800/50 hover:bg-gray-800/70 text-white">Submit Feedback</button>
            <button onClick={() => window.location.href = "/student/faqs"} className="w-full py-2 rounded bg-gray-800/50 hover:bg-gray-800/70 text-white">View All FAQs</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
