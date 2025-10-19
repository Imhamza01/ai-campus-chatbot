// src/pages/Admin/AdminChat.jsx
import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import {
  Send,
  CheckCircle,
  Clock,
  MessageSquare,
  RefreshCw,
  Search,
} from "lucide-react";

export default function AdminChat() {
  const [chats, setChats] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadChats();
    const interval = setInterval(loadChats, 15000); // auto refresh every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    handleSearch(search);
  }, [search, chats]);

  const loadChats = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/chat/sessions");
      setChats(res.data || []);
      setFiltered(res.data || []);
    } catch (err) {
      console.error("Error loading chats", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    if (!text.trim()) return setFiltered(chats);
    const q = text.toLowerCase();
    const f = chats.filter(
      (c) =>
        c.user?.name?.toLowerCase().includes(q) ||
        c.messages.some((m) => m.message.toLowerCase().includes(q))
    );
    setFiltered(f);
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedChat) return;
    try {
      await api.post("/api/chat/reply", {
        sessionId: selectedChat._id,
        message: reply,
      });
      setReply("");
      await loadChats();
      const updated = await api.get("/api/chat/sessions");
      setChats(updated.data);
      const refreshedChat = updated.data.find(
        (c) => c._id === selectedChat._id
      );
      setSelectedChat(refreshedChat || null);
    } catch (err) {
      console.error("Reply error", err);
    }
  };

  const handleMarkResolved = async (sessionId, resolved) => {
    try {
      await api.put(`/api/chat/${sessionId}/status`, { resolved });
      await loadChats();
      if (selectedChat?._id === sessionId) {
        setSelectedChat((prev) => ({ ...prev, resolved }));
      }
    } catch (err) {
      console.error("Mark resolved failed", err);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat]);

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex gap-4 h-[82vh]"
      >
        {/* Sidebar - Chat Sessions */}
        <div className="w-1/3 bg-gray-900/80 p-4 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-indigo-400 flex items-center gap-2">
              <MessageSquare size={20} /> Chat Sessions
            </h2>
            <button
              onClick={loadChats}
              className="text-slate-300 hover:text-white"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or message..."
              className="w-full pl-8 pr-3 py-2 bg-gray-800 text-white rounded-lg text-sm"
            />
          </div>

          {/* Chat List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="text-center text-gray-400 mt-10">
                Loading chats...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                No chat sessions found.
              </div>
            ) : (
              filtered.map((chat) => (
                <motion.div
                  key={chat._id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-3 mb-2 rounded cursor-pointer border ${
                    selectedChat?._id === chat._id
                      ? "bg-indigo-700/80 border-indigo-400"
                      : "bg-gray-800/60 border-gray-700"
                  }`}
                >
                  <div className="font-medium text-slate-200">
                    {chat.user?.name || "Unknown User"}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {chat.messages.length} messages
                  </div>
                  {chat.resolved ? (
                    <div className="text-green-400 text-xs flex items-center gap-1 mt-1">
                      <CheckCircle size={12} /> Resolved
                    </div>
                  ) : (
                    <div className="text-yellow-400 text-xs flex items-center gap-1 mt-1">
                      <Clock size={12} /> Pending
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-gray-900/60 rounded-xl p-4">
          {selectedChat ? (
            <>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-indigo-300">
                  {selectedChat.user?.name || "User"}
                </h3>
                <button
                  onClick={() =>
                    handleMarkResolved(selectedChat._id, !selectedChat.resolved)
                  }
                  className={`px-3 py-1 text-sm rounded flex items-center gap-1 ${
                    selectedChat.resolved
                      ? "bg-green-700 hover:bg-green-600"
                      : "bg-yellow-700 hover:bg-yellow-600"
                  }`}
                >
                  {selectedChat.resolved ? (
                    <>
                      <CheckCircle size={14} /> Mark Unresolved
                    </>
                  ) : (
                    <>
                      <Clock size={14} /> Mark Resolved
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 p-2">
                {selectedChat.messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-3 rounded-xl max-w-[80%] ${
                      m.role === "user"
                        ? "bg-blue-700/60 self-start text-left"
                        : m.role === "admin"
                        ? "bg-indigo-700/70 self-end text-right"
                        : "bg-gray-700/70 self-start italic"
                    }`}
                  >
                    <div className="text-sm text-slate-200">{m.message}</div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-1 p-2 rounded bg-gray-800 text-white"
                />
                <button
                  onClick={handleReply}
                  className="px-4 py-2 bg-indigo-600 rounded flex items-center gap-2 hover:bg-indigo-500"
                >
                  <Send size={16} /> Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a chat to view conversation
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
