import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function UserFormModal({ open, onClose, onSave, initialData }) {
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [role, setRole] = useState(initialData?.role || "student");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    setName(initialData?.name || "");
    setEmail(initialData?.email || "");
    setRole(initialData?.role || "student");
    setPassword("");
    setErr(null);
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);

    if (!name || !email || !role) {
      setErr("Name, email and role are required.");
      setSubmitting(false);
      return;
    }

    const payload = { name, email, role };
    // only send password for create or if provided
    if (!initialData || password.trim()) payload.password = password.trim();

    const res = await onSave(payload);
    if (!res.success) {
      setErr(res.message || "Failed");
    } else {
      onClose();
    }
    setSubmitting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-slate-900 p-6 rounded-xl border border-white/5 shadow-2xl"
      >
        <h3 className="text-lg font-semibold mb-3 text-indigo-300">
          {initialData ? "Edit User" : "Create User"}
        </h3>

        {err && <div className="mb-2 text-sm text-rose-400">{err}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-300">Name</label>
            <input
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800 text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300">Email</label>
            <input
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800 text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800 text-white"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-300">
              Password {initialData ? "(leave blank to keep current)" : ""}
            </label>
            <input
              className="w-full mt-1 px-3 py-2 rounded bg-slate-800 text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white"
              disabled={submitting}
            >
              {submitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
