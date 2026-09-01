"use client";
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

let _storeSlug = "";
export function initCmsStore(slug: string) {
  if (slug && slug !== _storeSlug) {
    _storeSlug = slug;
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

function loadCmsLocal() {
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

function loadThemeLocal(): ThemeSettingsState {
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
  isLoading: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  saveError: string | null;
}

const cms = loadCmsLocal();
const initHero = cms.publishedSections.find((s: CMSSectionItem) => s.type === "hero-slider");

let state: CmsState = {
  draftSections: cms.draftSections,
  publishedSections: cms.publishedSections,
  globalHeroSlides: initHero?.settings?.slides ?? [],
  revisions: [],
  auditLogs: [],
  theme: loadThemeLocal(),
  hasUnsavedChanges: false,
  activeDevice: "desktop",
  dbSynced: false,
  isLoading: false,
  isSaving: false,
  isPublishing: false,
  saveError: null,
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

function authHeaders(): Record<string, string> {
  return { ...(getAuthHeader() as Record<string, string>), "Content-Type": "application/json" };
}

async function saveThemeToDb(theme: ThemeSettingsState) {
  try {
    const h = authHeaders();
    if (!h["Authorization"]) return;
    await fetch(`${API}/api/v1/cms/theme${cmsQs()}`, { method: "PUT", headers: h, body: JSON.stringify(theme) });
  } catch {}
}

// ── DB load ───────────────────────────────────────────────────────────────────

export async function loadFromDb() {
  set({ isLoading: true });
  try {
    const h = authHeaders();
    if (!h["Authorization"]) return;

    // Load theme from the combined config endpoint
    const themeRes = await fetch(`${API}/api/v1/cms${cmsQs()}`, { headers: h });
    if (themeRes.ok) {
      const themeJson = await themeRes.json();
      const dbTheme: Partial<ThemeSettingsState> = themeJson?.data?.theme ?? {};
      const mergedTheme = { ...DEFAULT_THEME, ...dbTheme };
      localStorage.setItem(THEME_KEY, JSON.stringify(mergedTheme));
      set({ theme: mergedTheme });
    }

    // Load homepage draft + published sections + revisions from dedicated endpoint
    const hpRes = await fetch(`${API}/api/v1/cms/homepage${cmsQs()}`, { headers: h });
    if (!hpRes.ok) {
      set({ dbSynced: true, isLoading: false });
      return;
    }
    const hpJson = await hpRes.json();
    const data = hpJson?.data;
    if (!data) { set({ dbSynced: true, isLoading: false }); return; }

    const draftSections: CMSSectionItem[] = data.draftSections?.length > 0
      ? data.draftSections
      : state.draftSections;
    const publishedSections: CMSSectionItem[] = data.publishedSections?.length > 0
      ? data.publishedSections
      : state.publishedSections;

    const dbRevisions: CMSPageRevision[] = (data.revisions || []).map((r: any) => ({
      id: r.id,
      pageId: "homepage",
      version: r.version,
      title: r.title,
      sectionsSnapshot: r.sectionsSnapshot || [],
      isPublished: r.isPublished,
      publishedAt: r.publishedAt ?? null,
      createdBy: r.createdBy,
      notes: r.notes ?? null,
      createdAt: r.createdAt,
    }));

    localStorage.setItem(CMS_KEY, JSON.stringify({ state: { draftSections, publishedSections } }));

    const hero = draftSections.find((s: CMSSectionItem) => s.type === "hero-slider");
    set({
      draftSections,
      publishedSections,
      globalHeroSlides: hero?.settings?.slides ?? state.globalHeroSlides,
      revisions: dbRevisions,
      dbSynced: true,
      isLoading: false,
    });
  } catch {
    set({ dbSynced: true, isLoading: false });
  }
}

// ── Local state mutations ─────────────────────────────────────────────────────

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

// ── Async API actions ─────────────────────────────────────────────────────────

async function saveDraft(author = "Admin", notes?: string): Promise<void> {
  if (state.isSaving) return;
  set({ isSaving: true, saveError: null });
  triggerSoftAction("Saving draft...", 600);
  try {
    const h = authHeaders();
    if (h["Authorization"]) {
      const res = await fetch(`${API}/api/v1/cms/homepage/draft${cmsQs()}`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ sections: state.draftSections, author, notes }),
      });
      if (res.ok) {
        const json = await res.json();
        const rev = json?.revision;
        if (rev) {
          const newRev: CMSPageRevision = {
            id: rev.id,
            pageId: "homepage",
            version: rev.version,
            title: rev.title,
            sectionsSnapshot: state.draftSections,
            isPublished: false,
            createdBy: rev.createdBy,
            notes: rev.notes ?? null,
            createdAt: rev.createdAt,
          };
          set({ revisions: [newRev, ...state.revisions], hasUnsavedChanges: false });
        } else {
          set({ hasUnsavedChanges: false });
        }
      } else {
        const err = await res.json().catch(() => ({}));
        set({ saveError: err?.message || "Failed to save draft" });
        throw new Error(err?.message || "Failed to save draft");
      }
    }
    saveCmsLocal();
  } finally {
    set({ isSaving: false });
  }
}

async function publishDraft(author = "Admin", notes?: string): Promise<void> {
  if (state.isPublishing) return;
  set({ isPublishing: true, saveError: null });
  triggerSoftAction("Publishing homepage...", 800);
  const published = state.draftSections;
  try {
    const h = authHeaders();
    if (h["Authorization"]) {
      const res = await fetch(`${API}/api/v1/cms/homepage/publish${cmsQs()}`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ sections: published, author, notes }),
      });
      if (res.ok) {
        const json = await res.json();
        const rev = json?.revision;
        if (rev) {
          const newRev: CMSPageRevision = {
            id: rev.id,
            pageId: "homepage",
            version: rev.version,
            title: rev.title,
            sectionsSnapshot: published,
            isPublished: true,
            publishedAt: rev.publishedAt,
            createdBy: rev.createdBy,
            notes: rev.notes ?? null,
            createdAt: rev.createdAt,
          };
          set({ revisions: [newRev, ...state.revisions], publishedSections: published, hasUnsavedChanges: false });
        } else {
          set({ publishedSections: published, hasUnsavedChanges: false });
        }
        addAuditLog("PUBLISH", "homepage", "homepage", { sectionsCount: published.length, author, notes });
      } else {
        const err = await res.json().catch(() => ({}));
        set({ saveError: err?.message || "Failed to publish" });
        throw new Error(err?.message || "Failed to publish");
      }
    } else {
      set({ publishedSections: published, hasUnsavedChanges: false });
    }
    saveCmsLocal();
  } finally {
    set({ isPublishing: false });
  }
}

async function rollbackToRevision(revisionId: string, author = "Admin"): Promise<void> {
  const rev = state.revisions.find(r => r.id === revisionId);
  if (!rev) return;

  set({ isPublishing: true, saveError: null });
  try {
    const h = authHeaders();
    if (h["Authorization"]) {
      const res = await fetch(`${API}/api/v1/cms/homepage/revisions/${revisionId}/restore${cmsQs()}`, {
        method: "POST",
        headers: h,
        body: JSON.stringify({ author }),
      });
      if (res.ok) {
        const json = await res.json();
        const newRevData = json?.revision;
        const sections = rev.sectionsSnapshot;
        const newRev: CMSPageRevision = {
          id: newRevData?.id ?? crypto.randomUUID(),
          pageId: "homepage",
          version: newRevData?.version ?? state.revisions.length + 1,
          title: newRevData?.title ?? `Restored from v${rev.version}`,
          sectionsSnapshot: sections,
          isPublished: true,
          createdBy: author,
          notes: `Restored from revision v${rev.version}`,
          createdAt: new Date().toISOString(),
        };
        set({
          draftSections: sections,
          publishedSections: sections,
          revisions: [newRev, ...state.revisions],
          hasUnsavedChanges: false,
        });
        saveCmsLocal();
        addAuditLog("ROLLBACK", "homepage", revisionId, { author });
      } else {
        const err = await res.json().catch(() => ({}));
        set({ saveError: err?.message || "Failed to restore revision" });
        throw new Error(err?.message || "Failed to restore revision");
      }
    } else {
      // Offline fallback
      set({ draftSections: rev.sectionsSnapshot, publishedSections: rev.sectionsSnapshot, hasUnsavedChanges: false });
      saveCmsLocal();
    }
  } finally {
    set({ isPublishing: false });
  }
}

function updateTheme(newTheme: Partial<ThemeSettingsState>) {
  const merged = { ...state.theme, ...newTheme };
  set({ theme: merged, hasUnsavedChanges: true });
  saveThemeLocal();
  saveThemeToDb(merged);
}

function switchThemeLayout(layoutId: HomepageThemeLayout) {
  const presetSections = THEME_PRESET_SECTIONS[layoutId] || DEFAULT_HOMEPAGE_SECTIONS;
  const merged = { ...state.theme, homepageLayout: layoutId };
  set({ theme: merged, draftSections: presetSections, publishedSections: presetSections, hasUnsavedChanges: false });
  saveCmsLocal();
  saveThemeLocal();
  saveThemeToDb(merged);
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCmsStore() {
  const [snap, setSnap] = useState<CmsState>(state);

  useEffect(() => {
    const handler = () => setSnap({ ...state });
    listeners.add(handler);
    if (!state.dbSynced) { loadFromDb(); }
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

useCmsStore.setState = (partial: Partial<CmsState>) => { set(partial); saveCmsLocal(); saveThemeLocal(); };
useCmsStore.getState = () => state;
