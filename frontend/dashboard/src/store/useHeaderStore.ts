"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export type NavbarLayoutType =
  | "DEFAULT"
  | "CENTERED"
  | "MINIMAL"
  | "MEGA_MENU"
  | "SPLIT_LOGO"
  | "TRANSPARENT"
  | "STICKY_SLIM"
  | "DOUBLE_ROW"
  | "SIDEBAR"
  | "FULLWIDTH";

export const defaultHeaderSettings = {
  navbarLayout: "DEFAULT" as NavbarLayoutType,
  announcementText: "",
  showAnnouncement: false,
  logoType: "TEXT",
  logoText: "Toolera",
  logoImageUrl: "",
  faviconUrl: "",
  ogImageUrl: "",
  ogTitle: "",
  ogDescription: "",
  phone: "",
};

export function useHeaderStore() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHeader = useCallback(async () => {
    setIsLoading(true);
    try { setSettings(await api.getHeader()); } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchHeader(); }, [fetchHeader]);

  const updateSettings = useCallback(async (data: any) => {
    const result = await api.updateHeader(data);
    setSettings((prev: any) => ({ ...prev, ...data }));
    return result;
  }, []);

  const resetToDefaults = useCallback(async () => {
    await api.updateHeader(defaultHeaderSettings);
    setSettings(defaultHeaderSettings);
  }, []);

  return { settings, isLoading, fetchHeader, updateSettings, resetToDefaults };
}
