"use client";
import { useState, useEffect, useCallback } from "react";
import {
  getCustomerToken,
  getCustomerUser,
  setCustomerToken,
  setCustomerUser,
  clearCustomerToken,
  isCustomerAuthenticated,
  getAuthHeader,
  type CustomerUser,
} from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AuthResult {
  success: boolean;
  message: string;
}

export function useCustomerAuth() {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCustomerUser());
    setAuthenticated(isCustomerAuthenticated());
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch(`${API}/api/v1/auth/customer/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.message || "Login failed." };
      const { token, user: apiUser } = json.data ?? json;
      setCustomerToken(token);
      setCustomerUser(apiUser);
      setUser(apiUser);
      setAuthenticated(true);
      return { success: true, message: "Welcome back!" };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, phone?: string): Promise<AuthResult> => {
    try {
      const res = await fetch(`${API}/api/v1/auth/customer/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const json = await res.json();
      if (!res.ok) return { success: false, message: json.message || "Registration failed." };
      const { token, user: apiUser } = json.data ?? json;
      setCustomerToken(token);
      setCustomerUser(apiUser);
      setUser(apiUser);
      setAuthenticated(true);
      return { success: true, message: "Account created!" };
    } catch {
      return { success: false, message: "Network error. Please try again." };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/api/v1/auth/customer/logout`, {
        method: "POST",
        headers: getAuthHeader(),
      });
    } catch {}
    clearCustomerToken();
    setUser(null);
    setAuthenticated(false);
  }, []);

  return { user, authenticated, loading, login, register, logout };
}
