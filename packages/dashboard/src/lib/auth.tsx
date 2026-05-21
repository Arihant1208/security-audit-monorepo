"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiFetch, setSessionToken, clearSessionToken, getSessionToken } from "./api";

interface User {
  id: string;
  email: string;
  name: string;
  plan: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<{ apiKey: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    const token = getSessionToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<{ user: User }>("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => clearSessionToken())
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setSessionToken(data.token);
    setUser(data.user);
  }, []);

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    const data = await apiFetch<{ token: string; user: User; apiKey: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
    setSessionToken(data.token);
    setUser(data.user);
    return { apiKey: data.apiKey };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    clearSessionToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
