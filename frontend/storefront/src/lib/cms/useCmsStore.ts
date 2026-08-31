"use client";
// Storefront CMS store — read-only access to published sections and theme
// No editing capability; sections and theme are fetched from the API / localStorage
import { useEffect, useState } from "react";
import { DEFAULT_HOMEPAGE_SECTIONS } from "./themePresets";
import type { CMSSectionItem, ThemeSettingsState, HomepageThemeLayout } from "./types";

export { DEFAULT_HOMEPAGE_SECTIONS };

export const DEFAULT_THEME: ThemeSettingsState = {
  homepageLayout: "ORIGINAL_RAIFAS_MART" as HomepageThemeLayout,
  primary: "#008B47",
  accent: "#F9A01B",
  primaryButtonText: "#FFFFFF",
  accentButtonText: "#0F172A",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#0F172A",
  muted: "#64748B",
  border: "#E2E8F0",
  radius: "1rem",
  bodyFont: "Inter, sans-serif",
  headingFont: "Inter, sans-serif",
  shadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
  containerWidth: "1280px",
  sectionSpacing: "4rem",
};

function loadPublished(): CMSSectionItem[] {
  if (typeof window === "undefined") return DEFAULT_HOMEPAGE_SECTIONS;
  try {
    for (const k of ["toolera_cms_engine_v3", "toolera_cms_engine_v2", "toolera_cms_engine"]) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const p = JSON.parse(raw);
        const src = p?.state ?? p;
        if (src?.publishedSections?.length > 0) return src.publishedSections;
      }
    }
  } catch {}
  return DEFAULT_HOMEPAGE_SECTIONS;
}

function loadTheme(): ThemeSettingsState {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem("toolera_theme_v1");
    return raw ? { ...DEFAULT_THEME, ...JSON.parse(raw) } : DEFAULT_THEME;
  } catch { return DEFAULT_THEME; }
}

interface CmsReadState {
  publishedSections: CMSSectionItem[];
  draftSections: CMSSectionItem[];
  theme: ThemeSettingsState;
}

let state: CmsReadState = {
  publishedSections: DEFAULT_HOMEPAGE_SECTIONS,
  draftSections: DEFAULT_HOMEPAGE_SECTIONS,
  theme: DEFAULT_THEME,
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach(l => l()); }

// Static .setState / .getState for compat with code that uses these directly
export const useCmsStore = Object.assign(
  function useCmsStore() {
    const [snap, setSnap] = useState<CmsReadState>(state);

    useEffect(() => {
      const loaded = loadPublished();
      const theme = loadTheme();
      state = { publishedSections: loaded, draftSections: loaded, theme };
      setSnap({ ...state });

      const h = () => setSnap({ ...state });
      listeners.add(h);
      return () => { listeners.delete(h); };
    }, []);

    return { ...snap };
  },
  {
    setState: (partial: Partial<CmsReadState>) => { state = { ...state, ...partial }; notify(); },
    getState: () => state,
  }
);
