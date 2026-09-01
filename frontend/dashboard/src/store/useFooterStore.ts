"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface FooterLinkItem {
  id: string;
  label: string;
  url: string;
}

export interface FooterSettings {
  // Layout
  columnsCount: 3 | 4 | 5;
  // Column 1 – Brand
  brandLogoType: "TEXT" | "IMAGE";
  brandTitle: string;
  brandLogoUrl: string;
  brandLogoWidth: number;
  brandLogoHeight: number;
  mobileBrandLogoWidth: number;
  mobileBrandLogoHeight: number;
  description: string;
  address: string;
  phone: string;
  email: string;
  // Column 2
  col2Title: string;
  col2Links: FooterLinkItem[];
  // Column 3
  col3Title: string;
  col3Links: FooterLinkItem[];
  // Column 4 – Payment
  col4Title: string;
  col4Note: string;
  enableCodBadge: boolean;
  enableBkashBadge: boolean;
  enableNagadBadge: boolean;
  deliveryHours: string;
  // Column 5 (optional)
  col5Title: string;
  col5Links: FooterLinkItem[];
  // Assurance banner
  showTopAssuranceBanner: boolean;
  assurancePillars: { title: string; subtitle: string; iconName: string }[];
  // Bottom bar
  copyrightText: string;
  attributionText: string;
  bottomLinks: FooterLinkItem[];
  showSocial: boolean;
}

export const defaultFooterSettings: FooterSettings = {
  columnsCount: 3,
  brandLogoType: "TEXT",
  brandTitle: "Toolera",
  brandLogoUrl: "",
  brandLogoWidth: 160,
  brandLogoHeight: 40,
  mobileBrandLogoWidth: 120,
  mobileBrandLogoHeight: 32,
  description: "",
  address: "",
  phone: "",
  email: "",
  col2Title: "SHOP",
  col2Links: [],
  col3Title: "CUSTOMER CARE",
  col3Links: [],
  col4Title: "PAYMENT OPTIONS",
  col4Note: "",
  enableCodBadge: true,
  enableBkashBadge: true,
  enableNagadBadge: true,
  deliveryHours: "",
  col5Title: "MORE",
  col5Links: [],
  showTopAssuranceBanner: true,
  assurancePillars: [
    { title: "Fast Delivery", subtitle: "All across Bangladesh", iconName: "Truck" },
    { title: "Quality Checked", subtitle: "100% inspected items", iconName: "ShieldCheck" },
    { title: "7-Day Easy Return", subtitle: "Hassle-free guarantee", iconName: "RotateCcw" },
    { title: "24/7 Live Support", subtitle: "Call our hotline", iconName: "Headphones" },
  ],
  copyrightText: "© 2025 Toolera",
  attributionText: "",
  bottomLinks: [],
  showSocial: true,
};

export function useFooterStore() {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    api.getFooter()
      .then((data: any) => {
        setSettings({ ...defaultFooterSettings, ...(data ?? {}) });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Local state only — no API call
  const setField = useCallback(<K extends keyof FooterSettings>(key: K, value: FooterSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const patchFields = useCallback((partial: Partial<FooterSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  // Persist full settings to backend
  const saveSettings = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      await api.updateFooter(settings);
    } catch (e: any) {
      setError(e.message || "Failed to save");
      throw e;
    } finally {
      setIsSaving(false);
    }
  }, [settings]);

  const resetToDefaults = useCallback(async () => {
    setSettings(defaultFooterSettings);
    setIsSaving(true);
    try {
      await api.updateFooter(defaultFooterSettings);
    } catch (e: any) {
      setError(e.message || "Failed to reset");
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { settings, isLoading, isSaving, error, setField, patchFields, saveSettings, resetToDefaults };
}
