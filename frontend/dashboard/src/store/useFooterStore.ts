"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface FooterLinkItem {
  label: string;
  url: string;
}

export const defaultFooterSettings = {
  columnsCount: 3 as 3 | 4 | 5,
  col2Links: [] as FooterLinkItem[],
  col3Links: [] as FooterLinkItem[],
  col4Links: [] as FooterLinkItem[],
  col5Links: [] as FooterLinkItem[],
  bottomLinks: [] as FooterLinkItem[],
  phone: "",
  email: "",
  address: "",
  copyright: "© 2025 Toolera",
  showSocial: true,
  showTopAssuranceBanner: true,
  assurancePillars: [] as { title: string; subtitle: string; iconName: string }[],
  enableCodBadge: true,
  enableBkashBadge: true,
  enableNagadBadge: true,
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

  const resetToDefaults = useCallback(async () => {
    await api.updateFooter(defaultFooterSettings);
    setSettings(defaultFooterSettings);
  }, []);

  return { settings, isLoading, fetchFooter, updateSettings, resetToDefaults };
}
