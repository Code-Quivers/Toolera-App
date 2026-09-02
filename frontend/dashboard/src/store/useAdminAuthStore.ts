"use client";
// Compatibility adapter — wraps lib/auth + API calls to match old Zustand store interface
export type { AdminUser } from "@/lib/auth";
import {
  getAdminUser, setAdminUser, getAdminToken, setAdminToken, clearAdminToken,
  isAdminAuthenticated, getAuthHeader, type AdminUser,
} from "@/lib/auth";

const API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/api\/v1\/?$/, "");

import { useState, useEffect, useCallback } from "react";

export function useAdminAuthStore() {
  const [adminUser, setLocalUser] = useState<AdminUser | null>(null);
  const [isAdminAuthenticatedState, setAuthenticated] = useState(false);

  useEffect(() => {
    setLocalUser(getAdminUser());
    setAuthenticated(isAdminAuthenticated());
  }, []);

  const checkSession = useCallback(() => isAdminAuthenticated(), []);

  const login = useCallback(async (email: string, password: string, rememberMe = true) => {
    try {
      const res = await fetch(`${API}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.message || "Login failed." };
      const token = json.token ?? json.data?.token;
      const user = json.user ?? json.data?.user;
      if (token) { setAdminToken(token, rememberMe); setAdminUser(user); setLocalUser(user); setAuthenticated(true); }
      return { success: true, message: "Welcome back!" };
    } catch {
      return { success: false, message: "Network error." };
    }
  }, []);

  const logout = useCallback(async () => {
    clearAdminToken();
    setLocalUser(null);
    setAuthenticated(false);
  }, []);

  const updateProfile = useCallback(async (data: Partial<AdminUser>) => {
    try {
      await fetch(`${API}/api/v1/auth/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify(data),
      });
      const current = getAdminUser();
      if (current) { const updated = { ...current, ...data }; setAdminUser(updated); setLocalUser(updated); }
    } catch {}
  }, []);

  const changePassword = useCallback(async (currentPass: string, newPass: string) => {
    try {
      const res = await fetch(`${API}/api/v1/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeader() },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const json = await res.json();
      return { success: res.ok, message: json.message || (res.ok ? "Password changed." : "Failed.") };
    } catch {
      return { success: false, message: "Network error." };
    }
  }, []);

  const registerMerchant = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/v1/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await res.json();
      if (res.ok) {
        const token = json.token ?? json.data?.token;
        const user = json.user ?? json.data?.user;
        if (token) { setAdminToken(token); setAdminUser(user); setLocalUser(user); setAuthenticated(true); }
      }
      return { success: res.ok, message: json.message };
    } catch {
      return { success: false, message: "Network error." };
    }
  }, []);

  const loginWithPin = useCallback(async (pin: string) => {
    // PIN login — calls API or returns error
    return { success: false, message: "PIN login requires backend support." };
  }, []);

  const updatePin = useCallback(async (_newPin: string) => {
    return { success: false, message: "PIN update requires backend support." };
  }, []);

  return {
    adminUser,
    isAdminAuthenticated: isAdminAuthenticatedState,
    sessionToken: getAdminToken(),
    checkSession,
    login,
    logout,
    updateProfile,
    changePassword,
    registerMerchant,
    loginWithPin,
    updatePin,
  };
}
