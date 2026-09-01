"use client";
import { useState, useEffect } from "react";
import { sfApi } from "@/lib/api/storefront";

const defaultFooterSettings = {
  storeNameLine1: "Raifa's",
  storeNameLine2: "Mart",
  tagline: "Your trusted online shop",
  phone: "",
  email: "",
  address: "",
  copyright: "© 2025 Raifa's Mart. All rights reserved.",
  col2Title: "Quick Links",
  col2Links: [] as { label: string; href: string }[],
  col3Title: "Categories",
  col3Links: [] as { label: string; href: string }[],
  col4Title: "Support",
  col4Links: [] as { label: string; href: string }[],
  col5Title: "More",
  col5Links: [] as { label: string; href: string }[],
  bottomLinks: [] as { label: string; href: string }[],
  columnsCount: 3,
  showSocial: true,
  socialLinks: [] as { platform: string; url: string }[],
  showTopAssuranceBanner: true,
  assurancePillars: [] as { icon: string; title: string; subtitle: string }[],
  enableCodBadge: true,
  enableBkashBadge: true,
  enableNagadBadge: true,
};

export type FooterSettings = typeof defaultFooterSettings;

export function useFooterStore() {
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getFooter()
      .then(data => {
        if (data) setSettings({ ...defaultFooterSettings, ...data });
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return { settings, isLoading };
}
