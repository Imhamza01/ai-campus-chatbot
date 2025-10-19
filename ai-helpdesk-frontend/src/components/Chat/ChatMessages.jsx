// src/components/Chat/ChatMessages.jsx
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * ChatMessages
 * props:
 *  messages: array [{ senderRole: 'student'|'ai'|'admin', message, createdAt }]
 */
export default function ChatMessages({ messages = [], isTyping = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // scroll to bottom on messages change
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight + 200;
    }
  }, [messages, isTyping]);

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((m, i) => {
        const isUser = m.senderRole === "student" || m.senderRole === "user";
        const isAdmin = m.senderRole === "admin";
        const align = isUser ? "self-end" : "self-start";
        const bg = isUser ? "bg-indigo-600 text-white" : isAdmin ? "bg-gray-700 text-white" : "bg-gray-800 text-slate-200";

        return (
          <motion.div
            key={`${m._id || i}-${m.createdAt}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.02 }}
            className={`max-w-[85%] ${align}`}
          >
            <div className={`px-4 py-2 rounded-2xl ${bg} shadow-sm`}>
              <div className="whitespace-pre-wrap">{m.message || m.response || ""}</div>
              <div className="text-xs text-white/70 mt-1 text-right">{new Date(m.createdAt).toLocaleTimeString()}</div>
            </div>
          </motion.div>
        );
      })}

      {isTyping && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-start">
          <div className="px-3 py-2 rounded-2xl bg-gray-700 text-slate-200 inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce inline-block" />
            <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce animation-delay-200 inline-block" />
            <span className="h-2 w-2 rounded-full bg-slate-300 animate-bounce animation-delay-400 inline-block" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
