"use client";
import { useState, useEffect } from "react";
import { sfApi } from "@/lib/api/storefront";

export const defaultHeaderSettings = {
  navbarLayout: "DEFAULT",
  logoType: "TEXT" as const,
  logoText: "Toolera",
  logoImageUrl: "",
  faviconUrl: "",
  ogImageUrl: "",
  ogTitle: "",
  ogDescription: "",
  showAnnouncement: false,
  announcementText: "",
  phone: "",
};

export function useHeaderStore() {
  const [settings, setSettings] = useState<any>(defaultHeaderSettings);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    sfApi.getHeader().then(setSettings).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

  return { settings, isLoading };
}
