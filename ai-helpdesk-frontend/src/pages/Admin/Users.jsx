import React, { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../services/api";
import { motion } from "framer-motion";
import { Users, PlusCircle, Edit2, Trash2 } from "lucide-react";
import UserFormModal from "../../components/UserFormModal";
import ConfirmButton from "../../components/ConfirmButton";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
  setLoading(true);
  try {
    const res = await api.get("/api/admin/users");
    const sorted = (res.data || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    setUsers(sorted);
  } catch (err) {
    console.error("Failed to load users:", err);
    setError(err?.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSave = async (payload) => {
    // payload: { name, email, role, password? }
    try {
      if (editingUser) {
        // update
        await api.put(`/api/admin/users/${editingUser._id}`, payload);
      } else {
        // create
        await api.post("/api/admin/users", payload);
      }
      setModalOpen(false);
      fetchUsers();
      return { success: true };
    } catch (err) {
      console.error("Save user error:", err);
      return { success: false, message: err?.response?.data?.message || err.message };
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/users/${id}`);
      fetchUsers();
      alert("User deleted");
    } catch (err) {
      console.error("Delete error:", err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-indigo-400" />
            <h2 className="text-2xl font-semibold text-indigo-300">User Management</h2>
            <p className="text-sm text-slate-400">Create / Edit / Delete student & faculty accounts</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, role..."
              className="px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
            />
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded"
            >
              <PlusCircle size={16} /> New User
            </button>
          </div>
        </div>

        {/* table */}
        <div className="bg-white/5 p-4 rounded-lg shadow-sm border border-white/5 overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-slate-300">Loading users…</div>
          ) : error ? (
            <div className="py-6 text-center text-rose-400">{error}</div>
          ) : (
            <table className="min-w-full text-left">
              <thead>
                <tr className="text-slate-300 text-sm uppercase">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-4 py-6 text-center text-slate-400">
                      No users found.
                    </td>
                  </tr>
                )}
                {filtered.map((u) => (
                  <tr key={u._id} className="border-t border-white/5">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-slate-400">{u._id}</div>
                    </td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3 capitalize">{u.role}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {new Date(u.createdAt || u.createdAt || Date.now()).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => openEdit(u)}
                          className="px-3 py-1 rounded bg-yellow-600 hover:bg-yellow-500 text-white flex items-center gap-2"
                        >
                          <Edit2 size={14} /> Edit
                        </button>

                        <ConfirmButton
                          onConfirm={() => handleDelete(u._id)}
                          confirmText={`Delete ${u.name}? This cannot be undone.`}
                          buttonClass="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white flex items-center gap-2"
                        >
                          <Trash2 size={14} /> Delete
                        </ConfirmButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <UserFormModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
            initialData={editingUser}
          />
        )}
      </motion.div>
    </DashboardLayout>
  );
}
