// src/features/auth/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { motion } from "framer-motion";

export default function Login() {
  const { login, user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [error, setError] = useState(null);

  // If already logged in, redirect to dashboard by role
  useEffect(() => {
    if (token && user) {
      if (user.role === "admin") navigate("/admin", { replace: true });
      else if (user.role === "faculty") navigate("/faculty", { replace: true });
      else navigate("/student", { replace: true }); // or student route
    }
  }, [token, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // <- critical: prevents full page reload
    setError(null);
    setLoadingLocal(true);

    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        // redirect to previous location if present
        const from = location.state?.from?.pathname;
        if (from) return navigate(from, { replace: true });

        // role-based redirect (admin -> /admin)
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        if (currentUser?.role === "admin") navigate("/admin", { replace: true });
        else if (currentUser?.role === "faculty") navigate("/faculty", { replace: true });
        else navigate("/student", { replace: true });
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Login error");
    } finally {
      setLoadingLocal(false);
    }
  };

  return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-slate-100">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-[500px] md:w-[600px] p-12 rounded-2xl bg-white/10 shadow-2xl border border-white/20 backdrop-blur-xl"
      >
        <h2 className="text-3xl font-bold mb-8 text-center text-indigo-400 tracking-wide">Sign in</h2>

        {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

        <label className="block mb-3">
          <span className="text-sm">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
            placeholder="admin@campus.com"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mt-1 p-2 rounded bg-gray-800 text-white"
            placeholder="••••••"
          />
        </label>

        <button
          type="submit"
          disabled={loadingLocal}
          className="w-full py-2 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
        >
          {loadingLocal ? "Signing in…" : "Sign in"}
        </button>
      </motion.form>
    </div>
  );
}
