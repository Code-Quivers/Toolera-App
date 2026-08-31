"use client";
import { useState, useEffect } from "react";
import { sfApi } from "@/lib/api/storefront";

export function useShippingSettingsStore() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getShipping().then(setSettings).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  return { settings, isLoading };
}
