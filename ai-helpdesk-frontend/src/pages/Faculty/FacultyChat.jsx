import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import { Send, PlusCircle, MessageSquare, Trash2, Edit3, Briefcase } from "lucide-react";

/**
 * FacultyChatPage.jsx
 * - Allows faculty to manage chat sessions
 * - Connects with /api/chat backend (same as student)
 * - Faculty-oriented FAQs and responses
 */

export default function FacultyChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load sessions
  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await api.get("/api/chat/history");
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading sessions", err);
      setError("Failed to load chat sessions.");
    } finally {
      setLoadingSessions(false);
    }
  };

  // Load messages for session
  const loadMessages = async (sessionId) => {
    if (!sessionId) return setMessages([]);
    try {
      const res = await api.get(`/api/chat/${sessionId}/messages`);
      const msgs = Array.isArray(res.data)
        ? res.data
        : res.data.messages || [];
      const normalized = msgs.map((m) => ({
        role: m.role || m.senderRole || (m.sender === m.user ? "user" : "ai"),
        text: m.message || m.text || m.response || "",
        createdAt: m.createdAt || null,
      }));
      setMessages(normalized);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Error loading messages", err);
      setError("Failed to load messages.");
    }
  };

  // Create new chat session
  const createSession = async () => {
    try {
      const res = await api.post("/api/chat/start", { title: "New Faculty Chat" });
      await loadSessions();
      setCurrentSession(res.data);
      setMessages([]);
    } catch (err) {
      console.error("Create session error", err);
      setError("Could not create chat session.");
    }
  };

  // Delete a chat session
  const deleteSession = async (id) => {
    if (!window.confirm("Delete this chat session?")) return;
    try {
      await api.delete(`/api/chat/${id}`);
      await loadSessions();
      if (currentSession?._id === id) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Delete session error", err);
      setError("Failed to delete session.");
    }
  };

  // Send a message
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    let sessionId = currentSession?._id;
    if (!sessionId) {
      const res = await api.post("/api/chat/start", { title: "Faculty Chat" });
      sessionId = res.data._id;
      setCurrentSession(res.data);
      await loadSessions();
    }

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoadingReply(true);

    try {
      const res = await api.post("/api/chat/send", { sessionId, message: text });
      const reply = res.data.reply || res.data.response || "No response from AI.";
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      await loadSessions();
    } catch (err) {
      console.error("Send message error", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "⚠️ Error contacting AI assistant." },
      ]);
    } finally {
      setLoadingReply(false);
      setTimeout(scrollToBottom, 80);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (currentSession?._id) loadMessages(currentSession._id);
  }, [currentSession]);

  // Keyboard shortcut
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[75vh] bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden">
        {/* Sidebar (Sessions) */}
        <div className="w-72 bg-gray-800/90 p-4 border-r border-gray-700 overflow-y-auto">
          <div className="flex gap-2 mb-4">
            <button
              onClick={createSession}
              className="flex items-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 px-3 py-2 rounded-lg text-white"
            >
              <PlusCircle size={16} /> New Chat
            </button>
          </div>

          <div className="mb-3 text-sm text-gray-300">Faculty Chats</div>

          {loadingSessions ? (
            <div className="text-gray-400">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-gray-500">No chats yet. Start one.</div>
          ) : (
            sessions.map((s) => (
              <div key={s._id} className="flex items-start gap-2 mb-2">
                <button
                  onClick={() => setCurrentSession(s)}
                  className={`flex-1 text-left px-3 py-2 rounded-lg ${
                    currentSession?._id === s._id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} />
                      <span className="truncate">{s.title || "Chat"}</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      {new Date(s.updatedAt || s.createdAt).toLocaleString()}
                    </div>
                  </div>
                </button>

                {/* Rename + Delete */}
                <div className="flex flex-col gap-1 ml-2">
                  <button
                    title="Rename"
                    onClick={async () => {
                      const newTitle = prompt("Rename chat", s.title || "Chat");
                      if (!newTitle) return;
                      try {
                        await api.put(`/api/chat/${s._id}`, { title: newTitle });
                        await loadSessions();
                      } catch (err) {
                        console.error("Rename failed", err);
                      }
                    }}
                    className="p-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => deleteSession(s._id)}
                    className="p-1 rounded bg-red-700 hover:bg-red-600 text-white"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-300">Chat</div>
              <div className="text-lg font-semibold text-white flex items-center gap-2">
                <Briefcase size={18} className="text-indigo-400" />
                {currentSession?.title || "No chat selected"}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="text-gray-500 italic text-center py-10">
                {currentSession
                  ? "No messages yet. Start the conversation!"
                  : "Select a chat or start a new one."}
              </div>
            ) : (
              messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-[80%] p-3 rounded-xl ${
                    m.role === "user"
                      ? "bg-indigo-600 text-white ml-auto"
                      : "bg-gray-700 text-gray-100 mr-auto"
                  }`}
                >
                  {m.text}
                  {m.createdAt && (
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </div>
                  )}
                </motion.div>
              ))
            )}

            {loadingReply && (
              <div className="bg-gray-700 text-gray-200 p-2 rounded-xl w-fit mr-auto">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-gray-700 bg-gray-800 flex gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about academic policies, schedules, or university processes..."
              className="flex-1 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={loadingReply}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 rounded-lg text-white flex items-center gap-2"
            >
              <Send size={16} /> {loadingReply ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
