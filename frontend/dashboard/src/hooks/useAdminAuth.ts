"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getAdminToken,
  getAdminUser,
  setAdminToken,
  setAdminUser,
  clearAdminToken,
  isAdminAuthenticated,
  getAuthHeader,
  type AdminUser,
} from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface LoginResult {
  success: boolean;
  message: string;
}

export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getAdminUser();
    const authed = isAdminAuthenticated();
    setUser(u);
    setAuthenticated(authed);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string, rememberMe = true): Promise<LoginResult> => {
      try {
        const res = await fetch(`${API}/api/v1/auth/admin/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (!res.ok) {
          return { success: false, message: json.message || "Login failed." };
        }
        const { token, user: apiUser } = json.data ?? json;
        setAdminToken(token, rememberMe);
        setAdminUser(apiUser);
        setUser(apiUser);
        setAuthenticated(true);
        return { success: true, message: "Welcome back!" };
      } catch {
        return { success: false, message: "Network error. Please try again." };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/v1/auth/admin/logout`, {
        method: "POST",
        headers: getAuthHeader(),
      });
    } catch {}
    clearAdminToken();
    setUser(null);
    setAuthenticated(false);
  }, []);

  const checkSession = useCallback((): boolean => {
    return isAdminAuthenticated();
  }, []);

  return { user, authenticated, loading, login, logout, checkSession };
}
