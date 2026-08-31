"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCmsStore } from "@/lib/cms/useCmsStore";
import { SECTION_REGISTRY } from "@/lib/cms/sectionRegistry";
import { SectionCategory, CMSSectionItem } from "@/lib/cms/types";
import { SectionRenderer } from "@/components/cms/SectionRenderer";
import { useCategoryStore } from "@/store/useCategoryStore";
import {
  GripVertical,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Settings,
  Sparkles,
  CheckCircle2,
  History,
  Monitor,
  Tablet,
  Smartphone,
  X,
  RotateCcw,
  Sliders,
  Flame,
  LayoutGrid,
  Zap,
  Award,
  Heart,
  ShieldCheck,
  Mail,
  Tag,
  HelpCircle,
  Clock,
  ExternalLink,
  Check,
  ArrowRight,
} from "lucide-react";

export default function AdminHomepageBuilderPage() {
  const {
    draftSections,
    revisions,
    hasUnsavedChanges,
    activeDevice,
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

  // Modals & Panels State
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [revisionsOpen, setRevisionsOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<CMSSectionItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SectionCategory | "ALL">("ALL");
  const [notification, setNotification] = useState<string | null>(null);

  // Drag and Drop State
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
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

  const handleSaveDraft = () => {
    saveDraft("Rafiq (Admin)", "Saved from Visual Homepage Builder");
    showNotification("Draft saved to revisions snapshot!");
  };

  const handlePublish = () => {
    publishDraft("Rafiq (Admin)", "Published latest homepage sections");
    showNotification("Homepage published live to customer storefront!");
  };

  const handleRollback = (revId: string) => {
    rollbackToRevision(revId, "Rafiq (Admin)");
    setRevisionsOpen(false);
    showNotification("Restored previous revision snapshot!");
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
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs"
          >
            Save Draft
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
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition transform active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Publish Live</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
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
                  onClick={() => deleteSection(section.id)}
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
      {/* 2. SECTION CONFIGURATION DRAWER / MODAL */}
      {/* ============================================================== */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Configure: {SECTION_REGISTRY[editingSection.type]?.name || editingSection.type}
                  </h3>
                  <span className="text-xs text-emerald-600 font-mono">ID: {editingSection.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Direct Route Links for Specialized Management */}
              {editingSection.type === "hero-slider" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center justify-between">
                    <span>1600×514 Hero Banner Slider</span>
                    <Link
                      href="/admin/banners"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Open Banner Manager</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    Manage individual slide images, titles, and links in the dedicated banner editor.
                  </p>
                </div>
              )}

              {editingSection.type === "category-carousel" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center justify-between">
                    <span>Category Collections</span>
                    <Link
                      href="/admin/categories"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Manage Categories</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    Add, edit, or remove store categories and their thumbnail icons.
                  </p>
                </div>
              )}

              {(editingSection.type === "trending-products" ||
                editingSection.type === "new-arrivals" ||
                editingSection.type === "best-sellers" ||
                editingSection.type === "spotlight") && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center justify-between">
                    <span>Products Catalog</span>
                    <Link
                      href="/admin/products"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Manage Products</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    Configure pricing, stock, badges (Trending, Hot, New), and import products.
                  </p>
                </div>
              )}

              {editingSection.type === "reviews" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center justify-between">
                    <span>Reviews Moderation</span>
                    <Link
                      href="/admin/reviews"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Moderate Reviews</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    Approve or reject customer reviews before they appear on the homepage.
                  </p>
                </div>
              )}

              {editingSection.type === "countdown" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs">
                  <div className="font-bold text-emerald-950 flex items-center justify-between">
                    <span>Coupons &amp; Deals</span>
                    <Link
                      href="/admin/marketing/coupons"
                      className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Manage Coupons</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <p className="text-emerald-800 text-[11px]">
                    Set discount promo codes linked to this countdown flash bar.
                  </p>
                </div>
              )}

              {/* Dynamic Settings Form */}
              <div className="space-y-4 text-xs">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Section Title / Headline</label>
                  <input
                    type="text"
                    value={
                      editingSection.settings?.title ||
                      editingSection.settings?.headline ||
                      editingSection.settings?.heading ||
                      ""
                    }
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        settings: {
                          ...editingSection.settings,
                          title: e.target.value,
                          headline: e.target.value,
                          heading: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. Trending Now"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Subtitle / Tagline */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Subtitle / Tagline</label>
                  <input
                    type="text"
                    value={
                      editingSection.settings?.subtitle ||
                      editingSection.settings?.tagline ||
                      editingSection.settings?.subtext ||
                      editingSection.settings?.description ||
                      ""
                    }
                    onChange={(e) =>
                      setEditingSection({
                        ...editingSection,
                        settings: {
                          ...editingSection.settings,
                          subtitle: e.target.value,
                          tagline: e.target.value,
                          subtext: e.target.value,
                          description: e.target.value,
                        },
                      })
                    }
                    placeholder="Short description displayed under title..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Trust Pillars & Guarantee Cards Editor */}
                {editingSection.type === "trust-pillars" && (
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block">
                        Trust &amp; Guarantee Cards ({(editingSection.settings?.pillars || [
                          { iconName: "Sparkles", title: "Carefully Selected", description: "We don't list everything. We curate only items that solve real problems or spark genuine joy." },
                          { iconName: "ShieldCheck", title: "Quality Checked", description: "Every product is physically inspected for build quality and function before dispatch." },
                          { iconName: "Banknote", title: "Cash on Delivery", description: "Pay conveniently in cash when the delivery person arrives at your doorstep anywhere in Bangladesh." },
                          { iconName: "RotateCcw", title: "Easy 7-Day Returns", description: "Received a damaged or malfunctioning unit? We replace it or refund with zero hassle." },
                        ]).length})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentPillars = editingSection.settings?.pillars || [
                            { iconName: "Sparkles", title: "Carefully Selected", description: "We don't list everything. We curate only items that solve real problems or spark genuine joy." },
                            { iconName: "ShieldCheck", title: "Quality Checked", description: "Every product is physically inspected for build quality and function before dispatch." },
                            { iconName: "Banknote", title: "Cash on Delivery", description: "Pay conveniently in cash when the delivery person arrives at your doorstep anywhere in Bangladesh." },
                            { iconName: "RotateCcw", title: "Easy 7-Day Returns", description: "Received a damaged or malfunctioning unit? We replace it or refund with zero hassle." },
                          ];
                          const newPillar = {
                            iconName: "CheckCircle2",
                            title: "New Guarantee",
                            description: "Explain your benefit or assurance guarantee to shoppers here.",
                          };
                          setEditingSection({
                            ...editingSection,
                            settings: {
                              ...editingSection.settings,
                              pillars: [...currentPillars, newPillar],
                            },
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#008B47] hover:bg-[#007a3e] text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Pillar</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(editingSection.settings?.pillars || [
                        { iconName: "Sparkles", title: "Carefully Selected", description: "We don't list everything. We curate only items that solve real problems or spark genuine joy." },
                        { iconName: "ShieldCheck", title: "Quality Checked", description: "Every product is physically inspected for build quality and function before dispatch." },
                        { iconName: "Banknote", title: "Cash on Delivery", description: "Pay conveniently in cash when the delivery person arrives at your doorstep anywhere in Bangladesh." },
                        { iconName: "RotateCcw", title: "Easy 7-Day Returns", description: "Received a damaged or malfunctioning unit? We replace it or refund with zero hassle." },
                      ]).map((pillar: any, index: number) => {
                        const updatePillar = (field: string, val: string) => {
                          const list = [...(editingSection.settings?.pillars || [
                            { iconName: "Sparkles", title: "Carefully Selected", description: "We don't list everything. We curate only items that solve real problems or spark genuine joy." },
                            { iconName: "ShieldCheck", title: "Quality Checked", description: "Every product is physically inspected for build quality and function before dispatch." },
                            { iconName: "Banknote", title: "Cash on Delivery", description: "Pay conveniently in cash when the delivery person arrives at your doorstep anywhere in Bangladesh." },
                            { iconName: "RotateCcw", title: "Easy 7-Day Returns", description: "Received a damaged or malfunctioning unit? We replace it or refund with zero hassle." },
                          ])];
                          list[index] = { ...list[index], [field]: val };
                          setEditingSection({
                            ...editingSection,
                            settings: { ...editingSection.settings, pillars: list },
                          });
                        };

                        const removePillar = () => {
                          const list = [...(editingSection.settings?.pillars || [
                            { iconName: "Sparkles", title: "Carefully Selected", description: "We don't list everything. We curate only items that solve real problems or spark genuine joy." },
                            { iconName: "ShieldCheck", title: "Quality Checked", description: "Every product is physically inspected for build quality and function before dispatch." },
                            { iconName: "Banknote", title: "Cash on Delivery", description: "Pay conveniently in cash when the delivery person arrives at your doorstep anywhere in Bangladesh." },
                            { iconName: "RotateCcw", title: "Easy 7-Day Returns", description: "Received a damaged or malfunctioning unit? We replace it or refund with zero hassle." },
                          ])];
                          list.splice(index, 1);
                          setEditingSection({
                            ...editingSection,
                            settings: { ...editingSection.settings, pillars: list },
                          });
                        };

                        return (
                          <div key={index} className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-2.5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">
                                  {index + 1}
                                </span>
                                <span>Pillar Card #{index + 1}</span>
                              </span>
                              <button
                                type="button"
                                onClick={removePillar}
                                className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                title="Delete this pillar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-2 space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Card Title</label>
                                <input
                                  type="text"
                                  value={pillar.title || ""}
                                  onChange={(e) => updatePillar("title", e.target.value)}
                                  placeholder="e.g. Quality Checked"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Icon</label>
                                <select
                                  value={pillar.iconName || "Sparkles"}
                                  onChange={(e) => updatePillar("iconName", e.target.value)}
                                  className="w-full px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:border-[#008B47] cursor-pointer"
                                >
                                  <option value="Sparkles">✨ Sparkles</option>
                                  <option value="ShieldCheck">🛡️ ShieldCheck</option>
                                  <option value="Banknote">💵 Banknote / COD</option>
                                  <option value="RotateCcw">🔄 7-Day Return</option>
                                  <option value="Truck">🚚 Fast Truck</option>
                                  <option value="Headphones">🎧 24/7 Support</option>
                                  <option value="PackageCheck">📦 Package Check</option>
                                  <option value="Award">🏆 Award Quality</option>
                                  <option value="HeartHandshake">🤝 Handshake</option>
                                  <option value="CheckCircle2">✅ Verified Check</option>
                                  <option value="Lock">🔒 Secure Lock</option>
                                  <option value="ThumbsUp">👍 Thumbs Up</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Card Description</label>
                              <textarea
                                rows={2}
                                value={pillar.description || ""}
                                onChange={(e) => updatePillar("description", e.target.value)}
                                placeholder="Explain the guarantee or customer benefit..."
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47] resize-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Customer Reviews & Feedback Cards Editor */}
                {editingSection.type === "reviews" && (
                  <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider block">
                        Customer Review Cards ({(editingSection.settings?.customReviews || editingSection.settings?.reviews || [
                          {
                            id: "cr-1",
                            authorName: "Tanvir Ahmed",
                            authorLocation: "Dhanmondi, Dhaka",
                            rating: 5,
                            comment: "Ordered the LED bottle and mini gadget. Delivered in 24 hours via Steadfast in Dhanmondi. Premium packaging and genuine product!",
                            productTitle: "Handmade Decorative Bottle",
                            avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
                          },
                          {
                            id: "cr-2",
                            authorName: "Nusrat Jahan",
                            authorLocation: "Chittagong",
                            rating: 5,
                            comment: "Cash on delivery was super smooth. The item quality matches exactly as shown in photos. Will definitely shop again from Toolera!",
                            productTitle: "Desk Setup & Organizer Accessories",
                            avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                          },
                          {
                            id: "cr-3",
                            authorName: "Mahmud Hasan",
                            authorLocation: "Uttara, Dhaka",
                            rating: 5,
                            comment: "Quality is top notch. The product was physically inspected and came sealed. 100% recommended for authentic lifestyle finds.",
                            productTitle: "Smart Tech & Viral Gadgets",
                            avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
                          },
                          {
                            id: "cr-4",
                            authorName: "Sadia Rahman",
                            authorLocation: "Sylhet",
                            rating: 5,
                            comment: "Very polite customer service on WhatsApp and fast tracking update. Received the order in 2 days in Sylhet. Excellent experience!",
                            productTitle: "Handcraft & Home Decor Collection",
                            avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
                          },
                        ]).length})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const currentList = editingSection.settings?.customReviews || editingSection.settings?.reviews || [
                            {
                              id: "cr-1",
                              authorName: "Tanvir Ahmed",
                              authorLocation: "Dhanmondi, Dhaka",
                              rating: 5,
                              comment: "Ordered the LED bottle and mini gadget. Delivered in 24 hours via Steadfast in Dhanmondi. Premium packaging and genuine product!",
                              productTitle: "Handmade Decorative Bottle",
                              avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
                            },
                            {
                              id: "cr-2",
                              authorName: "Nusrat Jahan",
                              authorLocation: "Chittagong",
                              rating: 5,
                              comment: "Cash on delivery was super smooth. The item quality matches exactly as shown in photos. Will definitely shop again from Toolera!",
                              productTitle: "Desk Setup & Organizer Accessories",
                              avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                            },
                            {
                              id: "cr-3",
                              authorName: "Mahmud Hasan",
                              authorLocation: "Uttara, Dhaka",
                              rating: 5,
                              comment: "Quality is top notch. The product was physically inspected and came sealed. 100% recommended for authentic lifestyle finds.",
                              productTitle: "Smart Tech & Viral Gadgets",
                              avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
                            },
                            {
                              id: "cr-4",
                              authorName: "Sadia Rahman",
                              authorLocation: "Sylhet",
                              rating: 5,
                              comment: "Very polite customer service on WhatsApp and fast tracking update. Received the order in 2 days in Sylhet. Excellent experience!",
                              productTitle: "Handcraft & Home Decor Collection",
                              avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
                            },
                          ];
                          const newReview = {
                            id: `cr-${Date.now()}`,
                            authorName: "Happy Customer",
                            authorLocation: "Dhaka",
                            rating: 5,
                            comment: "Loved the product quality and fast delivery! Highly recommended store.",
                            productTitle: "Trending Store Item",
                            avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
                          };
                          setEditingSection({
                            ...editingSection,
                            settings: {
                              ...editingSection.settings,
                              customReviews: [...currentList, newReview],
                              reviews: [...currentList, newReview],
                            },
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#008B47] hover:bg-[#007a3e] text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Review</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(editingSection.settings?.customReviews || editingSection.settings?.reviews || [
                        {
                          id: "cr-1",
                          authorName: "Tanvir Ahmed",
                          authorLocation: "Dhanmondi, Dhaka",
                          rating: 5,
                          comment: "Ordered the LED bottle and mini gadget. Delivered in 24 hours via Steadfast in Dhanmondi. Premium packaging and genuine product!",
                          productTitle: "Handmade Decorative Bottle",
                          avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
                        },
                        {
                          id: "cr-2",
                          authorName: "Nusrat Jahan",
                          authorLocation: "Chittagong",
                          rating: 5,
                          comment: "Cash on delivery was super smooth. The item quality matches exactly as shown in photos. Will definitely shop again from Toolera!",
                          productTitle: "Desk Setup & Organizer Accessories",
                          avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                        },
                        {
                          id: "cr-3",
                          authorName: "Mahmud Hasan",
                          authorLocation: "Uttara, Dhaka",
                          rating: 5,
                          comment: "Quality is top notch. The product was physically inspected and came sealed. 100% recommended for authentic lifestyle finds.",
                          productTitle: "Smart Tech & Viral Gadgets",
                          avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
                        },
                        {
                          id: "cr-4",
                          authorName: "Sadia Rahman",
                          authorLocation: "Sylhet",
                          rating: 5,
                          comment: "Very polite customer service on WhatsApp and fast tracking update. Received the order in 2 days in Sylhet. Excellent experience!",
                          productTitle: "Handcraft & Home Decor Collection",
                          avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
                        },
                      ]).map((rev: any, rIdx: number) => {
                        const updateRevField = (field: string, val: any) => {
                          const list = [...(editingSection.settings?.customReviews || editingSection.settings?.reviews || [
                            {
                              id: "cr-1",
                              authorName: "Tanvir Ahmed",
                              authorLocation: "Dhanmondi, Dhaka",
                              rating: 5,
                              comment: "Ordered the LED bottle and mini gadget. Delivered in 24 hours via Steadfast in Dhanmondi. Premium packaging and genuine product!",
                              productTitle: "Handmade Decorative Bottle",
                              avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
                            },
                            {
                              id: "cr-2",
                              authorName: "Nusrat Jahan",
                              authorLocation: "Chittagong",
                              rating: 5,
                              comment: "Cash on delivery was super smooth. The item quality matches exactly as shown in photos. Will definitely shop again from Toolera!",
                              productTitle: "Desk Setup & Organizer Accessories",
                              avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                            },
                            {
                              id: "cr-3",
                              authorName: "Mahmud Hasan",
                              authorLocation: "Uttara, Dhaka",
                              rating: 5,
                              comment: "Quality is top notch. The product was physically inspected and came sealed. 100% recommended for authentic lifestyle finds.",
                              productTitle: "Smart Tech & Viral Gadgets",
                              avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
                            },
                            {
                              id: "cr-4",
                              authorName: "Sadia Rahman",
                              authorLocation: "Sylhet",
                              rating: 5,
                              comment: "Very polite customer service on WhatsApp and fast tracking update. Received the order in 2 days in Sylhet. Excellent experience!",
                              productTitle: "Handcraft & Home Decor Collection",
                              avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
                            },
                          ])];
                          list[rIdx] = { ...list[rIdx], [field]: val };
                          setEditingSection({
                            ...editingSection,
                            settings: { ...editingSection.settings, customReviews: list, reviews: list },
                          });
                        };

                        const removeRev = () => {
                          const list = [...(editingSection.settings?.customReviews || editingSection.settings?.reviews || [
                            {
                              id: "cr-1",
                              authorName: "Tanvir Ahmed",
                              authorLocation: "Dhanmondi, Dhaka",
                              rating: 5,
                              comment: "Ordered the LED bottle and mini gadget. Delivered in 24 hours via Steadfast in Dhanmondi. Premium packaging and genuine product!",
                              productTitle: "Handmade Decorative Bottle",
                              avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
                            },
                            {
                              id: "cr-2",
                              authorName: "Nusrat Jahan",
                              authorLocation: "Chittagong",
                              rating: 5,
                              comment: "Cash on delivery was super smooth. The item quality matches exactly as shown in photos. Will definitely shop again from Toolera!",
                              productTitle: "Desk Setup & Organizer Accessories",
                              avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                            },
                            {
                              id: "cr-3",
                              authorName: "Mahmud Hasan",
                              authorLocation: "Uttara, Dhaka",
                              rating: 5,
                              comment: "Quality is top notch. The product was physically inspected and came sealed. 100% recommended for authentic lifestyle finds.",
                              productTitle: "Smart Tech & Viral Gadgets",
                              avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
                            },
                            {
                              id: "cr-4",
                              authorName: "Sadia Rahman",
                              authorLocation: "Sylhet",
                              rating: 5,
                              comment: "Very polite customer service on WhatsApp and fast tracking update. Received the order in 2 days in Sylhet. Excellent experience!",
                              productTitle: "Handcraft & Home Decor Collection",
                              avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
                            },
                          ])];
                          list.splice(rIdx, 1);
                          setEditingSection({
                            ...editingSection,
                            settings: { ...editingSection.settings, customReviews: list, reviews: list },
                          });
                        };

                        return (
                          <div key={rIdx} className="p-3.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-black">
                                  {rIdx + 1}
                                </span>
                                <span>Review Card #{rIdx + 1}</span>
                              </span>
                              <button
                                type="button"
                                onClick={removeRev}
                                className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                title="Delete this review card"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Customer Name</label>
                                <input
                                  type="text"
                                  value={rev.authorName || ""}
                                  onChange={(e) => updateRevField("authorName", e.target.value)}
                                  placeholder="e.g. Tanvir Ahmed"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">City / Location</label>
                                <input
                                  type="text"
                                  value={rev.authorLocation || ""}
                                  onChange={(e) => updateRevField("authorLocation", e.target.value)}
                                  placeholder="e.g. Dhanmondi, Dhaka"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Star Rating</label>
                                <select
                                  value={rev.rating || 5}
                                  onChange={(e) => updateRevField("rating", Number(e.target.value))}
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:border-[#008B47] cursor-pointer"
                                >
                                  <option value={5}>⭐⭐⭐⭐⭐ 5.0 Stars (Excellent)</option>
                                  <option value={4.5}>⭐⭐⭐⭐½ 4.5 Stars</option>
                                  <option value={4}>⭐⭐⭐⭐ 4.0 Stars (Great)</option>
                                  <option value={3}>⭐⭐⭐ 3.0 Stars</option>
                                </select>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Purchased Item Title</label>
                                <input
                                  type="text"
                                  value={rev.productTitle || ""}
                                  onChange={(e) => updateRevField("productTitle", e.target.value)}
                                  placeholder="e.g. Handmade Decorative Bottle"
                                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Customer Review Quote</label>
                              <textarea
                                rows={2}
                                value={rev.comment || ""}
                                onChange={(e) => updateRevField("comment", e.target.value)}
                                placeholder="Customer review testimonial..."
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47] resize-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase">Avatar Photo URL</label>
                              <input
                                type="text"
                                value={rev.avatarUrl || ""}
                                onChange={(e) => updateRevField("avatarUrl", e.target.value)}
                                placeholder="https://..."
                                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-[11px] font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Layout Mode (Carousel vs Grid) */}
                {(editingSection.type === "trending-products" ||
                  editingSection.type === "new-arrivals" ||
                  editingSection.type === "best-sellers" ||
                  editingSection.type === "reviews" ||
                  editingSection.type === "product-carousel" ||
                  editingSection.type === "product-grid") && (
                  <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="font-bold text-slate-800 text-xs block">
                      Display Layout Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingSection({
                            ...editingSection,
                            settings: { ...editingSection.settings, layout: "carousel" },
                          })
                        }
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                          (editingSection.settings?.layout || (editingSection.type === "trending-products" ? "carousel" : "grid")) === "carousel"
                            ? "bg-[#008B47] text-white shadow-xs"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Carousel (Swipeable)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setEditingSection({
                            ...editingSection,
                            settings: { ...editingSection.settings, layout: "grid" },
                          })
                        }
                        className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                          (editingSection.settings?.layout || (editingSection.type === "trending-products" ? "carousel" : "grid")) === "grid"
                            ? "bg-[#008B47] text-white shadow-xs"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Product Grid</span>
                      </button>
                    </div>

                    {/* Grid Columns Option if Grid selected */}
                    {(editingSection.settings?.layout || (editingSection.type === "trending-products" ? "carousel" : "grid")) === "grid" && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-200/80">
                        <label className="font-bold text-slate-700 text-[11px]">
                          Desktop Grid Columns
                        </label>
                        <select
                          value={editingSection.settings?.columnsCount || 4}
                          onChange={(e) =>
                            setEditingSection({
                              ...editingSection,
                              settings: {
                                ...editingSection.settings,
                                columnsCount: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#008B47]"
                        >
                          <option value={2}>2 Columns (Large Cards)</option>
                          <option value={3}>3 Columns (Balanced)</option>
                          <option value={4}>4 Columns (Standard Storefront - Default)</option>
                          <option value={6}>6 Columns (Compact Mega Grid)</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Specific Category Assignment */}
                {(editingSection.type === "trending-products" ||
                  editingSection.type === "new-arrivals" ||
                  editingSection.type === "best-sellers" ||
                  editingSection.type === "category-carousel" ||
                  editingSection.type === "product-carousel" ||
                  editingSection.type === "product-grid") && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">
                      Assign Specific Category
                    </label>
                    <select
                      value={editingSection.settings?.category || "all"}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          settings: { ...editingSection.settings, category: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47] cursor-pointer"
                    >
                      <option value="all">🌐 All Categories (Entire Store Catalog)</option>
                      {categories.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          📁 {cat.name} ({cat.itemCount || 0} items)
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400">
                      Only products belonging to this category will be displayed in this section.
                    </p>
                  </div>
                )}

                {/* Items Limit */}
                {(editingSection.type === "trending-products" ||
                  editingSection.type === "new-arrivals" ||
                  editingSection.type === "best-sellers" ||
                  editingSection.type === "category-carousel" ||
                  editingSection.type === "reviews") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">Display Limit (Number of items)</label>
                      <span className="text-xs font-mono font-bold text-[#008B47]">
                        {editingSection.settings?.limit || 8} items
                      </span>
                    </div>

                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={editingSection.settings?.limit || 8}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          settings: { ...editingSection.settings, limit: Number(e.target.value) },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
                    />

                    {/* Quick Limit Chips */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Presets:</span>
                      {[4, 6, 8, 12, 16, 24].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() =>
                            setEditingSection({
                              ...editingSection,
                              settings: { ...editingSection.settings, limit: num },
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                            (editingSection.settings?.limit || 8) === num
                              ? "bg-[#008B47] text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {num} items
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Source Filter */}
                {(editingSection.type === "trending-products" ||
                  editingSection.type === "new-arrivals" ||
                  editingSection.type === "best-sellers") && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Product Source Filter</label>
                    <select
                      value={
                        editingSection.settings?.source ||
                        (editingSection.type === "new-arrivals"
                          ? "new-arrivals"
                          : editingSection.type === "best-sellers"
                          ? "best-sellers"
                          : "trending")
                      }
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          settings: { ...editingSection.settings, source: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-[#008B47] cursor-pointer"
                    >
                      <option value="trending">🔥 Trending Now</option>
                      <option value="best-sellers">🏆 Best Sellers</option>
                      <option value="new-arrivals">⚡ New Arrivals</option>
                      <option value="sale">🏷️ Flash Deals / On Sale</option>
                      <option value="all">📦 All Products</option>
                    </select>
                  </div>
                )}

                {/* Spotlight specific */}
                {editingSection.type === "spotlight" && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Badge Label</label>
                    <input
                      type="text"
                      value={editingSection.settings?.badgeText || "TODAY'S FIND"}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          settings: { ...editingSection.settings, badgeText: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs"
                    />
                  </div>
                )}

                {/* Countdown / Promo specific */}
                {editingSection.type === "countdown" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Coupon Code</label>
                      <input
                        type="text"
                        value={editingSection.settings?.couponCode || "TRENDY40"}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            settings: { ...editingSection.settings, couponCode: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono uppercase font-bold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Target Hours</label>
                      <input
                        type="number"
                        value={editingSection.settings?.targetHours || 12}
                        onChange={(e) =>
                          setEditingSection({
                            ...editingSection,
                            settings: { ...editingSection.settings, targetHours: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* Banner / Promo image URL */}
                {(editingSection.type === "promo-banner" || editingSection.type === "hero-slider") && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Banner Image URL</label>
                    <input
                      type="url"
                      value={editingSection.settings?.imageUrl || editingSection.settings?.image || ""}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          settings: {
                            ...editingSection.settings,
                            imageUrl: e.target.value,
                            image: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Save Section Settings Button */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  updateSectionSettings(editingSection.id, editingSection.settings);
                  setEditingSection(null);
                  showNotification("Section settings updated in draft!");
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-sm"
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
      {/* 4. REVISION HISTORY SNAPSHOTS MODAL */}
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
