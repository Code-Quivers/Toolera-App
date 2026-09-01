"use client";
// Storefront CMS store — DB is always source of truth; localStorage used only for cache
import { useEffect, useState } from "react";
import { DEFAULT_HOMEPAGE_SECTIONS, THEME_PRESET_SECTIONS } from "./themePresets";
import type { CMSSectionItem, ThemeSettingsState, HomepageThemeLayout } from "./types";

export { DEFAULT_HOMEPAGE_SECTIONS };

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const STORE_SLUG = process.env.NEXT_PUBLIC_STORE_SLUG || "";

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

interface CmsReadState {
  publishedSections: CMSSectionItem[];
  draftSections: CMSSectionItem[];
  theme: ThemeSettingsState;
  loaded: boolean;
}

// Module-level state — consistent default used for SSR and first client render
// to avoid hydration mismatch. Updated only after DB fetch completes.
let state: CmsReadState = {
  publishedSections: DEFAULT_HOMEPAGE_SECTIONS,
  draftSections: DEFAULT_HOMEPAGE_SECTIONS,
  theme: DEFAULT_THEME,
  loaded: false,
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach(l => l()); }

// Deduplicated in-flight fetch — prevents duplicate API calls when multiple components mount
let fetchPromise: Promise<void> | null = null;

async function fetchFromApi(): Promise<void> {
  if (fetchPromise) return fetchPromise;
  fetchPromise = _doFetch().finally(() => { fetchPromise = null; });
  return fetchPromise;
}

async function _doFetch(): Promise<void> {
  try {
    const qs = STORE_SLUG ? `?slug=${encodeURIComponent(STORE_SLUG)}` : "";
    const res = await fetch(`${BASE}/api/v1/cms${qs}`, { cache: "no-store" });
    if (!res.ok) return;
    const json = await res.json();
    const data = json?.data;
    if (!data) return;

    const theme: ThemeSettingsState = data.theme
      ? { ...DEFAULT_THEME, ...data.theme }
      : DEFAULT_THEME;

    // If no published sections saved yet, use the seller's chosen theme preset
    const themePreset = THEME_PRESET_SECTIONS[theme.homepageLayout as HomepageThemeLayout] || DEFAULT_HOMEPAGE_SECTIONS;
    const sections: CMSSectionItem[] = data.publishedSections?.length > 0
      ? data.publishedSections
      : themePreset;

    // Cache in localStorage for the next session (not used for SSR)
    try {
      localStorage.setItem("toolera_theme_v1", JSON.stringify(theme));
      localStorage.setItem("toolera_cms_engine_v3", JSON.stringify({ state: { draftSections: sections, publishedSections: sections } }));
    } catch {}

    state = { publishedSections: sections, draftSections: sections, theme, loaded: true };
    notify();
  } catch {}
}

export const useCmsStore = Object.assign(
  function useCmsStore() {
    // Always start with the same default state on server AND client first render
    // to avoid SSR/hydration mismatch. DB data arrives via useEffect.
    const [snap, setSnap] = useState<CmsReadState>(state);

    useEffect(() => {
      // If DB data already fetched (another component triggered it first), sync immediately
      if (state.loaded) setSnap({ ...state });

      const h = () => setSnap({ ...state });
      listeners.add(h);

      // Always refresh from DB on mount
      fetchFromApi();

      return () => { listeners.delete(h); };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return { ...snap };
  },
  {
    setState: (partial: Partial<CmsReadState>) => { state = { ...state, ...partial }; notify(); },
    getState: () => state,
  }
);
