"use client";
// CMS store — module-level singleton + React hook listener pattern
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
import { getAuthHeader } from "@/lib/auth";

export { DEFAULT_HOMEPAGE_SECTIONS };

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Active seller store slug — set once from the admin layout when the store is known.
// Included as ?slug= in all CMS API calls so the backend always targets the correct store
// rather than relying solely on auth-token resolution (which fails for multi-store setups).
let _storeSlug = "";
export function initCmsStore(slug: string) {
  if (slug && slug !== _storeSlug) {
    _storeSlug = slug;
    // Re-sync from DB whenever the store context changes
    set({ dbSynced: false });
  }
}
function cmsQs() { return _storeSlug ? `?slug=${encodeURIComponent(_storeSlug)}` : ""; }

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

const CMS_KEY = "toolera_cms_engine_v3";
const THEME_KEY = "toolera_theme_v1";

function loadCms() {
  if (typeof window === "undefined") return { draftSections: DEFAULT_HOMEPAGE_SECTIONS, publishedSections: DEFAULT_HOMEPAGE_SECTIONS };
  try {
    for (const k of [CMS_KEY, "toolera_cms_engine_v2", "toolera_cms_engine"]) {
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
  dbSynced: boolean;
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
  dbSynced: false,
};

const listeners = new Set<() => void>();
function notify() { listeners.forEach(l => l()); }

function saveCmsLocal() {
  if (typeof window === "undefined") return;
  localStorage.setItem(CMS_KEY, JSON.stringify({
    state: { draftSections: state.draftSections, publishedSections: state.publishedSections },
  }));
}

function saveThemeLocal() {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_KEY, JSON.stringify(state.theme));
}

function set(partial: Partial<CmsState>) {
  state = { ...state, ...partial };
  notify();
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function saveThemeToDb(theme: ThemeSettingsState) {
  try {
    const authHeader = getAuthHeader() as Record<string, string>;
    if (!authHeader["Authorization"]) return;
    await fetch(`${API}/api/v1/cms/theme${cmsQs()}`, {
      method: "PUT",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    });
  } catch {}
}

async function saveSectionsToDb(sections: CMSSectionItem[], isPublished = true) {
  try {
    const authHeader = getAuthHeader() as Record<string, string>;
    if (!authHeader["Authorization"]) return;
    await fetch(`${API}/api/v1/cms/sections${cmsQs()}`, {
      method: "POST",
      headers: { ...authHeader, "Content-Type": "application/json" },
      body: JSON.stringify({ sections, isPublished }),
    });
  } catch {}
}

// Load theme + published sections from DB on first mount
export async function loadFromDb() {
  try {
    const authHeader = getAuthHeader() as Record<string, string>;
    if (!authHeader["Authorization"]) return;
    const headers = authHeader;
    const res = await fetch(`${API}/api/v1/cms${cmsQs()}`, { headers });
    if (!res.ok) return;
    const json = await res.json();
    const data = json?.data;
    if (!data) return;

    const dbTheme: Partial<ThemeSettingsState> = data.theme ?? {};
    const mergedTheme = { ...DEFAULT_THEME, ...dbTheme };
    const publishedSections: CMSSectionItem[] = data.publishedSections?.length > 0
      ? data.publishedSections
      : state.publishedSections;

    // Save to localStorage cache
    localStorage.setItem(THEME_KEY, JSON.stringify(mergedTheme));
    localStorage.setItem(CMS_KEY, JSON.stringify({ state: { draftSections: publishedSections, publishedSections } }));

    const hero = publishedSections.find((s: CMSSectionItem) => s.type === "hero-slider");
    set({
      theme: mergedTheme,
      publishedSections,
      draftSections: publishedSections,
      globalHeroSlides: hero?.settings?.slides ?? state.globalHeroSlides,
      dbSynced: true,
    });
  } catch {}
}

// ── Actions ───────────────────────────────────────────────────────────────────

function setDraftSections(sections: CMSSectionItem[]) {
  set({ draftSections: sections, hasUnsavedChanges: true });
  saveCmsLocal();
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
  saveCmsLocal();
  saveSectionsToDb(state.draftSections, false);
}

function publishDraft(author = "Admin", notes?: string) {
  triggerSoftAction("Publishing homepage...", 800);
  const published = state.draftSections;
  set({ publishedSections: published, hasUnsavedChanges: false });
  saveCmsLocal();
  addAuditLog("PUBLISH", "homepage", "homepage", { sectionsCount: published.length, author, notes });
  saveSectionsToDb(published, true);
}

function rollbackToRevision(revisionId: string, author = "Admin") {
  const rev = state.revisions.find(r => r.id === revisionId);
  if (!rev) return;
  set({ draftSections: rev.sectionsSnapshot, publishedSections: rev.sectionsSnapshot, hasUnsavedChanges: false });
  saveCmsLocal();
  addAuditLog("ROLLBACK", "homepage", revisionId, { author });
}

function updateTheme(newTheme: Partial<ThemeSettingsState>, author = "Admin") {
  const merged = { ...state.theme, ...newTheme };
  set({ theme: merged, hasUnsavedChanges: true });
  saveThemeLocal();
  saveThemeToDb(merged);
}

function switchThemeLayout(layoutId: HomepageThemeLayout, author = "Admin") {
  const presetSections = THEME_PRESET_SECTIONS[layoutId] || DEFAULT_HOMEPAGE_SECTIONS;
  const merged = { ...state.theme, homepageLayout: layoutId };
  set({
    theme: merged,
    draftSections: presetSections,
    publishedSections: presetSections,
    hasUnsavedChanges: false,
  });
  saveCmsLocal();
  saveThemeLocal();
  saveThemeToDb(merged);
  saveSectionsToDb(presetSections, true);
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

    // Load from DB on first mount (only once per session)
    if (!state.dbSynced) {
      loadFromDb();
    }

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

// Legacy static access
useCmsStore.setState = (partial: Partial<CmsState>) => { set(partial); saveCmsLocal(); saveThemeLocal(); };
useCmsStore.getState = () => state;
