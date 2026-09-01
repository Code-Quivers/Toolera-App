"use client";

import React, { useState } from "react";
import { useHeaderStore, NavbarLayoutType } from "@/store/useHeaderStore";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  Bell,
  CheckCircle2,
  Image as ImageIcon,
  Layout,
  Sliders,
  Phone,
  Monitor,
  Smartphone,
  Check,
  RotateCcw,
  Search,
  Heart,
  ShoppingBag,
  Menu as MenuIcon,
  Share2,
  Globe,
  Sparkles,
  Layers,
  Tag,
  Headphones,
} from "lucide-react";

export default function AdminHeaderPage() {
  const { settings, updateSettings, resetToDefaults } = useHeaderStore();
  const [activeDeviceTab, setActiveDeviceTab] = useState<"desktop" | "mobile">("desktop");
  const [notification, setNotification] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(settings);
      setNotification("Header settings & navbar layout saved to store!");
    } catch {
      setNotification("Failed to save. Please try again.");
    }
    setTimeout(() => setNotification(null), 3000);
  };

  const handleReset = () => {
    if (confirm("Reset all header settings and dimensions to default template?")) {
      resetToDefaults();
      setNotification("Header settings reset to brand defaults.");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (!settings) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">Loading header settings…</div>
  );

  const navbarLayoutOptions: {
    id: NavbarLayoutType;
    title: string;
    tag: string;
    description: string;
    renderWireframe: () => React.ReactNode;
  }[] = [
    {
      id: "WOODMART_MARKETPLACE",
      title: "WoodMart Marketplace",
      tag: "Popular E-Commerce",
      description:
        "Full-width search bar + 24/7 Hotline support + Free shipping badge + Blue/Emerald 'All Categories' pill button & horizontal subnav.",
      renderWireframe: () => (
        <div className="space-y-1.5 p-2 bg-slate-900 rounded-xl border border-slate-700/60">
          <div className="h-1.5 w-full bg-emerald-500/40 rounded-sm" />
          <div className="flex items-center justify-between gap-1.5">
            <div className="h-3.5 w-12 bg-white rounded-md" />
            <div className="h-3.5 flex-1 bg-slate-800 rounded-md border border-slate-700 flex items-center justify-end px-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
            </div>
            <div className="h-3 w-8 bg-slate-700 rounded" />
            <div className="h-3 w-8 bg-slate-700 rounded" />
          </div>
          <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800">
            <div className="h-3 w-16 bg-blue-600 rounded-full" />
            <div className="h-2 flex-1 bg-slate-800 rounded" />
            <div className="h-3 w-4 bg-emerald-500 rounded-full" />
          </div>
        </div>
      ),
    },
    {
      id: "GROCERY_DIRECT",
      title: "Grocery & Direct Store",
      tag: "Conversion Focused",
      description:
        "Top utility bar + Green 'All Categories' dropdown + Quick promo tags (Promotions, Discounts) + Clean floating cart.",
      renderWireframe: () => (
        <div className="space-y-1.5 p-2 bg-slate-900 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-[7px] text-slate-400">
            <div className="h-1.5 w-16 bg-slate-700 rounded" />
            <div className="h-1.5 w-12 bg-slate-700 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-10 bg-white rounded-md" />
            <div className="h-3.5 w-14 bg-emerald-600 rounded-full" />
            <div className="h-3.5 flex-1 bg-slate-800 rounded-full border border-slate-700" />
            <div className="h-2.5 w-8 bg-amber-500/60 rounded" />
            <div className="h-4 w-4 bg-emerald-500 rounded-full" />
          </div>
        </div>
      ),
    },
    {
      id: "TECH_SaaS_CLEAN",
      title: "Modern SaaS Tech",
      tag: "Clean & Modern",
      description:
        "Integrated category selector pill inside search bar + 'Discounts' pill button + Hotline + Account & Cart counter.",
      renderWireframe: () => (
        <div className="space-y-1.5 p-2 bg-slate-900 rounded-xl border border-slate-700/60">
          <div className="h-1 w-full bg-slate-800 rounded-sm" />
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-12 bg-white rounded-md" />
            <div className="h-4 flex-1 bg-slate-800 rounded-full border border-slate-700 flex items-center px-1 gap-1">
              <div className="h-2.5 w-10 bg-slate-950 rounded-full" />
              <div className="h-1 flex-1" />
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            </div>
            <div className="h-3 w-10 bg-indigo-500/30 border border-indigo-500 rounded-full" />
            <div className="h-3 w-3 bg-slate-700 rounded-full" />
            <div className="h-3 w-3 bg-slate-950 rounded-full" />
          </div>
        </div>
      ),
    },
    {
      id: "CLASSIC_SPLIT",
      title: "Classic 2-Tier E-Commerce",
      tag: "Standard DTC",
      description:
        "Top announcement bar + Logo on Left, Center Search bar, Right Cart & Hotline + Bottom Category navigation strip.",
      renderWireframe: () => (
        <div className="space-y-1.5 p-2 bg-slate-900 rounded-xl border border-slate-700/60">
          <div className="h-1.5 w-full bg-emerald-600 rounded-sm" />
          <div className="flex items-center justify-between gap-2">
            <div className="h-3.5 w-14 bg-white rounded-md" />
            <div className="h-3.5 flex-1 bg-slate-800 rounded-md border border-slate-700" />
            <div className="h-3.5 w-6 bg-slate-800 rounded-md" />
          </div>
          <div className="h-2 w-full bg-slate-800 rounded flex items-center gap-2 px-1">
            <div className="h-1 w-6 bg-emerald-400 rounded" />
            <div className="h-1 w-6 bg-slate-600 rounded" />
            <div className="h-1 w-6 bg-slate-600 rounded" />
          </div>
        </div>
      ),
    },
    {
      id: "INLINE_CLEAN",
      title: "Inline Minimalist (1-Row)",
      tag: "Sleek DTC",
      description:
        "Single clean line header with Brand on Left, Navigation links in center, Search icon trigger, Wishlist & Cart on right.",
      renderWireframe: () => (
        <div className="p-2 bg-slate-900 rounded-xl border border-slate-700/60 flex items-center justify-between gap-2">
          <div className="h-3.5 w-12 bg-white rounded-md" />
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-6 bg-slate-500 rounded" />
            <div className="h-1.5 w-6 bg-slate-500 rounded" />
            <div className="h-1.5 w-6 bg-slate-500 rounded" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      ),
    },
    {
      id: "CENTERED_BRAND",
      title: "Centered Luxury Brand",
      tag: "Luxury / Apparel",
      description:
        "Centered logo with left-side menu links, right-side search, wishlist, and bag actions.",
      renderWireframe: () => (
        <div className="p-2 bg-slate-900 rounded-xl border border-slate-700/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1">
            <div className="h-1.5 w-6 bg-slate-500 rounded" />
            <div className="h-1.5 w-6 bg-slate-500 rounded" />
          </div>
          <div className="h-4 w-16 bg-white rounded-md" />
          <div className="flex items-center justify-end gap-1.5 flex-1">
            <div className="w-3 h-3 rounded-full bg-slate-800" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
          </div>
        </div>
      ),
    },
    {
      id: "MEGA_SEARCH_PORTAL",
      title: "Mega Search Portal",
      tag: "Large Inventory",
      description:
        "High-visibility wide search bar in the center with 24/7 hotline badge, full-width category drawer trigger & subnav.",
      renderWireframe: () => (
        <div className="space-y-1.5 p-2 bg-slate-900 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-2">
            <div className="h-3.5 w-12 bg-white rounded-md" />
            <div className="h-4 flex-1 bg-slate-800 rounded-md border-2 border-emerald-500" />
            <div className="h-3 w-10 bg-slate-800 rounded" />
          </div>
          <div className="h-2 w-full bg-slate-800 rounded" />
        </div>
      ),
    },
    {
      id: "SIDE_DRAWER_FOCUSED",
      title: "Side Drawer Focused",
      tag: "Catalog Heavy",
      description:
        "Prominent 'All Categories' hamburger menu button on the left + Brand logo + Compact search & Cart.",
      renderWireframe: () => (
        <div className="p-2 bg-slate-900 rounded-xl border border-slate-700/60 flex items-center gap-2">
          <div className="h-4 w-6 bg-emerald-600 rounded flex items-center justify-center">
            <div className="w-3 h-0.5 bg-white" />
          </div>
          <div className="h-3.5 w-12 bg-white rounded-md" />
          <div className="h-3.5 flex-1 bg-slate-800 rounded-md" />
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
        </div>
      ),
    },
    {
      id: "TWO_TIER_COMPACT",
      title: "Compact 2-Tier SaaS",
      tag: "Compact Header",
      description:
        "High-density top contact strip with customer hotline + Compact bottom row with logo, search, and navigation links.",
      renderWireframe: () => (
        <div className="space-y-1 p-2 bg-slate-900 rounded-xl border border-slate-700/60">
          <div className="flex items-center justify-between text-[7px] text-slate-400">
            <div className="h-1 w-14 bg-slate-700 rounded" />
            <div className="h-1 w-10 bg-emerald-400/50 rounded" />
          </div>
          <div className="flex items-center gap-2 pt-0.5 border-t border-slate-800">
            <div className="h-3 w-10 bg-white rounded" />
            <div className="h-2 flex-1 bg-slate-800 rounded" />
            <div className="h-3 w-4 bg-emerald-500 rounded" />
          </div>
        </div>
      ),
    },
    {
      id: "TRANSPARENT_OVERLAY",
      title: "Transparent Glassmorphism",
      tag: "Hero Visual",
      description:
        "Floating translucent glassmorphism header overlaying the hero banner with crisp contrast controls.",
      renderWireframe: () => (
        <div className="p-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-white/20 flex items-center justify-between gap-2 shadow-inner">
          <div className="h-3.5 w-12 bg-white/90 rounded-md" />
          <div className="h-1.5 flex-1 bg-white/20 rounded-full mx-2" />
          <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={handleSave} className="space-y-6 w-full pb-16">
      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Header &amp; Navbar Customizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Choose from 10 SaaS &amp; E-commerce navbar layouts, customize logos, 512×512 favicon, social share graphics, and Computer/Mobile dimensions.
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
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Header Settings</span>
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
      {/* 1. NAVBAR LAYOUT TEMPLATES (10 RICH SAAS & E-COMMERCE OPTIONS) */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layout className="w-4 h-4 text-emerald-600" />
              <span>Navbar Layout Template (Select 1 of 10)</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Choose your storefront navigation architecture. All templates are fully responsive and automatically update the live storefront.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] self-start">
            Active: {settings.navbarLayout.replace(/_/g, " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {navbarLayoutOptions.map((opt) => {
            const isSelected = settings.navbarLayout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => updateSettings({ navbarLayout: opt.id })}
                className={`p-3.5 rounded-2xl border text-left transition space-y-2.5 relative flex flex-col justify-between group ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500"
                    : "bg-slate-50/70 border-slate-200 hover:border-emerald-500 text-slate-900 hover:bg-white"
                }`}
              >
                <div className="space-y-2 w-full">
                  {/* Wireframe Mini Diagram */}
                  {opt.renderWireframe()}

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {opt.tag}
                    </span>
                    {isSelected && <span className="text-[10px] font-black text-emerald-400">ACTIVE</span>}
                  </div>

                  <div className="font-extrabold text-xs leading-snug">
                    {opt.title}
                  </div>

                  <p
                    className={`text-[10px] leading-relaxed line-clamp-3 ${
                      isSelected ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. LOGO & BRANDING SETTINGS + 512x512 FAVICON                 */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <ImageIcon className="w-4 h-4 text-emerald-600" />
          <span>Brand Identity &amp; 512×512 Favicon</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Logo Type & Controls */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Logo Display Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateSettings({ logoType: "TEXT" })}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    settings.logoType === "TEXT"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  Text Logo
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ logoType: "IMAGE" })}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    settings.logoType === "IMAGE"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  Image Logo
                </button>
              </div>
            </div>

            {settings.logoType === "TEXT" ? (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Brand Name Text</label>
                <input
                  type="text"
                  value={settings.logoText}
                  onChange={(e) => updateSettings({ logoText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <ImageUploader
                  value={settings.logoImageUrl}
                  onChange={(url) => updateSettings({ logoImageUrl: url })}
                  label="Store Logo Image"
                  recommendedDimensions="PNG / WebP / SVG Transparent"
                />
              </div>
            )}
          </div>

          {/* Favicon Settings (512x512) */}
          <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
            <ImageUploader
              value={settings.faviconUrl}
              onChange={(url) => updateSettings({ faviconUrl: url })}
              label="Store Favicon (Fixed 512×512 px)"
              recommendedDimensions="512x512 px Square PNG"
            />
            <span className="text-[11px] text-slate-400 block">
              Fixed 512×512px icon dynamically injected into browser tabs, mobile PWA shortcuts, and Google search results.
            </span>

            {/* Favicon Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white border border-slate-300 shadow-xs shrink-0 flex items-center justify-center">
                {settings.faviconUrl ? (
                  <img src={settings.faviconUrl} alt="Favicon" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-black text-xs text-slate-700">512</span>
                )}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Browser Tab Preview</div>
                <div className="text-[11px] text-slate-400 mt-0.5">512 × 512 Standard PNG/WebP Icon</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. SOCIAL MEDIA SHARING (OG / FACEBOOK / WHATSAPP)            */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="w-4 h-4 text-emerald-600" />
            <span>Social Media Share Logo &amp; OpenGraph Image (Facebook, WhatsApp, Telegram, Twitter)</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
            1200 × 630 px Standard
          </span>
        </div>

        <p className="text-xs text-slate-500">
          When your website link is shared on <strong>Facebook, WhatsApp, Instagram, Telegram, or LinkedIn</strong>, this banner image, title, and description will be displayed in the preview card.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ImageUploader
              value={settings.ogImageUrl}
              onChange={(url) => updateSettings({ ogImageUrl: url })}
              label="Social Share Banner Image (1200×630 px)"
              recommendedDimensions="1200x630 px PNG/JPG/WebP"
            />

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">Social Share Title</label>
              <input
                type="text"
                value={settings.ogTitle || ""}
                onChange={(e) => updateSettings({ ogTitle: e.target.value })}
                placeholder="Toolera — Discover What's Trending. Smart Finds."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">Social Share Description</label>
              <textarea
                rows={2}
                value={settings.ogDescription || ""}
                onChange={(e) => updateSettings({ ogDescription: e.target.value })}
                placeholder="Discover trending smart gadgets and unique lifestyle finds with cash on delivery in Bangladesh..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Live WhatsApp / Facebook Mockup Preview */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Live WhatsApp &amp; Facebook Share Card Preview
            </div>
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80">
              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200/60 max-w-sm mx-auto">
                <div className="relative aspect-[1200/630] bg-slate-900 flex items-center justify-center overflow-hidden">
                  {settings.ogImageUrl || settings.logoImageUrl ? (
                    <img
                      src={settings.ogImageUrl || settings.logoImageUrl}
                      alt="Social Share Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-white font-bold text-sm">RAIFA&apos;S MART</span>
                      <div className="text-[10px] text-slate-400 mt-1">1200 × 630 px Social Image</div>
                    </div>
                  )}
                </div>

                <div className="p-3.5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    toolera.store
                  </div>
                  <div className="font-extrabold text-slate-900 text-xs line-clamp-1 leading-snug">
                    {settings.ogTitle || "Toolera — Discover What's Trending"}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {settings.ogDescription ||
                      "Discover trending smart gadgets and unique lifestyle finds with cash on delivery in Bangladesh."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. RESPONSIVE COMPUTER VS MOBILE DEVICE DIMENSIONS            */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Responsive Device Sizing &amp; Dimensions</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Configure separate width &amp; height values for Computer and Mobile devices.
            </p>
          </div>

          {/* Device Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start">
            <button
              type="button"
              onClick={() => setActiveDeviceTab("desktop")}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                activeDeviceTab === "desktop"
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-600" />
              <span>Computer / Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveDeviceTab("mobile")}
              className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                activeDeviceTab === "mobile"
                  ? "bg-white text-emerald-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mobile Device</span>
            </button>
          </div>
        </div>

        {activeDeviceTab === "desktop" ? (
          /* Desktop Sizing Controls */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">Desktop Logo Max Width</label>
                <span className="font-mono font-bold text-emerald-600">{settings.logoWidth || 240}px</span>
              </div>
              <input
                type="range"
                min={80}
                max={400}
                step={5}
                value={settings.logoWidth || 240}
                onChange={(e) => updateSettings({ logoWidth: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">Desktop Logo Max Height</label>
                <span className="font-mono font-bold text-emerald-600">{settings.logoHeight || 48}px</span>
              </div>
              <input
                type="range"
                min={24}
                max={120}
                step={2}
                value={settings.logoHeight || 48}
                onChange={(e) => updateSettings({ logoHeight: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">Desktop Navbar Height</label>
                <span className="font-mono font-bold text-emerald-600">{settings.headerHeight || 76}px</span>
              </div>
              <input
                type="range"
                min={56}
                max={120}
                step={2}
                value={settings.headerHeight || 76}
                onChange={(e) => updateSettings({ headerHeight: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        ) : (
          /* Mobile Sizing Controls */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">Mobile Logo Max Width</label>
                <span className="font-mono font-bold text-emerald-600">{settings.mobileLogoWidth || 140}px</span>
              </div>
              <input
                type="range"
                min={60}
                max={220}
                step={5}
                value={settings.mobileLogoWidth || 140}
                onChange={(e) => updateSettings({ mobileLogoWidth: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">Mobile Logo Max Height</label>
                <span className="font-mono font-bold text-emerald-600">{settings.mobileLogoHeight || 36}px</span>
              </div>
              <input
                type="range"
                min={20}
                max={70}
                step={2}
                value={settings.mobileLogoHeight || 36}
                onChange={(e) => updateSettings({ mobileLogoHeight: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-700">Mobile Header Height</label>
                <span className="font-mono font-bold text-emerald-600">{settings.mobileHeaderHeight || 58}px</span>
              </div>
              <input
                type="range"
                min={48}
                max={90}
                step={2}
                value={settings.mobileHeaderHeight || 58}
                onChange={(e) => updateSettings({ mobileHeaderHeight: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 5. TOP ANNOUNCEMENT BAR & CUSTOMER HOTLINE                    */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Bell className="w-4 h-4 text-emerald-600" />
          <span>Top Announcement Bar &amp; 24/7 Hotline</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div className="space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-800">
              <input
                type="checkbox"
                checked={settings.showTopBar}
                onChange={(e) => updateSettings({ showTopBar: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600"
              />
              <span>Enable Top Announcement Bar</span>
            </label>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Announcement Text</label>
              <textarea
                rows={2}
                value={settings.topBarText}
                onChange={(e) => updateSettings({ topBarText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Customer Support Hotline Phone</label>
              <div className="flex items-center gap-2">
                <span className="p-2.5 rounded-xl bg-slate-100 text-slate-600">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={settings.hotlinePhone}
                  onChange={(e) => updateSettings({ hotlinePhone: e.target.value })}
                  placeholder="01712-345678"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Bar Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.topBarBgColor}
                    onChange={(e) => updateSettings({ topBarBgColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={settings.topBarBgColor}
                    onChange={(e) => updateSettings({ topBarBgColor: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Bar Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.topBarTextColor}
                    onChange={(e) => updateSettings({ topBarTextColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <input
                    type="text"
                    value={settings.topBarTextColor}
                    onChange={(e) => updateSettings({ topBarTextColor: e.target.value })}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
