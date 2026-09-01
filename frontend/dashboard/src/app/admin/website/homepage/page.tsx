"use client";

import React, { useState } from "react";
import { useCmsStore } from "@/lib/cms/useCmsStore";
import { SECTION_REGISTRY } from "@/lib/cms/sectionRegistry";
import { SectionCategory, CMSSectionItem } from "@/lib/cms/types";
import { SectionRenderer } from "@/components/cms/SectionRenderer";
import { useCategoryStore } from "@/store/useCategoryStore";
import { getAdminUser } from "@/lib/auth";
import { SectionConfigPanel } from "@/components/cms/SectionConfigPanel";
import {
  GripVertical, Plus, Eye, EyeOff, Copy, Trash2, Settings,
  CheckCircle2, History, Monitor, Tablet, Smartphone, X, RotateCcw,
  LayoutGrid, Check, Sliders, Flame, Sparkles, Zap, Award,
  Heart, ShieldCheck, Mail, Tag, HelpCircle, Clock,
} from "lucide-react";

export default function AdminHomepageBuilderPage() {
  const {
    draftSections,
    revisions,
    hasUnsavedChanges,
    activeDevice,
    isSaving,
    isPublishing,
    reorderSections,
    toggleSectionVisibility,
    duplicateSection,
    deleteSection,
    addSectionFromLibrary,
    updateSectionSettings,
    saveDraft,
    publishDraft,
    rollbackToRevision,
    setActiveDevice,
  } = useCmsStore();

  const { categories } = useCategoryStore();
  const authorName = getAdminUser()?.name || "Admin";

  // Modals & Panels State
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CMSSectionItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SectionCategory | "ALL">("ALL");
  const [notification, setNotification] = useState<{ msg: string; ok: boolean } | null>(null);
  const [deletingSection, setDeletingSection] = useState<CMSSectionItem | null>(null);

  // Drag and Drop State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const showNotification = (msg: string, ok = true) => {
    setNotification({ msg, ok });
    setTimeout(() => setNotification(null), 3500);
  };

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIdx !== index) {
      setDragOverIdx(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIndex) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const items = [...draftSections];
    const [draggedItem] = items.splice(draggedIdx, 1);
    items.splice(targetIndex, 0, draggedItem);
    reorderSections(items);

    setDraggedIdx(null);
    setDragOverIdx(null);
    showNotification("Section order updated via drag & drop!");
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft(authorName, "Saved from Visual Homepage Builder");
      showNotification("Draft saved to revisions snapshot!");
    } catch {
      showNotification("Failed to save draft. Please try again.", false);
    }
  };

  const handlePublish = async () => {
    try {
      await publishDraft(authorName, "Published latest homepage sections");
      showNotification("Homepage published live to customer storefront!");
    } catch {
      showNotification("Failed to publish. Please try again.", false);
    }
  };

  const handleRollback = async (revId: string) => {
    try {
      await rollbackToRevision(revId, authorName);
      setRevisionsOpen(false);
      showNotification("Restored previous revision snapshot!");
    } catch {
      showNotification("Failed to restore revision. Please try again.", false);
    }
  };

  const handleDeleteSection = (section: CMSSectionItem) => {
    setDeletingSection(section);
  };

  const confirmDeleteSection = () => {
    if (!deletingSection) return;
    deleteSection(deletingSection.id);
    setDeletingSection(null);
    showNotification("Section removed from draft.");
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Sliders": return Sliders;
      case "Flame": return Flame;
      case "LayoutGrid": return LayoutGrid;
      case "Sparkles": return Sparkles;
      case "Zap": return Zap;
      case "Award": return Award;
      case "Heart": return Heart;
      case "ShieldCheck": return ShieldCheck;
      case "Mail": return Mail;
      case "Tag": return Tag;
      case "HelpCircle": return HelpCircle;
      case "Clock": return Clock;
      default: return LayoutGrid;
    }
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header with Status & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Homepage Visual Builder
            </h1>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                hasUnsavedChanges
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}
            >
              {hasUnsavedChanges ? "● Unsaved Draft" : "● Published"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Drag to reorder, configure settings, or add sections. Changes reflect directly on the storefront.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setRevisionsOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-emerald-600" />
            <span>Revisions ({revisions.length})</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving || isPublishing}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs flex items-center gap-1.5"
          >
            {isSaving ? (
              <svg className="animate-spin w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : null}
            {isSaving ? "Saving…" : "Save Draft"}
          </button>

          <button
            onClick={() => setPreviewOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Instant Preview</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isSaving || isPublishing}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition transform active:scale-95"
          >
            {isPublishing ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isPublishing ? "Publishing…" : "Publish Live"}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs ${
          notification.ok
            ? "bg-emerald-50 border-emerald-200 text-emerald-900"
            : "bg-rose-50 border-rose-200 text-rose-900"
        }`}>
          <CheckCircle2 className={`w-4 h-4 ${notification.ok ? "text-emerald-600" : "text-rose-500"}`} />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Drag & Drop Section List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
          <span>Active Sections ({draftSections.length}) — Drag to Reorder</span>
          <span>Order / Visibility / Actions</span>
        </div>

        {draftSections.map((section, idx) => {
          const reg = SECTION_REGISTRY[section.type];
          const Icon = reg ? getIcon(reg.iconName) : LayoutGrid;
          const isDragging = draggedIdx === idx;
          const isDragOver = dragOverIdx === idx && draggedIdx !== idx;

          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all duration-200 flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing ${
                isDragging
                  ? "opacity-40 scale-[0.99] border-emerald-500 bg-emerald-50/50 shadow-md"
                  : isDragOver
                  ? "border-emerald-500 border-2 bg-emerald-50/20 shadow-lg scale-[1.01]"
                  : section.enabled
                  ? "border-slate-200/80 hover:border-slate-300 shadow-xs"
                  : "border-slate-200/40 opacity-50 bg-slate-50"
              }`}
            >
              {/* Left Info with Drag Handle */}
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Drag Handle Icon */}
                <div
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  title="Drag to reorder section position"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate">
                      {reg?.name || section.type}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {reg?.category || "SECTION"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {section.settings?.title || section.settings?.headline || section.settings?.tagline || reg?.description || "Structured CMS section"}
                  </p>
                </div>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Configure Button */}
                <button
                  type="button"
                  onClick={() => setEditingSection(JSON.parse(JSON.stringify(section)))}
                  className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Settings className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Configure</span>
                </button>

                {/* Hide / Show Toggle */}
                <button
                  onClick={() => toggleSectionVisibility(section.id)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
                  aria-label={section.enabled ? "Hide section" : "Show section"}
                >
                  {section.enabled ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                </button>

                {/* Duplicate */}
                <button
                  onClick={() => duplicateSection(section.id)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
                  aria-label="Duplicate section"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDeleteSection(section)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 transition"
                  aria-label="Delete section"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Section Button */}
      <div className="pt-2">
        <button
          onClick={() => setLibraryOpen(true)}
          className="w-full py-4 rounded-2xl bg-white hover:bg-emerald-50/50 border-2 border-dashed border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-800 font-bold text-sm flex items-center justify-center gap-2 transition shadow-2xs"
        >
          <Plus className="w-5 h-5 text-emerald-600" />
          <span>+ Add Section to Homepage</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. ADD SECTION LIBRARY MODAL */}
      {/* ============================================================== */}
      {libraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-h-[90vh] flex flex-col justify-between overflow-hidden">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900">Add Section Library</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select a section template to insert into your active draft.
                  </p>
                </div>
                <button
                  onClick={() => setLibraryOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex gap-2 py-4 border-b border-slate-100 overflow-x-auto text-xs font-semibold">
                {(["ALL", "FEATURED", "PRODUCTS", "MARKETING", "SOCIAL_PROOF", "CONTENT"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      selectedCategory === cat
                        ? "bg-emerald-600 text-white font-bold"
                        : "bg-slate-100 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {cat.replace("_", " ")}
                  </button>
                ))}
              </div>

              {/* Section Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4 max-h-[50vh] overflow-y-auto pr-1">
                {Object.values(SECTION_REGISTRY)
                  .filter((sec) => selectedCategory === "ALL" || sec.category === selectedCategory)
                  .map((sec) => {
                    const Icon = getIcon(sec.iconName);
                    return (
                      <button
                        key={sec.type}
                        onClick={() => {
                          addSectionFromLibrary(sec.type);
                          setLibraryOpen(false);
                          showNotification(`Added ${sec.name} to homepage draft!`);
                        }}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500 hover:bg-white text-left transition group space-y-2 flex flex-col justify-between shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600 uppercase">
                              {sec.category}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                            {sec.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {sec.description}
                          </p>
                        </div>

                        <div className="pt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1 group-hover:underline">
                          <span>+ Insert Section</span>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setLibraryOpen(false)}
                className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SECTION CONFIGURATION DRAWER */}
      {/* ============================================================== */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Configure: {SECTION_REGISTRY[editingSection.type]?.name || editingSection.type.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">{editingSection.type} · {editingSection.id.slice(0, 12)}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <SectionConfigPanel
                section={editingSection}
                onChange={updated => setEditingSection(updated)}
              />
            </div>

            {/* Footer save bar */}
            <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSectionSettings(editingSection.id, editingSection.settings);
                  setEditingSection(null);
                  showNotification("Section settings updated in draft!");
                }}
                className="flex-[2] py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm"
              >
                Save Settings to Draft
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. INSTANT DEVICE PREVIEW MODAL */}
      {/* ============================================================== */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          {/* Preview Top Control Bar */}
          <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-900 text-sm">Draft Preview Mode</span>
              <span className="text-xs text-slate-400">
                (Rendering in-browser draft snapshot)
              </span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                onClick={() => setActiveDevice("desktop")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeDevice === "desktop" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setActiveDevice("tablet")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeDevice === "tablet" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Tablet className="w-4 h-4" />
                <span className="hidden sm:inline">Tablet</span>
              </button>
              <button
                onClick={() => setActiveDevice("mobile")}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  activeDevice === "mobile" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setPreviewOpen(false)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview Viewport Frame */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
            <div
              className={`transition-all duration-300 bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-300 ${
                activeDevice === "desktop"
                  ? "w-full max-w-7xl"
                  : activeDevice === "tablet"
                  ? "w-[768px]"
                  : "w-[390px]"
              }`}
            >
              <SectionRenderer sections={draftSections} isPreview={true} />
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. DELETE CONFIRMATION DIALOG */}
      {/* ============================================================== */}
      {deletingSection && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Delete this section?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="font-bold text-slate-700">
                    {SECTION_REGISTRY[deletingSection.type]?.name || deletingSection.type}
                  </span>{" "}
                  will be removed from your homepage draft. This action cannot be undone without restoring a revision.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setDeletingSection(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteSection}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. REVISION HISTORY SNAPSHOTS MODAL */}
      {/* ============================================================== */}
      {revisionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <History className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-extrabold text-slate-900">Revision History Snapshots</h2>
                </div>
                <button
                  onClick={() => setRevisionsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-[50vh] overflow-y-auto py-2">
                {revisions.map((rev) => (
                  <div key={rev.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{rev.title}</span>
                        {rev.isPublished && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Currently Published
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Author: {rev.createdBy} • {new Date(rev.createdAt).toLocaleString()}
                      </div>
                      {rev.notes && <div className="text-[11px] text-slate-500 italic mt-0.5">{rev.notes}</div>}
                    </div>

                    {!rev.isPublished && (
                      <button
                        onClick={() => handleRollback(rev.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore Snapshot</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setRevisionsOpen(false)}
                className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
