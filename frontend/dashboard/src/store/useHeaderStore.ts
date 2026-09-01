"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export type NavbarLayoutType =
  | "WOODMART_MARKETPLACE"
  | "GROCERY_DIRECT"
  | "TECH_SaaS_CLEAN"
  | "CLASSIC_SPLIT"
  | "INLINE_CLEAN"
  | "CENTERED_BRAND"
  | "MEGA_SEARCH_PORTAL"
  | "SIDE_DRAWER_FOCUSED"
  | "TWO_TIER_COMPACT"
  | "TRANSPARENT_OVERLAY";

export interface HeaderSettings {
  // Layout
  navbarLayout: NavbarLayoutType;
  // Brand / Logo
  logoType: "TEXT" | "IMAGE";
  logoText: string;
  logoImageUrl: string;
  faviconUrl: string;
  // OG / Social
  ogImageUrl: string;
  ogTitle: string;
  ogDescription: string;
  // Desktop dimensions
  logoWidth: number;
  logoHeight: number;
  headerHeight: number;
  // Mobile dimensions
  mobileLogoWidth: number;
  mobileLogoHeight: number;
  mobileHeaderHeight: number;
  // Announcement bar
  showTopBar: boolean;
  topBarText: string;
  topBarBgColor: string;
  topBarTextColor: string;
  // Hotline
  hotlinePhone: string;
  showAnnouncement: boolean;
  announcementText: string;
}

export const defaultHeaderSettings: HeaderSettings = {
  navbarLayout: "WOODMART_MARKETPLACE",
  logoType: "TEXT",
  logoText: "Toolera",
  logoImageUrl: "",
  faviconUrl: "",
  ogImageUrl: "",
  ogTitle: "",
  ogDescription: "",
  logoWidth: 240,
  logoHeight: 48,
  headerHeight: 76,
  mobileLogoWidth: 140,
  mobileLogoHeight: 36,
  mobileHeaderHeight: 58,
  showTopBar: false,
  topBarText: "",
  topBarBgColor: "#0F172A",
  topBarTextColor: "#FFFFFF",
  hotlinePhone: "",
  showAnnouncement: false,
  announcementText: "",
};

export function useHeaderStore() {
  const [settings, setSettings] = useState<HeaderSettings>(defaultHeaderSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.getHeader()
      .then((data: any) => {
        setSettings({ ...defaultHeaderSettings, ...(data ?? {}) });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Update local state only — no API call
  const setField = useCallback(<K extends keyof HeaderSettings>(key: K, value: HeaderSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const patchFields = useCallback((partial: Partial<HeaderSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  // Persist full settings to backend
  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      await api.updateHeader(settings);
    } catch (e: any) {
      setError(e.message || "Failed to save");
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const resetToDefaults = useCallback(async () => {
    setSettings(defaultHeaderSettings);
    setIsSaving(true);
    try {
      await api.updateHeader(defaultHeaderSettings);
    } catch (e: any) {
      setError(e.message || "Failed to reset");
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { settings, isLoading, isSaving, error, setField, patchFields, saveSettings, resetToDefaults };
}
