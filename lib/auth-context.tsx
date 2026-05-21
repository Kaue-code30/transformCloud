"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "./api";

type User = { id: string; email: string; name: string; role: string; createdAt: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: { name?: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) { setLoading(false); return; }
    try {
      const me = await api.users.me();
      setUser(me);
    } catch {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const saveTokens = (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const login = async (email: string, password: string) => {
    const tokens = await api.auth.login({ email, password });
    saveTokens(tokens.accessToken, tokens.refreshToken);
    setUser(await api.users.me());
  };

  const register = async (email: string, name: string, password: string) => {
    const tokens = await api.auth.register({ email, name, password });
    saveTokens(tokens.accessToken, tokens.refreshToken);
    setUser(await api.users.me());
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken") ?? "";
    await api.auth.logout(refreshToken).catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const updateUser = async (data: { name?: string }) => {
    const updated = await api.users.update(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
}
