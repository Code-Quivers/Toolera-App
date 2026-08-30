"use client";

import React, { useState } from "react";
import { useCmsStore } from "@/lib/cms/useCmsStore";
import { HomepageThemeLayout } from "@/lib/cms/types";
import {
  Palette,
  CheckCircle2,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  ShoppingBag,
  Heart,
  Flame,
  Type,
  LayoutTemplate,
  Laptop,
  Smartphone,
  Home,
  Sparkle,
  Layers,
  ArrowRight,
  Eye,
  X,
  ZoomIn,
  ExternalLink,
} from "lucide-react";

export default function AdminThemePage() {
  const { theme, updateTheme, switchThemeLayout, revisions, rollbackToRevision } = useCmsStore();
  const [notification, setNotification] = useState<string | null>(null);
  const [previewModalLayout, setPreviewModalLayout] = useState<{
    title: string;
    industry: string;
    image: string;
    id: HomepageThemeLayout;
  } | null>(null);

  const themeLayouts: {
    id: HomepageThemeLayout;
    title: string;
    industry: string;
    badge: string;
    description: string;
    features: string[];
    accentColor: string;
    image: string;
  }[] = [
    {
      id: "ORIGINAL_RAIFAS_MART",
      title: "Raifa's Mart Original (Brand Default)",
      industry: "Viral Gadgets & Multi-Section DTC",
      badge: "Brand Default Layout",
      description: "Original full modular CMS page layout: Hero Carousel ('Discover What's Trending / China Sourced') + Category Stories + Trending Now with Urgency Meters + Today's Spotlight + Flash Countdown + Shop By Need + Customer Reviews + Trust Bar + Newsletter.",
      features: [
        "Hero carousel with China factory-direct promo banners",
        "Trending Now section with real-time stock urgency meters",
        "Today's Find product spotlight with live specs drawer",
        "Customer reviews carousel + 4-point trust badges & newsletter",
      ],
      accentColor: "#059669",
      image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=1200&q=80",
    },
    {
      id: "ELECTRONICS_MARKETPLACE",
      title: "Electronics & Tech Marketplace",
      industry: "Electronics, Gadgets & Computers",
      badge: "WoodMart Mega Style",
      description: "Category Sidebar + Meta Quest 3 Hero Banner + Tech Brand Logos + Multi-tab Bestsellers + Limited Offers Countdown + Gaming Section + Tech Articles.",
      features: [
        "Left category sidebar + central hero banner + hot deal timer card",
        "Brand logos bar (Acer, Samsung, Apple, Asus, Bose)",
        "Bestsellers in Category multi-tab 6-column product grid",
        "AirPods Pro limited offer split banner with real-time countdown",
      ],
      accentColor: "#2563EB",
      image: "/themes/theme-electronics.png",
    },
    {
      id: "MODERN_TECH_GADGETS",
      title: "Modern SaaS Tech & Gadgets",
      industry: "Smart Gadgets & SaaS DTC",
      badge: "Modern Tech Event",
      description: "Apple Shopping Event Hero Bento Grid + Circular Category Avatars + Nothing Phone 1 Spotlight + Full-Width Gradient Promo Banner with Countdown.",
      features: [
        "Apple event hero bento grid with Aurora headset flash deal",
        "Circular category avatars with item counts",
        "Nothing Phone (2) exclusive spotlight section",
        "Full-width gradient event banner with live countdown timer",
      ],
      accentColor: "#4F46E5",
      image: "/themes/theme-modern-tech.png",
    },
    {
      id: "SUPERMARKET_MEGA_STORE",
      title: "Mega Store & Supermarket",
      industry: "Multi-Department Mega Superstore",
      badge: "High-Conversion Multi-Category",
      description: "Samsung Flip6 3-Way Split Hero + Value Props Bar + Urbanears Left Vertical Banner with 2-Row Grid + 3-Card Feature Spotlight (Apple Watch, Armchair, Dyson).",
      features: [
        "3-way hero split with Galaxy Flip6 & AI appliances",
        "Value propositions bar (Free delivery, 24/7 support, genuine warranty)",
        "Left vertical product banner with 8-product grid",
        "3-card feature spotlight (Apple Watch, Armchair, Dyson Hair Dryer)",
      ],
      accentColor: "#E11D48",
      image: "/themes/theme-supermarket.png",
    },
    {
      id: "BEAUTY_COSMETICS",
      title: "Beauty, Cosmetics & Organic Skincare",
      industry: "Cosmetics, Skincare & Beauty",
      badge: "Organic Botanical Elegance",
      description: "Floral Clean Hero + 3-Col Botanical Category Cards + 4-Item Photo Bento Collage + 3-Step Organic Ingredients Process + Instagram Daily Glow Feed.",
      features: [
        "Pastel floral hero banner with certified organic badge",
        "3-column botanical category highlight cards",
        "4-item editorial photo bento collage",
        "3-step organic ingredients formulation story & Instagram feed",
      ],
      accentColor: "#E11D48",
      image: "/themes/theme-beauty.png",
    },
    {
      id: "MINIMALIST_FURNITURE",
      title: "Minimalist Furniture & Interior Decor",
      industry: "Furniture, Interior & Architecture",
      badge: "Minimalist Craftsmanship",
      description: "Brand New Armchairs Mountain Landscape Hero + 3-Chair Category Showcase + Masonry Interior Grid + About Our Factory Dark Story + Furniture Brand Logos.",
      features: [
        "Mountain landscape hero with leather armchair cutout",
        "3-chair minimalist category showcase with subtle shadows",
        "Masonry interior grid with Scandinavian minimal armchairs",
        "About Our Factory dark architectural joinery story with facts",
      ],
      accentColor: "#047857",
      image: "/themes/theme-furniture.png",
    },
    {
      id: "FASHION_LIFESTYLE",
      title: "Fashion & Apparel Boutique",
      industry: "Fashion, Apparel & Luxury",
      badge: "High-Street Editorial",
      description: "New Season Lookbook Hero + Seasonal Collections Bento + Trending Apparel with Women/Men Toggle & Size Swatches + Style Gallery.",
      features: [
        "High-street editorial lookbook hero with seasonal drops",
        "Season collections bento (Streetwear, Outerwear, Accessories)",
        "Trending apparel with Women/Men gender tabs",
        "Quick Add to Cart hover cards with price tags",
      ],
      accentColor: "#0F172A",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80",
    },
  ];

  const presets = [
    {
      name: "Raifa's Mart Official (Brand Default)",
      primary: "#008B47",
      accent: "#F9A01B",
      primaryButtonText: "#FFFFFF",
      accentButtonText: "#0F172A",
    },
    {
      name: "Electric Cyan",
      primary: "#0891B2",
      accent: "#F43F5E",
      primaryButtonText: "#FFFFFF",
      accentButtonText: "#FFFFFF",
    },
    {
      name: "Indigo Modern",
      primary: "#4F46E5",
      accent: "#10B981",
      primaryButtonText: "#FFFFFF",
      accentButtonText: "#0F172A",
    },
    {
      name: "Midnight Obsidian",
      primary: "#0F172A",
      accent: "#008B47",
      primaryButtonText: "#FFFFFF",
      accentButtonText: "#FFFFFF",
    },
    {
      name: "Sunset Rose",
      primary: "#E11D48",
      accent: "#F9A01B",
      primaryButtonText: "#FFFFFF",
      accentButtonText: "#0F172A",
    },
    {
      name: "Luxury Amber",
      primary: "#D97706",
      accent: "#008B47",
      primaryButtonText: "#FFFFFF",
      accentButtonText: "#FFFFFF",
    },
  ];

  const handleSelectThemeLayout = (layoutId: HomepageThemeLayout) => {
    switchThemeLayout(layoutId);
    const selected = themeLayouts.find((l) => l.id === layoutId);
    setNotification(`Homepage Layout switched to "${selected?.title}" and Visual Builder sections loaded!`);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleApplyPreset = (preset: typeof presets[0]) => {
    updateTheme({
      primary: preset.primary,
      accent: preset.accent,
      primaryButtonText: preset.primaryButtonText,
      accentButtonText: preset.accentButtonText,
    });
    setNotification(`${preset.name} applied in real time!`);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("Theme & Homepage Layout settings saved and live across the store!");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReset = () => {
    if (confirm("Reset theme styling to brand defaults?")) {
      updateTheme({
        homepageLayout: "ORIGINAL_RAIFAS_MART",
        primary: "#008B47",
        accent: "#F9A01B",
        primaryButtonText: "#FFFFFF",
        accentButtonText: "#0F172A",
        radius: "1rem",
        bodyFont: "Inter, sans-serif",
      });
      setNotification("Theme reset to brand defaults (#008B47 Emerald Green & #F9A01B Sun Amber)!");
      setTimeout(() => setNotification(null), 2500);
    }
  };

  const activeLayout = theme.homepageLayout || "ORIGINAL_RAIFAS_MART";

  return (
    <div className="space-y-8 w-full pb-16">
      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <LayoutTemplate className="w-7 h-7 text-emerald-600" />
            <span>Storefront Themes &amp; Homepage Layouts</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Switch between the Original Brand Design and 6 industry-tailored homepage designs in 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 0. HOMEPAGE THEME LAYOUT SELECTOR (Select 1 of 7)              */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Homepage Theme Layouts (Select 1 of 7)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an industry template to transform the entire storefront homepage layout instantly, or click preview to inspect full screenshots.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Active Theme:</span>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs">
              {themeLayouts.find((l) => l.id === activeLayout)?.title || "Raifa's Mart Original"}
            </span>
          </div>
        </div>

        {/* 7 Theme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themeLayouts.map((opt) => {
            const isSelected = activeLayout === opt.id;
            return (
              <div
                key={opt.id}
                className={`rounded-3xl border-2 p-5 flex flex-col justify-between space-y-4 transition-all duration-200 relative ${
                  isSelected
                    ? "border-emerald-600 bg-emerald-50/30 shadow-lg ring-4 ring-emerald-500/10"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                }`}
              >
                {/* Active Tag */}
                {isSelected && (
                  <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase shadow-xs flex items-center gap-1 z-10">
                    <Check className="w-3 h-3" />
                    <span>Active Theme</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Visual Preview Screenshot Thumbnail with Lightbox Trigger */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                    <img
                      src={opt.image}
                      alt={opt.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewModalLayout(opt);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-white/95 text-slate-900 font-black text-xs shadow-lg hover:bg-white flex items-center gap-1.5 transform hover:scale-105 transition"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
                        <span>View Full Screenshot</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                      {opt.badge}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">{opt.industry}</span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {opt.features.map((feat, fIdx) => (
                      <div key={fIdx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Buttons: Full View + Apply Button */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewModalLayout(opt)}
                    className="sm:col-span-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center justify-center gap-1"
                    title="View Full Screenshot"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectThemeLayout(opt.id)}
                    className={`sm:col-span-8 py-2.5 rounded-2xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-950 hover:bg-emerald-600 text-white"
                    }`}
                  >
                    <span>{isSelected ? "Active (Live)" : "Apply This Theme"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* LIGHTBOX FULL SCREENSHOT MODAL                                 */}
      {/* ============================================================== */}
      {previewModalLayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <LayoutTemplate className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {previewModalLayout.title}
                  </h3>
                  <p className="text-xs text-slate-500">{previewModalLayout.industry}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectThemeLayout(previewModalLayout.id);
                    setPreviewModalLayout(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>Apply This Layout</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalLayout(null)}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                  title="Close preview"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Image Body */}
            <div className="overflow-y-auto flex-1 p-6 bg-slate-100/60 flex justify-center">
              <div className="max-w-3xl w-full bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                <img
                  src={previewModalLayout.image}
                  alt={previewModalLayout.title}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. THEME HISTORY & 1-CLICK ROLLBACK                            */}
      {/* ============================================================== */}
      {revisions && revisions.length > 0 && (
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <span>Theme State History &amp; 1-Click Rollback</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Every time you customize a theme or switch layouts, your banners, sections, and styling are automatically saved. Roll back to any point with 1 click.
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-lg">
              {revisions.length} saved snapshots
            </span>
          </div>

          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
            {revisions.slice(0, 8).map((rev) => {
              const slideCount = rev.sectionsSnapshot?.find((s) => s.type === "hero-slider")?.settings?.slides?.length || 0;
              const isCurrent = rev.themeLayout === activeLayout;

              return (
                <div key={rev.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-900 flex items-center gap-2">
                      <span className="truncate">{rev.title}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[9px]">
                          Active Now
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{new Date(rev.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      <span>•</span>
                      <span>{rev.sectionsSnapshot?.length || 0} sections</span>
                      {slideCount > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{slideCount} hero banner{slideCount > 1 ? "s" : ""}</span>
                        </>
                      )}
                      {rev.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-500 truncate max-w-[200px]">{rev.notes}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      rollbackToRevision(rev.id);
                      setNotification(`Rolled back to "${rev.title}"! All previous sections and banners restored.`);
                      setTimeout(() => setNotification(null), 3500);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs transition shrink-0 flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. ONE-CLICK BRAND COLOR PRESETS                               */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>One-Click Brand Palettes</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition text-left flex items-center justify-between group bg-slate-50/50 hover:bg-white"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-1.5">
                  <div
                    style={{ backgroundColor: p.primary }}
                    className="w-6 h-6 rounded-full border-2 border-white shadow-xs"
                  />
                  <div
                    style={{ backgroundColor: p.accent }}
                    className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                  />
                </div>
                <span className="font-bold text-xs text-slate-800 group-hover:text-emerald-700">
                  {p.name}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-emerald-600">
                Apply →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Color Controls & Live Interactive Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Color Inputs */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-600" />
              <span>Brand Colors &amp; Button Text Colors</span>
            </h3>

            <div className="space-y-4">
              {/* Primary Color */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div>
                  <div className="font-bold text-xs text-slate-900">Primary Brand Color</div>
                  <div className="text-[11px] text-slate-400">Buttons, Badges, Brand Highlights</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primary}
                    onChange={(e) => updateTheme({ primary: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.primary}
                    onChange={(e) => updateTheme({ primary: e.target.value })}
                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Primary Button Text Color */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div>
                  <div className="font-bold text-xs text-slate-900">Primary Button Text Color</div>
                  <div className="text-[11px] text-slate-400">Controls text color inside Primary buttons</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.primaryButtonText || "#FFFFFF"}
                    onChange={(e) => updateTheme({ primaryButtonText: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.primaryButtonText || "#FFFFFF"}
                    onChange={(e) => updateTheme({ primaryButtonText: e.target.value })}
                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Accent Color */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
                <div>
                  <div className="font-bold text-xs text-slate-900">Secondary Accent Color</div>
                  <div className="text-[11px] text-slate-400">Flash Deals, Urgency Badges, Stars</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={theme.accent}
                    onChange={(e) => updateTheme({ accent: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={theme.accent}
                    onChange={(e) => updateTheme({ accent: e.target.value })}
                    className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Typography & Geometry */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-600" />
              <span>Corner Radius &amp; Fonts</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Border Radius (Curves)</label>
                <select
                  value={theme.radius}
                  onChange={(e) => updateTheme({ radius: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="0.25rem">Sharp (4px)</option>
                  <option value="0.5rem">Subtle Rounded (8px)</option>
                  <option value="1rem">Modern Curve (16px - Default)</option>
                  <option value="1.5rem">Pill Smooth (24px)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Store Typography Font</label>
                <select
                  value={theme.bodyFont}
                  onChange={(e) => updateTheme({ bodyFont: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                >
                  <option value="Inter, sans-serif">Inter (Modern Clean)</option>
                  <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Tech / SaaS)</option>
                  <option value="'Outfit', sans-serif">Outfit (Trendy DTC)</option>
                  <option value="system-ui, sans-serif">System Default</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Showcase Card */}
        <div className="lg:col-span-6 sticky top-6 space-y-4">
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-950 text-white shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div
                  style={{ backgroundColor: theme.primary }}
                  className="w-3.5 h-3.5 rounded-full shadow-xs"
                />
                <span className="font-bold text-xs">Live Theme Preview</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-mono">
                {theme.primary} • {theme.accent}
              </span>
            </div>

            {/* Live Product Card Mockup */}
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-4">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80"
                  alt="Magnetic Lamp"
                  className="w-full h-full object-cover"
                />
                <span
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.accentButtonText || "#0F172A",
                  }}
                  className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full font-black text-[10px] flex items-center gap-1 shadow-xs"
                >
                  <Flame className="w-3 h-3" />
                  <span>35% OFF</span>
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-slate-400 text-[10px] font-bold uppercase">Viral Gadget</div>
                <div className="font-extrabold text-sm text-white">Magnetic Levitation Lamp</div>
                <div className="flex items-baseline gap-2">
                  <span
                    style={{ color: theme.primary }}
                    className="text-base font-black"
                  >
                    ৳2,450
                  </span>
                  <span className="text-xs text-slate-500 line-through">৳3,800</span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                style={{
                  backgroundColor: theme.primary,
                  color: theme.primaryButtonText || "#FFFFFF",
                  borderRadius: theme.radius,
                }}
                className="w-full py-3 font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 hover:opacity-90 active:scale-98"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop Trending Deals →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
