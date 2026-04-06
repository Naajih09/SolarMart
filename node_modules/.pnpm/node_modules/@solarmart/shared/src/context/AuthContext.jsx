import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, getToken, setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    apiFetch("/api/auth?action=me")
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken("");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const data = await apiFetch("/api/auth?action=login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (data.token) {
      setToken(data.token);
    }
    setUser(data.user || null);
    return data;
  }

  async function register(payload) {
    const data = await apiFetch("/api/auth?action=register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (data.token) {
      setToken(data.token);
    }
    setUser(data.user || null);
    return data;
  }

  async function logout() {
    try {
      await apiFetch("/api/auth?action=logout", {
        method: "POST",
      });
    } finally {
      setToken("");
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      setUser,
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
