"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export function useShippingSettingsStore() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchShipping = useCallback(async () => {
    setIsLoading(true);
    try { setSettings(await api.getShipping()); } catch {} finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchShipping(); }, [fetchShipping]);

  const updateSettings = useCallback(async (data: any) => {
    await api.updateShipping(data);
    setSettings((prev: any) => ({ ...prev, ...data }));
  }, []);

  return {
    settings,
    isLoading,
    fetchShipping,
    updateSettings,
    // Direct field accessors used by orders page
    insideDhakaCost: settings?.insideDhakaFee ?? 70,
    outsideDhakaCost: settings?.outsideDhakaFee ?? 130,
    vatEnabled: settings?.vatEnabled ?? false,
    vatRate: settings?.vatRate ?? 0,
  };
}
