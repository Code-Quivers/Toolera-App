"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export const defaultFooterSettings = {
  columns: [],
  copyright: "© 2025 Raifa's Mart",
  showSocial: true,
};

export function useFooterStore() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFooter = useCallback(async () => {
    setIsLoading(true);
    try { setSettings(await api.getFooter()); } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchFooter(); }, [fetchFooter]);

  const updateSettings = useCallback(async (data: any) => {
    await api.updateFooter(data);
    setSettings((prev: any) => ({ ...prev, ...data }));
  }, []);

  return { settings, isLoading, fetchFooter, updateSettings };
}
