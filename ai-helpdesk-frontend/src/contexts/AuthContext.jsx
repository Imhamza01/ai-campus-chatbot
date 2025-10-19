import React, { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

import api from "../services/api";            // axios instance
import endpoints from "../services/endpoints";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // when token changes, set axios header & optionally decode role
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // try to decode role from token if embedded
      try {
        const decoded = jwtDecode(token);
        if (decoded) {
          // some tokens include role, some don't
          if (decoded.role && (!user || user.role !== decoded.role)) {
            const u = { ...(user || {}), role: decoded.role };
            setUser(u);
            localStorage.setItem("user", JSON.stringify(u));
          }
        }
      } catch (err) {
        // ignore decode errors
      }
    } else {
      localStorage.removeItem("token");
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  // try to rehydrate user by calling /api/auth/profile if exists
  // If your backend exposes a profile route, it will be used to refresh user info.
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // try profile endpoint (optional)
        const res = await api.get(endpoints.AUTH?.PROFILE || "/api/auth/profile");
        if (res?.data) {
          setUser(res.data);
          localStorage.setItem("user", JSON.stringify(res.data));
        }
      } catch (err) {
        // profile route may not exist — it's okay
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
  setLoading(true);
  try {
    const res = await api.post(endpoints.AUTH.LOGIN, { email, password });
    const theToken = res.data.token || res.data?.token;
    if (!theToken) throw new Error("No token received from server");

    setToken(theToken);

    let u = null;
    if (res.data.name || res.data.email || res.data._id || res.data.role) {
      u = {
        _id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      };
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
    } else {
      try {
        const decoded = jwtDecode(theToken);
        u = { _id: decoded.id || decoded.sub, role: decoded.role };
        setUser(u);
        localStorage.setItem("user", JSON.stringify(u));
      } catch (err) {
        // no user info
      }
    }

    api.defaults.headers.common.Authorization = `Bearer ${theToken}`;

    // Return user so caller can redirect appropriately
    return { success: true, user: u };
  } catch (err) {
    const message =
      err?.response?.data?.message || err?.message || "Login failed";
    return { success: false, message };
  } finally {
    setLoading(false);
  }
};


  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("chatHistory");
    delete api.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, setUser, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
