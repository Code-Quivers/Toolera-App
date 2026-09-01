"use client";

import React, { useState } from "react";
import { useHeaderStore, NavbarLayoutType } from "@/store/useHeaderStore";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Layout,
  Sliders,
  Phone,
  Monitor,
  Smartphone,
  Check,
  Loader2,
  Share2,
  Layers,
} from "lucide-react";

/* ─── small shared primitives ─────────────────────────────────── */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
      {children}
    </div>
  );
}

function SectionHeader({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
        {icon}
        <span>{title}</span>
      </h2>
      {right}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="font-bold text-slate-700 text-xs">{children}</label>;
}

function TextInput({ value, onChange, placeholder, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition ${className}`}
    />
  );
}

function SliderRow({ label, value, min, max, step, onChange, unit = "px" }: {
  label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; unit?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <Label>{label}</Label>
        <span className="font-mono font-bold text-emerald-600 text-xs">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-emerald-600"
      />
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200 shrink-0"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] font-mono focus:outline-none focus:border-emerald-500"
        />
      </div>
    </div>
  );
}

/* ─── navbar layout definitions ───────────────────────────────── */
const NAVBAR_OPTIONS: {
  id: NavbarLayoutType;
  title: string;
  tag: string;
  description: string;
  wireframe: React.ReactNode;
}[] = [
  {
    id: "WOODMART_MARKETPLACE",
    title: "WoodMart Marketplace",
    tag: "Popular E-Commerce",
    description: "Full-width search bar + 24/7 Hotline support + Free shipping badge + Blue/Emerald 'All Categories' pill button & horizontal subnav.",
    wireframe: (
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
    description: "Top utility bar + Green 'All Categories' dropdown + Quick promo tags (Promotions, Discounts) + Clean floating cart.",
    wireframe: (
      <div className="space-y-1.5 p-2 bg-slate-900 rounded-xl border border-slate-700/60">
        <div className="flex items-center justify-between">
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
    description: "Integrated category selector pill inside search bar + 'Discounts' pill button + Hotline + Account & Cart counter.",
    wireframe: (
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
    description: "Top announcement bar + Logo on Left, Center Search bar, Right Cart & Hotline + Bottom Category navigation strip.",
    wireframe: (
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
    description: "Single clean line header with Brand on Left, Navigation links in center, Search icon trigger, Wishlist & Cart on right.",
    wireframe: (
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
    description: "Centered logo with left-side menu links, right-side search, wishlist, and bag actions.",
    wireframe: (
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
    description: "High-visibility wide search bar in the center with 24/7 hotline badge, full-width category drawer trigger & subnav.",
    wireframe: (
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
    description: "Prominent 'All Categories' hamburger menu button on the left + Brand logo + Compact search & Cart.",
    wireframe: (
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
    description: "High-density top contact strip with customer hotline + Compact bottom row with logo, search, and navigation links.",
    wireframe: (
      <div className="space-y-1 p-2 bg-slate-900 rounded-xl border border-slate-700/60">
        <div className="flex items-center justify-between">
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
    description: "Floating translucent glassmorphism header overlaying the hero banner with crisp contrast controls.",
    wireframe: (
      <div className="p-2.5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-white/20 flex items-center justify-between gap-2 shadow-inner">
        <div className="h-3.5 w-12 bg-white/90 rounded-md" />
        <div className="h-1.5 flex-1 bg-white/20 rounded-full mx-2" />
        <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
      </div>
    ),
  },
];

/* ─── page ─────────────────────────────────────────────────────── */
export default function AdminHeaderPage() {
  const { settings, isLoading, isSaving, error, setField, saveSettings, resetToDefaults } = useHeaderStore();
  const [activeDeviceTab, setActiveDeviceTab] = useState<"desktop" | "mobile">("desktop");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveSettings();
      showToast("Header settings saved to store!");
    } catch {
      showToast("Failed to save. Please try again.", false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset all header settings to default template?")) return;
    try {
      await resetToDefaults();
      showToast("Header settings reset to brand defaults.");
    } catch {
      showToast("Failed to reset.", false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading header settings…
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 w-full pb-16">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Header &amp; Navbar Customizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Choose from 10 SaaS &amp; E-commerce navbar layouts, customize logos, 512×512 favicon, social share graphics, and Computer/Mobile dimensions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            disabled={isSaving}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold disabled:opacity-50 transition"
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isSaving ? "Saving…" : "Save Header Settings"}
          </button>
        </div>
      </div>

      {/* ── Toast ───────────────────────────────────────────── */}
      {toast && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
          toast.ok
            ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
            : "bg-red-50 border border-red-200 text-red-900"
        }`}>
          {toast.ok
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {error && !toast && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* 1. NAVBAR LAYOUT TEMPLATES                           */}
      {/* ══════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<Layout className="w-4 h-4 text-emerald-600" />}
          title="Navbar Layout Template (Select 1 of 10)"
          right={
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[11px] self-start shrink-0">
              Active: {settings.navbarLayout.replace(/_/g, " ")}
            </span>
          }
        />
        <p className="text-[11px] text-slate-500 -mt-2">
          Choose your storefront navigation architecture. All templates are fully responsive and automatically update the live storefront.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
          {NAVBAR_OPTIONS.map(opt => {
            const active = settings.navbarLayout === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setField("navbarLayout", opt.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all space-y-2.5 relative flex flex-col justify-between group ${
                  active
                    ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500"
                    : "bg-slate-50/70 border-slate-200 hover:border-emerald-500 text-slate-900 hover:bg-white hover:shadow-sm"
                }`}
              >
                <div className="space-y-2 w-full">
                  {opt.wireframe}

                  <div className="flex items-center justify-between gap-1 pt-1">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      active
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-200 text-slate-700"
                    }`}>
                      {opt.tag}
                    </span>
                    {active && <span className="text-[10px] font-black text-emerald-400">ACTIVE</span>}
                  </div>

                  <div className="font-extrabold text-xs leading-snug">{opt.title}</div>

                  <p className={`text-[10px] leading-relaxed line-clamp-3 ${active ? "text-slate-300" : "text-slate-500"}`}>
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 2. BRAND IDENTITY & FAVICON                          */}
      {/* ══════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<ImageIcon className="w-4 h-4 text-emerald-600" />}
          title="Brand Identity & 512×512 Favicon"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Logo */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Logo Display Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["TEXT", "IMAGE"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setField("logoType", t)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      settings.logoType === t
                        ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {t === "TEXT" ? "Text Logo" : "Image Logo"}
                  </button>
                ))}
              </div>
            </div>

            {settings.logoType === "TEXT" ? (
              <div className="space-y-1.5">
                <Label>Brand Name Text</Label>
                <TextInput
                  value={settings.logoText}
                  onChange={v => setField("logoText", v)}
                  placeholder="Your Brand Name"
                />
                {/* Live text logo preview */}
                <div className="mt-2 flex items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-700">
                  <span className="font-extrabold text-white text-lg tracking-tight">{settings.logoText || "Brand"}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <ImageUploader
                  value={settings.logoImageUrl}
                  onChange={url => setField("logoImageUrl", url)}
                  label="Store Logo Image"
                  recommendedDimensions="PNG / WebP / SVG Transparent"
                />
                {settings.logoImageUrl && (
                  <div className="flex items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-700">
                    <img src={settings.logoImageUrl} alt="Logo preview" className="max-h-12 max-w-[200px] object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Favicon */}
          <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
            <ImageUploader
              value={settings.faviconUrl}
              onChange={url => setField("faviconUrl", url)}
              label="Store Favicon (Fixed 512×512 px)"
              recommendedDimensions="512×512 px Square PNG"
            />
            <p className="text-[11px] text-slate-400">
              Fixed 512×512px icon dynamically injected into browser tabs, mobile PWA shortcuts, and Google search results.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-slate-300 shadow-xs shrink-0 flex items-center justify-center">
                {settings.faviconUrl
                  ? <img src={settings.faviconUrl} alt="Favicon preview" className="w-full h-full object-cover" />
                  : <span className="font-black text-xs text-slate-700">512</span>}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-xs">Browser Tab Preview</div>
                <div className="text-[11px] text-slate-400 mt-0.5">512 × 512 Standard PNG/WebP Icon</div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 3. SOCIAL MEDIA / OPEN GRAPH                         */}
      {/* ══════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<Share2 className="w-4 h-4 text-emerald-600" />}
          title="Social Media Share Logo & OpenGraph Image (Facebook, WhatsApp, Telegram, Twitter)"
          right={
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] shrink-0">
              1200 × 630 px Standard
            </span>
          }
        />

        <p className="text-xs text-slate-500">
          When your website link is shared on{" "}
          <strong>Facebook, WhatsApp, Instagram, Telegram, or LinkedIn</strong>, this banner image, title, and description will be displayed in the preview card.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <ImageUploader
              value={settings.ogImageUrl}
              onChange={url => setField("ogImageUrl", url)}
              label="Social Share Banner Image (1200×630 px)"
              recommendedDimensions="1200×630 px PNG/JPG/WebP"
            />

            <div className="space-y-1.5">
              <Label>Social Share Title</Label>
              <TextInput
                value={settings.ogTitle}
                onChange={v => setField("ogTitle", v)}
                placeholder="Toolera — Discover What's Trending. Smart Finds."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Social Share Description</Label>
              <textarea
                rows={2}
                value={settings.ogDescription}
                onChange={e => setField("ogDescription", e.target.value)}
                placeholder="Discover trending smart gadgets and unique lifestyle finds with cash on delivery in Bangladesh..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>
          </div>

          {/* Live preview */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Live WhatsApp &amp; Facebook Share Card Preview</p>
            <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200/80">
              <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-slate-200/60 max-w-sm mx-auto">
                <div className="relative aspect-[1200/630] bg-slate-900 flex items-center justify-center overflow-hidden">
                  {settings.ogImageUrl || settings.logoImageUrl ? (
                    <img
                      src={settings.ogImageUrl || settings.logoImageUrl}
                      alt="OG preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-white font-bold text-sm">{settings.logoText || "STORE NAME"}</span>
                      <div className="text-[10px] text-slate-400 mt-1">1200 × 630 px Social Image</div>
                    </div>
                  )}
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">toolera.store</div>
                  <div className="font-extrabold text-slate-900 text-xs line-clamp-1 leading-snug">
                    {settings.ogTitle || "Toolera — Discover What's Trending"}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {settings.ogDescription || "Discover trending smart gadgets and unique lifestyle finds with cash on delivery in Bangladesh."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 4. RESPONSIVE DIMENSIONS                             */}
      {/* ══════════════════════════════════════════════════════ */}
      <SectionCard>
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

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start shrink-0">
            {(["desktop", "mobile"] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveDeviceTab(tab)}
                className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                  activeDeviceTab === tab ? "bg-white text-emerald-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab === "desktop"
                  ? <Monitor className="w-3.5 h-3.5 text-emerald-600" />
                  : <Smartphone className="w-3.5 h-3.5 text-emerald-600" />}
                {tab === "desktop" ? "Computer / Desktop" : "Mobile Device"}
              </button>
            ))}
          </div>
        </div>

        {activeDeviceTab === "desktop" ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SliderRow label="Desktop Logo Max Width"  value={settings.logoWidth}    min={80}  max={400} step={5}  onChange={v => setField("logoWidth",    v)} />
            <SliderRow label="Desktop Logo Max Height" value={settings.logoHeight}   min={24}  max={120} step={2}  onChange={v => setField("logoHeight",   v)} />
            <SliderRow label="Desktop Navbar Height"   value={settings.headerHeight} min={56}  max={120} step={2}  onChange={v => setField("headerHeight", v)} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <SliderRow label="Mobile Logo Max Width"  value={settings.mobileLogoWidth}    min={60} max={220} step={5}  onChange={v => setField("mobileLogoWidth",    v)} />
            <SliderRow label="Mobile Logo Max Height" value={settings.mobileLogoHeight}   min={20} max={70}  step={2}  onChange={v => setField("mobileLogoHeight",   v)} />
            <SliderRow label="Mobile Header Height"   value={settings.mobileHeaderHeight} min={48} max={90}  step={2}  onChange={v => setField("mobileHeaderHeight", v)} />
          </div>
        )}

        {/* Visual dimension preview */}
        <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 flex items-center gap-4 overflow-x-auto">
          {activeDeviceTab === "desktop" ? (
            <div className="flex items-end gap-3 text-[10px] text-slate-500 shrink-0">
              <div
                className="bg-slate-200 rounded-md flex items-center justify-center text-[9px] font-bold text-slate-600 transition-all"
                style={{ width: Math.min(settings.logoWidth, 140), height: settings.logoHeight, maxWidth: "100%" }}
              >
                Logo
              </div>
              <div className="space-y-0.5">
                <div>W: {settings.logoWidth}px</div>
                <div>H: {settings.logoHeight}px</div>
                <div>Navbar: {settings.headerHeight}px</div>
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-3 text-[10px] text-slate-500 shrink-0">
              <div
                className="bg-slate-200 rounded-md flex items-center justify-center text-[9px] font-bold text-slate-600 transition-all"
                style={{ width: Math.min(settings.mobileLogoWidth, 100), height: settings.mobileLogoHeight }}
              >
                Logo
              </div>
              <div className="space-y-0.5">
                <div>W: {settings.mobileLogoWidth}px</div>
                <div>H: {settings.mobileLogoHeight}px</div>
                <div>Navbar: {settings.mobileHeaderHeight}px</div>
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 5. TOP ANNOUNCEMENT BAR & HOTLINE                    */}
      {/* ══════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<Bell className="w-4 h-4 text-emerald-600" />}
          title="Top Announcement Bar & 24/7 Hotline"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Left column */}
          <div className="space-y-4">
            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-800 text-xs select-none">
              <input
                type="checkbox"
                checked={settings.showTopBar}
                onChange={e => setField("showTopBar", e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-600"
              />
              Enable Top Announcement Bar
            </label>

            <div className={`space-y-1.5 transition-opacity ${settings.showTopBar ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
              <Label>Announcement Text</Label>
              <textarea
                rows={2}
                value={settings.topBarText}
                onChange={e => setField("topBarText", e.target.value)}
                placeholder="🚚 Free delivery on orders above ৳999  |  Call: 01712-345678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>

            {/* Live bar preview */}
            {settings.showTopBar && (
              <div
                className="w-full px-4 py-2 rounded-xl text-[11px] font-medium text-center transition-all"
                style={{ backgroundColor: settings.topBarBgColor, color: settings.topBarTextColor }}
              >
                {settings.topBarText || "Announcement text preview..."}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Customer Support Hotline Phone</Label>
              <div className="flex items-center gap-2">
                <span className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0">
                  <Phone className="w-4 h-4" />
                </span>
                <TextInput
                  value={settings.hotlinePhone}
                  onChange={v => setField("hotlinePhone", v)}
                  placeholder="01712-345678"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ColorRow
                label="Bar Background Color"
                value={settings.topBarBgColor}
                onChange={v => setField("topBarBgColor", v)}
              />
              <ColorRow
                label="Bar Text Color"
                value={settings.topBarTextColor}
                onChange={v => setField("topBarTextColor", v)}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Sticky save bar at bottom on mobile */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t border-slate-200 px-4 py-3 flex gap-2 z-40">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isSaving ? "Saving…" : "Save Header Settings"}
        </button>
      </div>

    </form>
  );
}
