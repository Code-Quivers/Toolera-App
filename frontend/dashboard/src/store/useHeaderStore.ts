"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export const defaultHeaderSettings = {
  navbarLayout: "DEFAULT",
  announcementText: "",
  showAnnouncement: false,
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

  return { settings, isLoading, fetchHeader, updateSettings };
}
