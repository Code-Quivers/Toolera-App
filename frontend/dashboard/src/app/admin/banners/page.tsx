"use client";

import React, { useState, useEffect } from "react";
import { useCmsStore } from "@/lib/cms/useCmsStore";
import { mockBannerSlides } from "@/data/mockBanners";
import { HeroBannerSlide } from "@/types/banners";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { triggerSoftAction } from "@/store/useSoftLoadingStore";
import {
  Sliders,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Check,
  X,
  Sparkles,
  Save,
  ExternalLink,
  ImageIcon,
  Link2,
  Type,
} from "lucide-react";

export default function AdminBannersPage() {
  const { draftSections, updateHeroSlides } = useCmsStore();
  const heroSection = draftSections.find((s) => s.type === "hero-slider");

  // Hero Banner Slides
  const [slides, setSlides] = useState<HeroBannerSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<HeroBannerSlide | null>(null);
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Sync with CMS Store on mount
  useEffect(() => {
    if (heroSection?.settings?.slides) {
      setSlides(heroSection.settings.slides);
    } else {
      setSlides([]);
    }
  }, [heroSection]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Helper to persist slides to CMS store and publish live immediately
  const saveAndPublishHeroSlides = (updatedSlides: HeroBannerSlide[], actionMsg: string) => {
    setSlides(updatedSlides);
    updateHeroSlides(updatedSlides);
    triggerSoftAction(actionMsg, 400);
    showNotification(actionMsg);
  };

  const handleSaveHeroSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    if (!editingSlide.image.trim()) {
      alert("Please upload or provide a banner picture.");
      return;
    }

    const isImageOnly = editingSlide.slideType === "image-only";

    const cleanedSlide: HeroBannerSlide = {
      ...editingSlide,
      slideType: isImageOnly ? "image-only" : "editorial",
      title: isImageOnly ? "" : editingSlide.title?.trim() || "",
      subtitle: isImageOnly ? "" : editingSlide.subtitle?.trim() || "",
      description: isImageOnly ? "" : editingSlide.description?.trim() || "",
      buttonText: isImageOnly ? "" : editingSlide.buttonText?.trim() || "Shop Now",
      buttonLink: editingSlide.buttonLink?.trim() || "/shop",
      badge: isImageOnly ? "" : editingSlide.badge?.trim() || "",
      tagline: isImageOnly ? "" : editingSlide.tagline?.trim() || "",
    };

    const exists = slides.some((s) => s.id === cleanedSlide.id);
    let updated: HeroBannerSlide[];

    if (exists) {
      updated = slides.map((s) => (s.id === cleanedSlide.id ? cleanedSlide : s));
      saveAndPublishHeroSlides(updated, "Banner slide updated and published live!");
    } else {
      updated = [...slides, cleanedSlide];
      saveAndPublishHeroSlides(updated, "New banner slide published live!");
    }

    setEditingSlide(null);
    setIsHeroModalOpen(false);
  };

  const handleDeleteHeroSlide = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this banner slide?")) {
      const updated = slides.filter((s) => s.id !== id);
      saveAndPublishHeroSlides(updated, "Banner slide permanently deleted.");
    }
  };

  const handleClearAllBanners = () => {
    if (confirm("Are you sure you want to permanently delete all banner slides?")) {
      saveAndPublishHeroSlides([], "All banner slides permanently cleared.");
      try {
        localStorage.removeItem("toolera_cms_engine_v3");
        localStorage.removeItem("toolera_cms_engine_v2");
        localStorage.removeItem("toolera_cms_engine");
      } catch {}
    }
  };

  const handleMoveHeroSlide = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const updated = [...slides];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    saveAndPublishHeroSlides(updated, "Banner slide order updated.");
  };

  const handleToggleActiveHeroSlide = (id: string) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    saveAndPublishHeroSlides(updated, "Slide visibility updated.");
  };

  const handleOpenAddHeroModal = (mode: "image-only" | "editorial" = "image-only") => {
    setEditingSlide({
      id: `slide-${Date.now()}`,
      slideType: mode,
      title: "",
      subtitle: "",
      tagline: "",
      description: "",
      buttonText: "",
      buttonLink: "/shop?filter=trending",
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=1600&h=514&q=85",
      badge: "",
      active: true,
    });
    setIsHeroModalOpen(true);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Sliders className="w-7 h-7 text-[#008B47]" />
            <span>1600×514 Hero Banner Slider Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Upload and manage your homepage slider slides — add full-bleed clickable pictures (image + link only) or editorial slides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {slides.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllBanners}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition border border-rose-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Banners</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenAddHeroModal("image-only")}
            className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold text-xs rounded-xl flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Banner Slide</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-[#008B47] shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Hero Slides List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm text-slate-900">
              Active Hero Slider Slides ({slides.length})
            </span>
            <span className="text-xs text-slate-400">
              • Recommended dimensions: 1600 × 514 px
            </span>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
            Exact Ratio: 1600 × 514 px Boxed Banner
          </span>
        </div>

        {slides.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#008B47] mx-auto flex items-center justify-center">
              <ImageIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900">No Banners Configured</h3>
              <p className="text-xs text-slate-500">
                All mock banners have been cleared. Upload your fresh banners (1600 × 514 px) to showcase them on the homepage.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleOpenAddHeroModal("image-only")}
                className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white font-bold rounded-xl text-xs transition flex items-center gap-2 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Upload 1600×514 Banner</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
          {slides.map((slide, index) => {
            const isImageOnly =
              slide.slideType === "image-only" ||
              (!slide.title?.trim() && !slide.subtitle?.trim());

            return (
              <div
                key={slide.id}
                className={`rounded-3xl border-2 p-5 sm:p-6 bg-white shadow-xs transition-all flex flex-col lg:flex-row gap-6 items-center justify-between ${
                  slide.active === false
                    ? "border-slate-200 opacity-60 bg-slate-50"
                    : "border-slate-200/90 hover:border-emerald-500/80 hover:shadow-md"
                }`}
              >
                {/* Left: 1600x514 Banner Aspect Preview */}
                <div className="w-full lg:w-[480px] shrink-0 relative aspect-[1600/514] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md group">
                  <img
                    src={slide.image}
                    alt={slide.title || "Hero Banner"}
                    className="w-full h-full object-fill sm:object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {isImageOnly ? (
                    // Clean Graphic Preview with Link Tag
                    <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-sm">
                      <Link2 className="w-3 h-3 text-[#F9A01B]" />
                      <span className="truncate max-w-[220px]">{slide.buttonLink || "/shop"}</span>
                    </div>
                  ) : (
                    // Editorial Preview with overlay
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex flex-col justify-end p-4 text-white">
                      {slide.badge && (
                        <span className="self-start text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#008B47] text-white shadow-xs mb-1">
                          {slide.badge}
                        </span>
                      )}
                      <h4 className="font-black text-sm text-white line-clamp-1">{slide.title}</h4>
                      <p className="text-[11px] text-slate-300 line-clamp-1">{slide.subtitle}</p>
                    </div>
                  )}
                </div>

                {/* Center: Slide Details */}
                <div className="flex-1 w-full space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[11px] px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      Slide #{index + 1}
                    </span>
                    {isImageOnly ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-[#F9A01B]" />
                        <span>Pure Picture &amp; Link Only (Full Image, No Text)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-bold text-[10px] flex items-center gap-1">
                        <Type className="w-3 h-3 text-teal-600" />
                        <span>Picture with Headings &amp; Button</span>
                      </span>
                    )}

                    {slide.active === false ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 font-bold text-[10px]">
                        Hidden
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                        Active on Slider
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      {slide.title || "Pure Picture Banner (Full Graphic)"}
                    </h3>
                    {slide.subtitle && (
                      <div className="text-slate-500 font-medium">{slide.subtitle}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-600 pt-1">
                    <span className="font-bold text-slate-400">Click URL:</span>
                    <a
                      href={slide.buttonLink || "/shop"}
                      target="_blank"
                      rel="noreferrer"
                      className="text-teal-600 hover:underline font-mono truncate max-w-xs flex items-center gap-1"
                    >
                      <span>{slide.buttonLink || "/shop"}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex lg:flex-col items-center gap-2 shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveHeroSlide(index, "up")}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
                      title="Move Slide Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === slides.length - 1}
                      onClick={() => handleMoveHeroSlide(index, "down")}
                      className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent transition"
                      title="Move Slide Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingSlide({
                        ...slide,
                        slideType: isImageOnly ? "image-only" : "editorial",
                      });
                      setIsHeroModalOpen(true);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-[#008B47] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Slide</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActiveHeroSlide(slide.id)}
                    className={`p-2 rounded-xl text-xs font-bold border transition ${
                      slide.active === false
                        ? "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                    }`}
                    title={slide.active === false ? "Enable Slide" : "Hide Slide"}
                  >
                    {slide.active === false ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteHeroSlide(slide.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* EDIT / CREATE HERO SLIDE MODAL                                 */}
      {/* ============================================================== */}
      {isHeroModalOpen && editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <Sliders className="w-5 h-5 text-[#008B47]" />
                <div>
                  <h3 className="font-black text-base text-slate-900">
                    {slides.some((s) => s.id === editingSlide.id)
                      ? "Edit 1600×514 Banner Slide"
                      : "Create New 1600×514 Banner Slide"}
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">ID: {editingSlide.id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingSlide(null);
                  setIsHeroModalOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHeroSlide} className="overflow-y-auto flex-1 p-6 space-y-5 text-xs">
              {/* Slide Format Switcher */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="font-extrabold text-slate-800 text-xs block">
                  Choose Slide Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingSlide({
                        ...editingSlide,
                        slideType: "image-only",
                      })
                    }
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      editingSlide.slideType === "image-only"
                        ? "bg-[#008B47] text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Pure Picture &amp; Link Only (No Forced Text)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingSlide({
                        ...editingSlide,
                        slideType: "editorial",
                        title: editingSlide.title || "NEW COLLECTION PROMOTION",
                        buttonText: editingSlide.buttonText || "Shop Now",
                      })
                    }
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                      editingSlide.slideType === "editorial"
                        ? "bg-[#008B47] text-white shadow-xs"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    <span>Picture with Headings &amp; Button</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {editingSlide.slideType === "image-only"
                    ? "✨ Your full 1600×514px banner picture will be displayed edge-to-edge with NO background gradient overlay, and clicking anywhere will open your link."
                    : "✨ Shows custom headline text, subtitle, badge, and CTA buttons rendered over the picture."}
                </p>
              </div>

              {/* Destination Click Link (Applies to both modes) */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-[#008B47]" />
                  <span>Click Destination Link URL *</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingSlide.buttonLink || "/shop"}
                  onChange={(e) =>
                    setEditingSlide({ ...editingSlide, buttonLink: e.target.value })
                  }
                  placeholder="e.g. /shop?filter=trending or /category/desk-setup"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
                <p className="text-[11px] text-slate-400">
                  When a customer clicks this banner slide on the storefront, it navigates to this URL.
                </p>
              </div>

              {/* Editorial Fields (Only shown if mode is editorial) */}
              {editingSlide.slideType === "editorial" && (
                <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Headline Title</label>
                      <input
                        type="text"
                        value={editingSlide.title || ""}
                        onChange={(e) =>
                          setEditingSlide({ ...editingSlide, title: e.target.value })
                        }
                        placeholder="e.g. INNOVATIVE GADGETS"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-[#008B47]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Subtitle / Tagline</label>
                      <input
                        type="text"
                        value={editingSlide.subtitle || ""}
                        onChange={(e) =>
                          setEditingSlide({ ...editingSlide, subtitle: e.target.value })
                        }
                        placeholder="e.g. DIRECT FROM CHINA"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Promo Badge Label</label>
                      <input
                        type="text"
                        value={editingSlide.badge || ""}
                        onChange={(e) =>
                          setEditingSlide({ ...editingSlide, badge: e.target.value })
                        }
                        placeholder="e.g. 🔥 FLASH SALE • UP TO 40% OFF"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-700">Button Text</label>
                      <input
                        type="text"
                        value={editingSlide.buttonText || "Shop Now"}
                        onChange={(e) =>
                          setEditingSlide({ ...editingSlide, buttonText: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-[#008B47]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 1600x514px Banner Image Uploader */}
              <div className="space-y-2">
                <ImageUploader
                  value={editingSlide.image}
                  onChange={(url) => setEditingSlide({ ...editingSlide, image: url })}
                  label="1600 × 514 px Hero Banner Picture *"
                  recommendedDimensions="1600x514 px Boxed Banner Ratio"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSlide(null);
                    setIsHeroModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md"
                >
                  <Save className="w-4 h-4" />
                  <span>Save &amp; Publish Slide Live</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
