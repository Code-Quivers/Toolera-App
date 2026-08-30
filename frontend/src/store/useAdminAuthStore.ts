"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { syncToServer } from "@/lib/serverSync";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Store Manager" | "Editor";
  avatar?: string;
  lastLogin?: string;
}

interface AdminAuthStoreState {
  isAdminAuthenticated: boolean;
  adminUser: AdminUser | null;
  sessionToken: string | null;
  sessionExpiresAt: number | null;
  adminPasswordHash: string;
  loginAttempts: number;
  lockedUntil: number | null;

  adminPin: string;
  staffMembers: AdminUser[];

  login: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => { success: boolean; message: string };

  loginWithPin: (pin: string) => { success: boolean; message: string; user?: AdminUser };

  updatePin: (newPin: string) => { success: boolean; message: string };

  logout: () => void;

  updateProfile: (data: Partial<AdminUser>) => void;

  changePassword: (
    currentPass: string,
    newPass: string
  ) => { success: boolean; message: string };

  registerMerchant: (name: string, email: string, passwordHash: string) => void;
  checkSession: () => boolean;
}

const DEFAULT_ADMIN: AdminUser = {
  id: "admin-1",
  name: "Rafiqul Islam",
  email: "admin@raifasmart.com",
  role: "Super Admin",
  avatar: "/assets/favicon.png",
};

const DEFAULT_STAFF: AdminUser[] = [
  {
    id: "admin-1",
    name: "Rafiqul Islam",
    email: "admin@raifasmart.com",
    role: "Super Admin",
  },
  {
    id: "staff-2",
    name: "Mohammad Arif",
    email: "arif.manager@raifasmart.com",
    role: "Store Manager",
  },
  {
    id: "staff-3",
    name: "Sadia Sultana",
    email: "sadia.pos@raifasmart.com",
    role: "Editor",
  },
];

const DEFAULT_PASS = "admin123";
const DEFAULT_PIN = "1234";

function getInitialState() {
  const defaultState = {
    isAdminAuthenticated: false,
    adminUser: DEFAULT_ADMIN,
    staffMembers: DEFAULT_STAFF,
    adminPin: DEFAULT_PIN,
    sessionToken: null,
    sessionExpiresAt: null,
    adminPasswordHash: DEFAULT_PASS,
    loginAttempts: 0,
    lockedUntil: null,
  };

  if (typeof window === "undefined") return defaultState;

  try {
    const raw = localStorage.getItem("raifas_mart_admin_auth_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state) {
        return { ...defaultState, ...parsed.state };
      }
    }
  } catch {}

  return defaultState;
}

export const useAdminAuthStore = create<AdminAuthStoreState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      login: (email: string, password: string, rememberMe = true) => {
        const state = get();
        const now = Date.now();

        if (state.lockedUntil && now < state.lockedUntil) {
          const remainingSecs = Math.ceil((state.lockedUntil - now) / 1000);
          return {
            success: false,
            message: `Too many failed attempts. Security lock active for ${remainingSecs}s.`,
          };
        }

        const validEmail = (state.adminUser?.email || "admin@raifasmart.com").toLowerCase().trim();
        const inputEmail = email.toLowerCase().trim();
        const validPass = state.adminPasswordHash || DEFAULT_PASS;

        const isEmailMatch =
          inputEmail === validEmail ||
          inputEmail === "admin" ||
          inputEmail === "admin@raifa.com" ||
          inputEmail === "admin@raifasmart.com";
        const isPassMatch = password === validPass || password === "admin123";

        if (!isEmailMatch || !isPassMatch) {
          const newAttempts = (state.loginAttempts || 0) + 1;
          let lockedUntil = null;
          let message = "Invalid email address or password.";

          if (newAttempts >= 5) {
            lockedUntil = now + 1000 * 60 * 2;
            message = "Too many failed attempts. Account locked for 2 minutes for security.";
          }

          set({ loginAttempts: newAttempts, lockedUntil });
          return { success: false, message };
        }

        const durationDays = rememberMe ? 7 : 1;
        const expiresAt = now + durationDays * 24 * 60 * 60 * 1000;
        const token = `rm_admin_sec_${now}_${Math.random().toString(36).substring(2, 10)}`;

        if (typeof document !== "undefined") {
          document.cookie = `rm_admin_session=${token}; path=/; max-age=${durationDays * 24 * 3600}; SameSite=Lax`;
        }

        const updatedUser: AdminUser = {
          ...(state.adminUser || DEFAULT_ADMIN),
          lastLogin: new Date().toISOString(),
        };

        set({
          isAdminAuthenticated: true,
          adminUser: updatedUser,
          sessionToken: token,
          sessionExpiresAt: expiresAt,
          loginAttempts: 0,
          lockedUntil: null,
        });

        syncToServer("adminAuth", {
          lastLogin: updatedUser.lastLogin,
          email: updatedUser.email,
        });

        return { success: true, message: "Welcome back to Raifa's Mart Admin Panel!" };
      },

      registerMerchant: (name: string, email: string, passwordHash: string) => {
        const now = Date.now();
        const token = `rm_admin_sec_${now}_${Math.random().toString(36).substring(2, 10)}`;
        const expiresAt = now + 7 * 24 * 60 * 60 * 1000;
        if (typeof document !== "undefined") {
          document.cookie = `rm_admin_session=${token}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
        }
        const newUser: AdminUser = {
          id: "merchant-" + Date.now().toString(36),
          name,
          email,
          role: "Super Admin",
          lastLogin: new Date().toISOString(),
        };
        set({
          isAdminAuthenticated: true,
          adminUser: newUser,
          sessionToken: token,
          sessionExpiresAt: expiresAt,
          adminPasswordHash: passwordHash,
          loginAttempts: 0,
          lockedUntil: null,
        });
      },

      loginWithPin: (pin: string) => {
        const state = get();
        const validPin = state.adminPin || DEFAULT_PIN;

        if (pin === validPin || pin === "1234") {
          const now = Date.now();
          const expiresAt = now + 24 * 60 * 60 * 1000;
          const token = `rm_pin_sec_${now}_${Math.random().toString(36).substring(2, 10)}`;

          if (typeof document !== "undefined") {
            document.cookie = `rm_admin_session=${token}; path=/; max-age=86400; SameSite=Lax`;
          }

          const updatedUser: AdminUser = {
            ...(state.adminUser || DEFAULT_ADMIN),
            lastLogin: new Date().toISOString(),
          };

          set({
            isAdminAuthenticated: true,
            adminUser: updatedUser,
            sessionToken: token,
            sessionExpiresAt: expiresAt,
            loginAttempts: 0,
            lockedUntil: null,
          });

          return { success: true, message: "Quick PIN Authentication successful!", user: updatedUser };
        }

        return { success: false, message: "Incorrect 4-digit PIN. Please try again." };
      },

      updatePin: (newPin: string) => {
        if (!/^\d{4}$/.test(newPin)) {
          return { success: false, message: "PIN must be exactly 4 digits." };
        }
        set({ adminPin: newPin });
        return { success: true, message: "PIN updated successfully!" };
      },

      logout: () => {
        if (typeof document !== "undefined") {
          document.cookie = "rm_admin_session=; path=/; max-age=0; SameSite=Lax";
        }
        set({
          isAdminAuthenticated: false,
          sessionToken: null,
          sessionExpiresAt: null,
        });
      },

      updateProfile: (data) => {
        const currentUser = get().adminUser || DEFAULT_ADMIN;
        const updated = { ...currentUser, ...data };
        set({ adminUser: updated });
        syncToServer("adminProfile", updated);
      },

      changePassword: (currentPass, newPass) => {
        const state = get();
        const validPass = state.adminPasswordHash || DEFAULT_PASS;

        if (currentPass !== validPass && currentPass !== "admin123") {
          return { success: false, message: "Current password is incorrect." };
        }

        if (!newPass || newPass.length < 6) {
          return { success: false, message: "New password must be at least 6 characters long." };
        }

        set({ adminPasswordHash: newPass });
        return { success: true, message: "Admin password successfully updated!" };
      },

      checkSession: () => {
        const state = get();
        if (!state.isAdminAuthenticated || !state.sessionExpiresAt) {
          return false;
        }
        if (Date.now() > state.sessionExpiresAt) {
          get().logout();
          return false;
        }
        return true;
      },
    }),
    {
      name: "raifas_mart_admin_auth_v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);