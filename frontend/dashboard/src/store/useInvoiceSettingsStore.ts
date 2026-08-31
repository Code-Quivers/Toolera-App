"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useInvoiceSettingsStore() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInvoiceSettings = useCallback(async () => {
    setIsLoading(true);
    try { setSettings(await api.getInvoiceSettings()); } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchInvoiceSettings(); }, [fetchInvoiceSettings]);

  const updateSettings = useCallback(async (data: any) => {
    await api.updateInvoiceSettings(data);
    setSettings((prev: any) => ({ ...prev, ...data }));
  }, []);

  return { settings, isLoading, fetchInvoiceSettings, updateSettings };
}
