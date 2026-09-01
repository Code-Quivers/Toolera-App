"use client";

import React, { useEffect, useState } from "react";
import { useCmsStore } from "@/lib/cms/useCmsStore";
import { THEME_PRESET_SECTIONS, DEFAULT_HOMEPAGE_SECTIONS } from "@/lib/cms/themePresets";
import { SectionRenderer } from "@/components/cms/SectionRenderer";
import type { HomepageThemeLayout } from "@/lib/cms/types";

export function HomePageClient() {
  const { publishedSections, theme, loaded } = useCmsStore();
  // Suppress server-side render until client has fetched real DB data,
  // so server HTML always matches the initial client render (no hydration error).
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a layout-stable placeholder that matches server output
    return <div className="min-h-screen" />;
  }

  // Use published sections from DB; if none saved yet, use the preset for the active theme layout
  const themePreset = THEME_PRESET_SECTIONS[theme.homepageLayout as HomepageThemeLayout] || DEFAULT_HOMEPAGE_SECTIONS;
  const sections =
    publishedSections && publishedSections.length > 0
      ? publishedSections
      : themePreset;

  return <SectionRenderer sections={sections} />;
}
