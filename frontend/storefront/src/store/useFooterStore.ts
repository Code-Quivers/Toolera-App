"use client";
import { useState, useEffect } from "react";
import { sfApi } from "@/lib/api/storefront";

export function useFooterStore() {
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getFooter().then(setSettings).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  return { settings, isLoading };
}
