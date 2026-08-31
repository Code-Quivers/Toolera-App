"use client";
// CMS store — replaced Zustand with module-level singleton + React hook listener pattern
import { useEffect, useState } from "react";
import { triggerSoftAction } from "@/store/useSoftLoadingStore";
import { DEFAULT_HOMEPAGE_SECTIONS, THEME_PRESET_SECTIONS } from "./themePresets";
import { SECTION_REGISTRY } from "./sectionRegistry";
import type {
  CMSSectionItem,
  CMSPageRevision,
  CMSAuditLog,
  ThemeSettingsState,
  HomepageThemeLayout,
} from "./types";
import type { HeroBannerSlide } from "@/types/banners";

export { DEFAULT_HOMEPAGE_SECTIONS };

export const DEFAULT_THEME: ThemeSettingsState = {
  homepageLayout: "ORIGINAL_RAIFAS_MART",
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

const CMS_KEY = "raifas_mart_cms_engine_v3";
const THEME_KEY = "raifas_mart_theme_v1";

function loadCms() {
  if (typeof window === "undefined") return { draftSections: DEFAULT_HOMEPAGE_SECTIONS, publishedSections: DEFAULT_HOMEPAGE_SECTIONS };
  try {
    for (const k of [CMS_KEY, "raifas_mart_cms_engine_v2", "raifas_mart_cms_engine"]) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const p = JSON.parse(raw);
        const src = p?.state ?? p;
        if (src?.publishedSections?.length > 0) {
          return { draftSections: src.draftSections || src.publishedSections, publishedSections: src.publishedSections };
        }
      }
    }
  } catch {}
  return { draftSections: DEFAULT_HOMEPAGE_SECTIONS, publishedSections: DEFAULT_HOMEPAGE_SECTIONS };
}

function loadTheme(): ThemeSettingsState {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(THEME_KEY);
    return raw ? { ...DEFAULT_THEME, ...JSON.parse(raw) } : DEFAULT_THEME;
  } catch { return DEFAULT_THEME; }
}

interface CmsState {
  draftSections: CMSSectionItem[];
  publishedSections: CMSSectionItem[];
  globalHeroSlides: HeroBannerSlide[];
  revisions: CMSPageRevision[];
  auditLogs: CMSAuditLog[];
  theme: ThemeSettingsState;
  hasUnsavedChanges: boolean;
  activeDevice: "desktop" | "tablet" | "mobile";
}

const cms = loadCms();
const initHero = cms.publishedSections.find((s: CMSSectionItem) => s.type === "hero-slider");

let state: CmsState = {
  draftSections: cms.draftSections,
  publishedSections: cms.publishedSections,
  globalHeroSlides: initHero?.settings?.slides ?? [],
  revisions: [],
  auditLogs: [],
  theme: loadTheme(),
  hasUnsavedChanges: false,
  activeDevice: "desktop",
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach(l => l()); }

function saveCms() {
  if (typeof window === "undefined") return;
  localStorage.setItem(CMS_KEY, JSON.stringify({
    state: { draftSections: state.draftSections, publishedSections: state.publishedSections },
  }));
}

function saveTheme() {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, JSON.stringify(state.theme));
}

function set(partial: Partial<CmsState>) {
  state = { ...state, ...partial };
  notify();
}

// ── Actions ───────────────────────────────────────────────────────────────────

function setDraftSections(sections: CMSSectionItem[]) {
  set({ draftSections: sections, hasUnsavedChanges: true });
  saveCms();
}

function reorderSections(newSections: CMSSectionItem[]) { setDraftSections(newSections); }

function updateSectionSettings(id: string, settings: any) {
  setDraftSections(state.draftSections.map(s => s.id === id ? { ...s, settings: { ...s.settings, ...settings } } : s));
}

function updateHeroSlides(slides: HeroBannerSlide[]) {
  const sections = state.draftSections.map(s =>
    s.type === "hero-slider" ? { ...s, settings: { ...s.settings, slides } } : s
  );
  set({ globalHeroSlides: slides });
  setDraftSections(sections);
}

function toggleSectionVisibility(id: string) {
  setDraftSections(state.draftSections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
}

function duplicateSection(id: string) {
  const idx = state.draftSections.findIndex(s => s.id === id);
  if (idx < 0) return;
  const src = state.draftSections[idx];
  const clone: CMSSectionItem = { ...src, id: crypto.randomUUID(), position: src.position + 0.5 };
  const next = [...state.draftSections];
  next.splice(idx + 1, 0, clone);
  setDraftSections(next.map((s, i) => ({ ...s, position: i })));
}

function deleteSection(id: string) {
  setDraftSections(state.draftSections.filter(s => s.id !== id));
}

function addSectionFromLibrary(type: string) {
  const def = SECTION_REGISTRY[type];
  if (!def) return;
  const newSection: CMSSectionItem = {
    id: crypto.randomUUID(),
    type,
    position: state.draftSections.length,
    enabled: true,
    settings: def.defaultSettings,
  };
  setDraftSections([...state.draftSections, newSection]);
}

function saveDraft(author = "Admin", notes?: string) {
  triggerSoftAction("Saving draft...", 600);
  const rev: CMSPageRevision = {
    id: crypto.randomUUID(),
    pageId: "homepage",
    version: state.revisions.length + 1,
    title: `Draft v${state.revisions.length + 1}`,
    sectionsSnapshot: state.draftSections,
    themeSnapshot: state.theme,
    isPublished: false,
    createdBy: author,
    notes: notes ?? null,
    createdAt: new Date().toISOString(),
  };
  set({ revisions: [rev, ...state.revisions], hasUnsavedChanges: false });
  saveCms();
}

function publishDraft(author = "Admin", notes?: string) {
  triggerSoftAction("Publishing homepage...", 800);
  const published = state.draftSections;
  set({ publishedSections: published, hasUnsavedChanges: false });
  saveCms();
  addAuditLog("PUBLISH", "homepage", "homepage", { sectionsCount: published.length, author, notes });
}

function rollbackToRevision(revisionId: string, author = "Admin") {
  const rev = state.revisions.find(r => r.id === revisionId);
  if (!rev) return;
  set({ draftSections: rev.sectionsSnapshot, publishedSections: rev.sectionsSnapshot, hasUnsavedChanges: false });
  saveCms();
  addAuditLog("ROLLBACK", "homepage", revisionId, { author });
}

function updateTheme(newTheme: Partial<ThemeSettingsState>, author = "Admin") {
  set({ theme: { ...state.theme, ...newTheme }, hasUnsavedChanges: true });
  saveTheme();
}

function switchThemeLayout(layoutId: HomepageThemeLayout, author = "Admin") {
  const presetSections = THEME_PRESET_SECTIONS[layoutId] || DEFAULT_HOMEPAGE_SECTIONS;
  set({
    theme: { ...state.theme, homepageLayout: layoutId },
    draftSections: presetSections,
    hasUnsavedChanges: true,
  });
  saveCms();
  saveTheme();
}

function setActiveDevice(device: "desktop" | "tablet" | "mobile") {
  set({ activeDevice: device });
}

function addAuditLog(action: string, entity: string, entityId?: string, metadata?: any) {
  const log: CMSAuditLog = {
    id: crypto.randomUUID(),
    userName: "Admin",
    action,
    entity,
    entityId,
    metadata,
    timestamp: new Date().toISOString(),
  };
  set({ auditLogs: [log, ...state.auditLogs].slice(0, 100) });
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCmsStore() {
  const [snap, setSnap] = useState<CmsState>(state);

  useEffect(() => {
    const handler = () => setSnap({ ...state });
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  return {
    ...snap,
    setDraftSections,
    reorderSections,
    updateSectionSettings,
    updateHeroSlides,
    toggleSectionVisibility,
    duplicateSection,
    deleteSection,
    addSectionFromLibrary,
    saveDraft,
    publishDraft,
    rollbackToRevision,
    updateTheme,
    switchThemeLayout,
    setActiveDevice,
    addAuditLog,
  };
}

// Legacy static access (was useCmsStore.setState / useCmsStore.getState)
useCmsStore.setState = (partial: Partial<CmsState>) => { set(partial); saveCms(); saveTheme(); };
useCmsStore.getState = () => state;
