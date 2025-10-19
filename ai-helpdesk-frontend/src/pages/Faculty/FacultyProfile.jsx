// src/pages/student/StudentProfile.jsx
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [msg, setMsg] = useState(null);
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/profile");
      setProfile(res.data);
      setForm({ name: res.data.name || "", email: res.data.email || "" });
    } catch (err) {
      console.error("Load profile error", err);
      setMsg({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await api.put("/api/profile", form);
      setMsg({ type: "success", text: res.data?.message || "Saved" });
      setProfile(res.data.user || res.data);
      setEditing(false);
    } catch (err) {
      console.error("Save profile error", err);
      setMsg({ type: "error", text: err?.response?.data?.message || "Save failed" });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setMsg({ type: "error", text: "Provide both current and new password" });
      return;
    }
    setPwLoading(true);
    try {
      const res = await api.put("/api/profile/password", pwForm);
      setMsg({ type: "success", text: res.data?.message || "Password changed" });
      setPwForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      console.error("Change password error", err);
      setMsg({ type: "error", text: err?.response?.data?.message || "Password change failed" });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">My Profile</h1>
            <p className="text-sm text-slate-400 mt-1">View or update your account details</p>
          </div>
        </div>

        {msg && (
          <div className={`px-4 py-2 rounded ${msg.type === "error" ? "bg-red-700" : "bg-green-700"} mb-4`}>
            {msg.text}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {profile?.name?.split(" ").map(n => n[0]).slice(0,2).join("") || "U"}
              </div>
              <div>
                <div className="text-lg font-semibold text-indigo-300">{profile?.name || "Loading..."}</div>
                <div className="text-sm text-slate-400">{profile?.role}</div>
                <div className="text-xs text-slate-500 mt-2">Member since: {profile ? new Date(profile.createdAt).toLocaleDateString() : "..."}</div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-white/5 p-6 rounded-xl border border-white/10">
            {loading ? (
              <div className="text-slate-400">Loading...</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl text-indigo-300 font-semibold">Account Details</h2>
                  <button onClick={() => setEditing(e => !e)} className="px-3 py-1 bg-gray-800 rounded">
                    {editing ? "Cancel" : "Edit"}
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <div className="text-sm text-slate-300">Full name</div>
                    <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} disabled={!editing} className={`mt-1 w-full p-2 rounded bg-gray-800 text-white ${!editing ? "opacity-70" : ""}`} />
                  </label>

                  <label className="block">
                    <div className="text-sm text-slate-300">Email</div>
                    <input value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} disabled={!editing} className={`mt-1 w-full p-2 rounded bg-gray-800 text-white ${!editing ? "opacity-70" : ""}`} />
                  </label>

                  {editing && (
                    <div className="flex justify-end">
                      <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 rounded text-white">Save Changes</button>
                    </div>
                  )}
                </div>

                <hr className="my-6 border-gray-700" />

                <div>
                  <h3 className="text-lg text-indigo-300 font-semibold mb-3">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} className="p-2 rounded bg-gray-800 text-white" />
                    <input type="password" placeholder="New password" value={pwForm.newPassword} onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))} className="p-2 rounded bg-gray-800 text-white" />
                  </div>
                  <div className="flex justify-end mt-3">
                    <button onClick={handleChangePassword} disabled={pwLoading} className="px-4 py-2 bg-green-600 rounded text-white">
                      {pwLoading ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
