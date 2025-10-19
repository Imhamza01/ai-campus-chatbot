// src/pages/student/StudentChatPage.jsx
import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import { Send, PlusCircle, MessageSquare, Trash2, Edit3 } from "lucide-react";

/**
 * StudentChatPage
 * - Sidebar: student's chat sessions
 * - Main: messages for selected session
 * - Creates sessions, sends messages, auto-scrolls, shows typing
 */

export default function StudentChatPage() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]); // messages array { role: 'user'|'ai'|'admin', text, createdAt }
  const [input, setInput] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  // ---------- Helpers ----------

  const safeGet = (v, fallback = []) => (v && Array.isArray(v) ? v : fallback);

  const scrollToBottom = () => {
    try {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    } catch (e) {
      /* ignore */
    }
  };

  // ---------- Load sessions ----------

  const loadSessions = async () => {
    setLoadingSessions(true);
    setError(null);
    try {
      const res = await api.get("/api/chat/history");
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading sessions", err);
      setError("Failed to load chat sessions.");
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  // ---------- Load messages for a session ----------
  const loadMessages = async (sessionId) => {
    if (!sessionId) {
      setMessages([]);
      return;
    }
    setError(null);
    try {
      const res = await api.get(`/api/chat/${sessionId}/messages`);
      // backend may return array of messages or session object
      const msgs = Array.isArray(res.data) ? res.data : res.data.messages || [];
      // normalize to { role, text, createdAt }
      const normalized = msgs.map((m) => {
        return {
          role: m.role || m.senderRole || (m.sender === m.user ? "user" : "ai"),
          text: m.message || m.text || m.response || "",
          createdAt: m.createdAt || m.createdAt || null,
        };
      });
      setMessages(normalized);
      // small delay then scroll
      setTimeout(scrollToBottom, 50);
    } catch (err) {
      console.error("Error loading messages", err);
      setError("Failed to load messages for session.");
      setMessages([]);
    }
  };

  // ---------- Create new session ----------
  const createSession = async () => {
    setError(null);
    try {
      const res = await api.post("/api/chat/start", { title: "New Chat" });
      const session = res.data;
      // reload sessions, then set current session
      await loadSessions();
      if (session && session._id) {
        setCurrentSession(session);
        setMessages([]); // fresh
      } else if (Array.isArray(sessions) && sessions.length > 0) {
        setCurrentSession(sessions[0]);
      }
    } catch (err) {
      console.error("Create session error", err);
      setError("Could not create a new chat session.");
    }
  };

  // ---------- Delete session ----------
  const deleteSession = async (sessionId) => {
    if (!window.confirm("Delete this chat session?")) return;
    try {
      await api.delete(`/api/chat/${sessionId}`); // ensure backend supports delete
      await loadSessions();
      // if deleted current, clear
      if (currentSession?._id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
    } catch (err) {
      console.error("Delete session error", err);
      setError("Failed to delete session.");
    }
  };

  // ---------- Send message ----------
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    // If no session, create one and wait
    let sessionId = currentSession?._id;
    if (!sessionId) {
      try {
        const res = await api.post("/api/chat/start", { title: "New Chat" });
        sessionId = res.data._id;
        // update sessions list
        await loadSessions();
        setCurrentSession(res.data);
      } catch (err) {
        console.error("Cannot create session", err);
        setError("Failed to create a session.");
        return;
      }
    }

    // Optimistic UI add user message
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setLoadingReply(true);
    setError(null);

    try {
      // Backend expects { sessionId, message } and returns { reply, sessionId }
      const res = await api.post("/api/chat/send", { sessionId, message: text });
      const reply =
        (res.data && (res.data.reply || res.data.response)) ||
        "No response from AI.";

      // append AI reply
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
      // reload sessions (so updated times show)
      await loadSessions();
      // If backend returned sessionId set it
      if (res.data?.sessionId) {
        const updatedSession = sessions.find((s) => s._id === res.data.sessionId);
        if (updatedSession) setCurrentSession(updatedSession);
      }
    } catch (err) {
      console.error("Send message error", err);
      setMessages((prev) => [...prev, { role: "ai", text: "⚠️ Error contacting AI assistant." }]);
      setError("Failed to send message.");
    } finally {
      setLoadingReply(false);
      setTimeout(scrollToBottom, 60);
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // when currentSession changes, load its messages
    if (currentSession && currentSession._id) {
      loadMessages(currentSession._id);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // keyboard Enter
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ---------- Render ----------
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

          <div className="mb-3 text-sm text-gray-300">Your Chats</div>

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

                {/* small action buttons */}
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
                        setError("Rename failed.");
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
          {/* header */}
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-300">Chat</div>
              <div className="text-lg font-semibold text-white">
                {currentSession?.title || "No chat selected"}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {currentSession ? new Date(currentSession.updatedAt || currentSession.createdAt).toLocaleString() : ""}
            </div>
          </div>

          {/* messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {error && <div className="text-sm text-red-400 mb-2">{error}</div>}

            {messages.length === 0 ? (
              <div className="text-gray-500 italic text-center py-10">
                {currentSession ? "No messages yet. Say hi!" : "Select a chat or create a new one."}
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
                      : m.role === "admin"
                      ? "bg-yellow-700 text-black"
                      : "bg-gray-700 text-gray-100 mr-auto"
                  }`}
                >
                  {m.text}
                  {m.createdAt && <div className="text-[10px] text-gray-400 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>}
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

          {/* input */}
          <div className="p-4 border-t border-gray-700 bg-gray-800 flex gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none resize-none"
            />
            <button
              onClick={sendMessage}
              disabled={loadingReply}
              className="bg-indigo-600 hover:bg-indigo-500 px-4 rounded-lg text-white flex items-center gap-2"
              title="Send"
            >
              <Send size={16} /> {loadingReply ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
