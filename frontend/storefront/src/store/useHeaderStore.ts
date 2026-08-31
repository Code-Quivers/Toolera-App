"use client";
import { useState, useEffect } from "react";
import { sfApi } from "@/lib/api/storefront";

export function useHeaderStore() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getHeader().then(setSettings).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  return { settings, isLoading };
}
