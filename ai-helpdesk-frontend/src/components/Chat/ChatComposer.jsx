// src/components/Chat/ChatComposer.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function ChatComposer({ onSend, disabled = false, placeholder = "Ask USP Chat Bot..." }) {
  const [text, setText] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    // autofocus
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const submit = async () => {
    if (!text.trim()) return;
    const t = text.trim();
    setText("");
    await onSend(t);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="mt-4 border-t border-white/6 pt-3">
      <div className="flex gap-2 items-center">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={2}
          className="flex-1 resize-none p-3 rounded-xl bg-gray-800 text-white placeholder:text-slate-400 border border-white/3 focus:outline-none"
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          onClick={submit}
          disabled={disabled}
          className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 flex items-center"
          title="Send"
        >
          <Send />
        </button>
      </div>
      <div className="mt-2 text-xs text-slate-400">Press Enter to send • Shift+Enter for newline</div>
    </div>
  );
}
