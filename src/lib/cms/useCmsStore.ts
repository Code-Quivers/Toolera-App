import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";
import {
  CMSSectionItem,
  CMSPageRevision,
  CMSAuditLog,
  ThemeSettingsState,
  HomepageThemeLayout,
} from "./types";
import { SECTION_REGISTRY } from "./sectionRegistry";
import { HeroBannerSlide } from "@/types/banners";
import { triggerSoftAction } from "@/store/useSoftLoadingStore";
import { syncToServer } from "@/lib/serverSync";
import { DEFAULT_HOMEPAGE_SECTIONS, THEME_PRESET_SECTIONS } from "./themePresets";

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

// Check and migrate existing saved CMS sections from legacy storage keys
function getInitialCmsState(): { draftSections: CMSSectionItem[]; publishedSections: CMSSectionItem[] } {
  if (typeof window === "undefined") {
    return {
      draftSections: DEFAULT_HOMEPAGE_SECTIONS,
      publishedSections: DEFAULT_HOMEPAGE_SECTIONS,
    };
  }
  try {
    const keys = [
      "raifas_mart_cms_engine_v3",
      "raifas_mart_cms_engine_v2",
      "raifas_mart_cms_engine",
    ];
    for (const k of keys) {
      const raw = localStorage.getItem(k);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.publishedSections && parsed.state.publishedSections.length > 0) {
          return {
            draftSections: parsed.state.draftSections || parsed.state.publishedSections,
            publishedSections: parsed.state.publishedSections,
          };
        }
      }
    }
  } catch {}
  return {
    draftSections: DEFAULT_HOMEPAGE_SECTIONS,
    publishedSections: DEFAULT_HOMEPAGE_SECTIONS,
  };
}

interface CmsState {
  draftSections: CMSSectionItem[];
  publishedSections: CMSSectionItem[];
  savedThemeLayouts: Partial<Record<HomepageThemeLayout, CMSSectionItem[]>>;
  globalHeroSlides: HeroBannerSlide[];
  revisions: CMSPageRevision[];
  auditLogs: CMSAuditLog[];
  theme: ThemeSettingsState;
  hasUnsavedChanges: boolean;
  activeDevice: "desktop" | "tablet" | "mobile";

  // Section Builder Actions
  setDraftSections: (sections: CMSSectionItem[]) => void;
  reorderSections: (newSections: CMSSectionItem[]) => void;
  updateSectionSettings: (id: string, settings: any) => void;
  updateHeroSlides: (slides: HeroBannerSlide[]) => void;
  toggleSectionVisibility: (id: string) => void;
  duplicateSection: (id: string) => void;
  deleteSection: (id: string) => void;
  addSectionFromLibrary: (type: string) => void;

  // Revision & Publishing
  saveDraft: (author?: string, notes?: string) => void;
  publishDraft: (author?: string, notes?: string) => void;
  rollbackToRevision: (revisionId: string, author?: string) => void;

  // Theme & Layout Actions
  updateTheme: (newTheme: Partial<ThemeSettingsState>, author?: string) => void;
  switchThemeLayout: (layoutId: HomepageThemeLayout, author?: string) => void;
  setActiveDevice: (device: "desktop" | "tablet" | "mobile") => void;
  addAuditLog: (action: string, entity: string, entityId?: string, metadata?: any) => void;
}

export const useCmsStore = create<CmsState>()(
  persist(
    (set, get) => {
      const initialSections = getInitialCmsState().publishedSections;
      const initialHeroSec = initialSections.find((s: CMSSectionItem) => s.type === "hero-slider");
      const initialSlides = initialHeroSec?.settings?.slides || [];

      return {
        draftSections: getInitialCmsState().draftSections,
        publishedSections: initialSections,
        savedThemeLayouts: {
          ORIGINAL_RAIFAS_MART: initialSections,
        },
        globalHeroSlides: initialSlides,
        revisions: [
          {
            id: "rev-initial",
            pageId: "homepage",
            version: 1,
            title: "Initial Clean Launch",
            sectionsSnapshot: initialSections,
            themeLayout: "ORIGINAL_RAIFAS_MART",
            themeSnapshot: DEFAULT_THEME,
            isPublished: true,
            publishedAt: new Date().toISOString(),
            createdBy: "System Admin",
            notes: "Initial launch layout with banners",
            createdAt: new Date().toISOString(),
          },
        ],
        auditLogs: [
          {
            id: "log-1",
            userName: "System Admin",
            action: "INITIAL_STORE_SETUP",
            entity: "Homepage",
            timestamp: new Date().toISOString(),
          },
        ],
        theme: DEFAULT_THEME,
        hasUnsavedChanges: false,
        activeDevice: "desktop",

        setDraftSections: (sections) => {
          set({ draftSections: sections, hasUnsavedChanges: true });
        },

        reorderSections: (newSections) => {
          const withUpdatedPos = newSections.map((sec, idx) => ({ ...sec, position: idx }));
          set({ draftSections: withUpdatedPos, hasUnsavedChanges: true });
        },

        updateSectionSettings: (id, settings) => {
          const updated = get().draftSections.map((sec) =>
            sec.id === id ? { ...sec, settings: { ...sec.settings, ...settings } } : sec
          );
          set({ draftSections: updated, hasUnsavedChanges: true });
        },

        // Direct hero slides updater: updates global banner store, current draft, published, and saved theme map
        updateHeroSlides: (slides: HeroBannerSlide[]) => {
          const updateList = (list: CMSSectionItem[]): CMSSectionItem[] => {
            let found = false;
            const updated = list.map((s) => {
              if (s.type === "hero-slider") {
                found = true;
                return {
                  ...s,
                  settings: { ...s.settings, slides },
                };
              }
              return s;
            });
            if (!found) {
              updated.unshift({
                id: "sec-hero",
                type: "hero-slider",
                position: 0,
                enabled: true,
                settings: { autoplay: true, interval: 5000, boxed: true, slides },
              });
            }
            return updated;
          };

          const newDraft = updateList(get().draftSections || []);
          const newPub = updateList(get().publishedSections || []);
          const currentLayout = get().theme.homepageLayout || "ORIGINAL_RAIFAS_MART";

          set({
            globalHeroSlides: slides,
            draftSections: newDraft,
            publishedSections: newPub,
            savedThemeLayouts: {
              ...get().savedThemeLayouts,
              [currentLayout]: newPub,
            },
            hasUnsavedChanges: false,
          });

          syncToServer("cms", {
            draftSections: newDraft,
            publishedSections: newPub,
            theme: get().theme,
          });
        },

        toggleSectionVisibility: (id) => {
          const updated = get().draftSections.map((sec) =>
            sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
          );
          set({ draftSections: updated, hasUnsavedChanges: true });
        },

        duplicateSection: (id) => {
          const target = get().draftSections.find((s) => s.id === id);
          if (!target) return;
          const newSec: CMSSectionItem = {
            ...target,
            id: `sec-${Date.now()}`,
            position: target.position + 1,
          };
          const updated = [...get().draftSections];
          updated.splice(target.position + 1, 0, newSec);
          get().reorderSections(updated);
        },

        deleteSection: (id) => {
          const updated = get().draftSections.filter((s) => s.id !== id);
          get().reorderSections(updated);
        },

        addSectionFromLibrary: (type) => {
          const reg = SECTION_REGISTRY[type];
          if (!reg) return;
          const newSec: CMSSectionItem = {
            id: `sec-${type}-${Date.now().toString().slice(-4)}`,
            type,
            position: get().draftSections.length,
            enabled: true,
            settings: JSON.parse(JSON.stringify(reg.defaultSettings)),
          };
          set({ draftSections: [...get().draftSections, newSec], hasUnsavedChanges: true });
          get().addAuditLog("ADDED_SECTION", "Homepage", newSec.id, { type: reg.name });
        },

        saveDraft: (author = "Admin", notes = "Draft changes saved") => {
          const currentLayout = get().theme.homepageLayout || "ORIGINAL_RAIFAS_MART";
          const newRev: CMSPageRevision = {
            id: `rev-${Date.now()}`,
            pageId: "homepage",
            version: get().revisions.length + 1,
            title: `Draft v${get().revisions.length + 1}`,
            sectionsSnapshot: JSON.parse(JSON.stringify(get().draftSections)),
            themeLayout: currentLayout,
            themeSnapshot: JSON.parse(JSON.stringify(get().theme)),
            isPublished: false,
            createdBy: author,
            notes,
            createdAt: new Date().toISOString(),
          };
          set({
            revisions: [newRev, ...get().revisions],
            hasUnsavedChanges: false,
          });
          get().addAuditLog("SAVED_DRAFT", "Homepage", newRev.id);
        },

        publishDraft: (author = "Admin", notes = "Live release published") => {
          triggerSoftAction("Publishing changes live to storefront...", 600);
          const snapshot = JSON.parse(JSON.stringify(get().draftSections));
          const currentLayout = get().theme.homepageLayout || "ORIGINAL_RAIFAS_MART";

          const newRev: CMSPageRevision = {
            id: `rev-${Date.now()}`,
            pageId: "homepage",
            version: get().revisions.length + 1,
            title: `Release v${get().revisions.length + 1}`,
            sectionsSnapshot: snapshot,
            themeLayout: currentLayout,
            themeSnapshot: JSON.parse(JSON.stringify(get().theme)),
            isPublished: true,
            publishedAt: new Date().toISOString(),
            createdBy: author,
            notes,
            createdAt: new Date().toISOString(),
          };

          set({
            publishedSections: snapshot,
            savedThemeLayouts: {
              ...get().savedThemeLayouts,
              [currentLayout]: snapshot,
            },
            revisions: [newRev, ...get().revisions],
            hasUnsavedChanges: false,
          });

          syncToServer("cms", {
            draftSections: snapshot,
            publishedSections: snapshot,
            theme: get().theme,
          });
          get().addAuditLog("PUBLISHED_PAGE", "Homepage", newRev.id);
        },

        rollbackToRevision: (revisionId, author = "Admin") => {
          triggerSoftAction("Restoring revision...", 500);
          const targetRev = get().revisions.find((r) => r.id === revisionId);
          if (!targetRev) return;

          const snapshot = JSON.parse(JSON.stringify(targetRev.sectionsSnapshot));
          const targetHeroSec = snapshot.find((s: any) => s.type === "hero-slider");
          const targetSlides = targetHeroSec?.settings?.slides || get().globalHeroSlides || [];

          const restoredTheme = targetRev.themeSnapshot
            ? { ...targetRev.themeSnapshot }
            : targetRev.themeLayout
            ? { ...get().theme, homepageLayout: targetRev.themeLayout }
            : get().theme;

          const layoutId = restoredTheme.homepageLayout || "ORIGINAL_RAIFAS_MART";

          set({
            theme: restoredTheme,
            draftSections: snapshot,
            publishedSections: snapshot,
            globalHeroSlides: targetSlides,
            savedThemeLayouts: {
              ...get().savedThemeLayouts,
              [layoutId]: snapshot,
            },
            hasUnsavedChanges: false,
          });

          syncToServer("cms", {
            draftSections: snapshot,
            publishedSections: snapshot,
            theme: restoredTheme,
          });

          get().addAuditLog("ROLLBACK_REVISION", "Homepage", revisionId, {
            targetVersion: targetRev.version,
            layout: layoutId,
          });
        },

        updateTheme: (newTheme, author = "Admin") => {
          triggerSoftAction("Applying theme styling across store...", 400);
          const updated = { ...get().theme, ...newTheme };
          set({ theme: updated });
          syncToServer("cms", {
            draftSections: get().draftSections,
            publishedSections: get().publishedSections,
            theme: updated,
          });
          get().addAuditLog("UPDATED_THEME", "ThemeSettings", undefined, newTheme);
        },

        // Lossless theme layout switcher with automatic per-theme memory & banner preservation
        switchThemeLayout: (newLayoutId, author = "Admin") => {
          triggerSoftAction(`Activating ${newLayoutId} theme layout...`, 500);

          const currentLayout = get().theme.homepageLayout || "ORIGINAL_RAIFAS_MART";
          const currentPublished = get().publishedSections || [];

          // 1. Extract current hero banner slides to preserve globally
          const currentHeroSec = currentPublished.find((s) => s.type === "hero-slider");
          const activeSlides = currentHeroSec?.settings?.slides?.length
            ? currentHeroSec.settings.slides
            : get().globalHeroSlides || [];

          // 2. Save current layout's sections into savedThemeLayouts
          const updatedSavedLayouts: Partial<Record<HomepageThemeLayout, CMSSectionItem[]>> = {
            ...get().savedThemeLayouts,
            [currentLayout]: JSON.parse(JSON.stringify(currentPublished)),
          };

          // 3. Create an auto-save snapshot in revisions for instant rollback
          const autoRev: CMSPageRevision = {
            id: `rev-theme-switch-${Date.now()}`,
            pageId: "homepage",
            version: get().revisions.length + 1,
            title: `Auto-Save: ${currentLayout} (before activating ${newLayoutId})`,
            sectionsSnapshot: JSON.parse(JSON.stringify(currentPublished)),
            themeLayout: currentLayout,
            themeSnapshot: JSON.parse(JSON.stringify(get().theme)),
            isPublished: true,
            publishedAt: new Date().toISOString(),
            createdBy: author,
            notes: `Auto-saved sections and banners before switching to ${newLayoutId}`,
            createdAt: new Date().toISOString(),
          };

          // 4. Retrieve or initialize target theme layout sections
          let targetSections: CMSSectionItem[];
          if (updatedSavedLayouts[newLayoutId] && updatedSavedLayouts[newLayoutId]!.length > 0) {
            targetSections = JSON.parse(JSON.stringify(updatedSavedLayouts[newLayoutId]));
          } else {
            const presetSections = THEME_PRESET_SECTIONS[newLayoutId] || DEFAULT_HOMEPAGE_SECTIONS;
            targetSections = JSON.parse(JSON.stringify(presetSections));
          }

          // 5. Ensure user's custom hero banners are preserved if target theme uses hero-slider
          if (activeSlides.length > 0) {
            targetSections = targetSections.map((s) => {
              if (s.type === "hero-slider") {
                return {
                  ...s,
                  settings: {
                    ...s.settings,
                    slides: activeSlides,
                  },
                };
              }
              return s;
            });
          }

          updatedSavedLayouts[newLayoutId] = targetSections;
          const updatedTheme = { ...get().theme, homepageLayout: newLayoutId };

          // 6. Update state & sync to persistent store
          set({
            theme: updatedTheme,
            draftSections: targetSections,
            publishedSections: targetSections,
            savedThemeLayouts: updatedSavedLayouts,
            globalHeroSlides: activeSlides,
            revisions: [autoRev, ...get().revisions],
            hasUnsavedChanges: false,
          });

          syncToServer("cms", {
            draftSections: targetSections,
            publishedSections: targetSections,
            theme: updatedTheme,
          });

          get().addAuditLog("SWITCHED_THEME_LAYOUT", "HomepageTheme", newLayoutId, {
            from: currentLayout,
            to: newLayoutId,
          });
        },

        setActiveDevice: (device) => set({ activeDevice: device }),

        addAuditLog: (action, entity, entityId, metadata) => {
          const newLog: CMSAuditLog = {
            id: `log-${Date.now()}`,
            userName: "Admin",
            action,
            entity,
            entityId,
            metadata,
            timestamp: new Date().toISOString(),
          };
          set({ auditLogs: [newLog, ...get().auditLogs.slice(0, 49)] });
        },
      };
    },
    {
      name: "raifas_mart_cms_engine_v5",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
