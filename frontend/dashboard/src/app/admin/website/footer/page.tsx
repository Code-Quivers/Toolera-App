"use client";

import React, { useState } from "react";
import { useFooterStore, FooterLinkItem } from "@/store/useFooterStore";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { syncToServer } from "@/lib/serverSync";
import Link from "next/link";
import {
  Globe,
  CheckCircle2,
  Sliders,
  Plus,
  Trash2,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Check,
  RotateCcw,
  Monitor,
  Smartphone,
  Edit2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Link2,
  Sparkles,
  X,
  Eye,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Headphones,
} from "lucide-react";

// Pre-defined quick link presets for easy 1-click addition
const SHOP_PRESETS = [
  { label: "All Products", url: "/shop" },
  { label: "Trending Now", url: "/shop?filter=trending" },
  { label: "New Arrivals", url: "/shop?filter=new-arrivals" },
  { label: "Best Sellers", url: "/shop?filter=best-sellers" },
  { label: "Smart Gadgets", url: "/category/smart-gadgets" },
  { label: "Desk Setup", url: "/category/desk-setup" },
  { label: "Handcraft", url: "/category/handcraft" },
];

const CUSTOMER_CARE_PRESETS = [
  { label: "WhatsApp Support", url: "https://wa.me/8801712345678" },
  { label: "Track Your Order", url: "/track-order" },
  { label: "Shipping Policy (1–3 Days)", url: "/pages/shipping-policy" },
  { label: "7-Day Easy Return Policy", url: "/pages/returns" },
  { label: "FAQ & Help Center", url: "/pages/contact" },
  { label: "Privacy Policy", url: "/pages/privacy-policy" },
  { label: "Terms of Service", url: "/pages/terms" },
];

const BOTTOM_BAR_PRESETS = [
  { label: "Privacy Policy", url: "/pages/privacy-policy" },
  { label: "Terms of Service", url: "/pages/terms" },
  { label: "Refund Policy", url: "/pages/returns" },
  { label: "Shipping & Delivery", url: "/pages/shipping-policy" },
];

export default function AdminFooterPage() {
  const { settings, updateSettings, resetToDefaults } = useFooterStore();
  const [activeDeviceTab, setActiveDeviceTab] = useState<"desktop" | "mobile">("desktop");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    syncToServer("footer", settings);
    showNotification("Footer navigation & settings saved and synced successfully!");
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Header Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-[#008B47]" />
            <span>Footer Menu &amp; Layout Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full CRUD management for footer link columns, policy menus, Computer &amp; Mobile logo sizing, and payment badges.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset all Footer settings and link columns to default?")) {
                resetToDefaults();
                syncToServer("footer", settings);
                showNotification("Footer reset to default settings!");
              }
            }}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs"
          >
            Reset Defaults
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-5 py-2.5 bg-[#008B47] hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save All Changes</span>
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

      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6 text-xs">
        {/* 1. Layout Columns Count Switcher */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#008B47]" />
                <span>Footer Column Layout Structure</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Select how many columns appear across the footer.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold">
              {settings.columnsCount} Columns Active
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[3, 4, 5].map((cols) => (
              <button
                key={cols}
                type="button"
                onClick={() => {
                  updateSettings({ columnsCount: cols as 3 | 4 | 5 });
                  showNotification(`Footer set to ${cols} columns layout`);
                }}
                className={`py-3 rounded-2xl font-bold border text-xs flex flex-col items-center gap-1 transition ${
                  settings.columnsCount === cols
                    ? "border-[#008B47] bg-emerald-50 text-emerald-950 shadow-xs ring-1 ring-[#008B47]"
                    : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-white"
                }`}
              >
                <span className="text-sm font-black">{cols} Columns</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {cols === 3 ? "Clean Compact" : cols === 4 ? "Standard E-com" : "Full Extended"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 1.5 Top Value Assurance Banner Customizer */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#008B47]" />
                <span>Top Footer Value Assurance Badges</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Customize the 4 customer trust badges (Fast Delivery, Quality Checked, 7-Day Returns, 24/7 Support) displayed at the top of the footer.
              </p>
            </div>

            <label className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer self-start sm:self-auto">
              <input
                type="checkbox"
                checked={settings.showTopAssuranceBanner !== false}
                onChange={(e) => updateSettings({ showTopAssuranceBanner: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="font-extrabold text-slate-800 text-xs">
                {settings.showTopAssuranceBanner !== false ? "✅ Enabled on Storefront" : "❌ Hidden"}
              </span>
            </label>
          </div>

          {settings.showTopAssuranceBanner !== false && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(settings.assurancePillars || [
                  { title: "Fast Delivery", subtitle: "All across Bangladesh", iconName: "Truck" },
                  { title: "Quality Checked", subtitle: "100% inspected items", iconName: "ShieldCheck" },
                  { title: "7-Day Easy Return", subtitle: "Hassle-free guarantee", iconName: "RotateCcw" },
                  { title: "24/7 Live Support", subtitle: `Call ${settings.phone || "hotline"}`, iconName: "Headphones" },
                ]).map((pillar, idx) => {
                  const updatePillarItem = (field: string, val: string) => {
                    const list = [...(settings.assurancePillars || [
                      { title: "Fast Delivery", subtitle: "All across Bangladesh", iconName: "Truck" },
                      { title: "Quality Checked", subtitle: "100% inspected items", iconName: "ShieldCheck" },
                      { title: "7-Day Easy Return", subtitle: "Hassle-free guarantee", iconName: "RotateCcw" },
                      { title: "24/7 Live Support", subtitle: `Call ${settings.phone || "hotline"}`, iconName: "Headphones" },
                    ])];
                    list[idx] = { ...list[idx], [field]: val };
                    updateSettings({ assurancePillars: list });
                  };

                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black">
                            {idx + 1}
                          </span>
                          <span>Assurance Badge #{idx + 1}</span>
                        </span>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Badge Icon</label>
                        <select
                          value={pillar.iconName || "ShieldCheck"}
                          onChange={(e) => updatePillarItem("iconName", e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-[#008B47] cursor-pointer"
                        >
                          <option value="Truck">🚚 Fast Truck / Delivery</option>
                          <option value="ShieldCheck">🛡️ Quality Checked / Shield</option>
                          <option value="RotateCcw">🔄 7-Day Easy Return</option>
                          <option value="Headphones">🎧 24/7 Live Support</option>
                          <option value="Sparkles">✨ Sparkles / Premium</option>
                          <option value="Banknote">💵 Cash on Delivery (COD)</option>
                          <option value="Award">🏆 Award Quality</option>
                          <option value="PackageCheck">📦 Package Check</option>
                          <option value="CheckCircle2">✅ Verified Guarantee</option>
                          <option value="Lock">🔒 Secure Payment</option>
                          <option value="Phone">📞 Direct Phone Call</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Main Title</label>
                        <input
                          type="text"
                          value={pillar.title || ""}
                          onChange={(e) => updatePillarItem("title", e.target.value)}
                          placeholder="e.g. Fast Delivery"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-[#008B47]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Subtitle / Guarantee Note</label>
                        <input
                          type="text"
                          value={pillar.subtitle || ""}
                          onChange={(e) => updatePillarItem("subtitle", e.target.value)}
                          placeholder="e.g. All across Bangladesh"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#008B47]"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 2. Column 1: Brand Info & Logo Upload */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#008B47]" />
            <span>Column 1: Brand Logo &amp; Store Contact Info</span>
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Footer Logo Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateSettings({ brandLogoType: "TEXT" })}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      settings.brandLogoType === "TEXT"
                        ? "bg-emerald-50 border-[#008B47] text-emerald-950 ring-1 ring-[#008B47]"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Text Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ brandLogoType: "IMAGE" })}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      settings.brandLogoType === "IMAGE"
                        ? "bg-emerald-50 border-[#008B47] text-emerald-950 ring-1 ring-[#008B47]"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    Image Logo
                  </button>
                </div>
              </div>

              {settings.brandLogoType === "TEXT" ? (
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Brand Title</label>
                  <input
                    type="text"
                    value={settings.brandTitle}
                    onChange={(e) => updateSettings({ brandTitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <ImageUploader
                    value={settings.brandLogoUrl}
                    onChange={(url) => updateSettings({ brandLogoUrl: url })}
                    label="Footer Logo Image"
                    recommendedDimensions="160x40 px PNG/SVG"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Brand Description Statement</label>
                <textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => updateSettings({ description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                />
              </div>
            </div>

            <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Store Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => updateSettings({ address: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Phone Hotline</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={settings.phone}
                    onChange={(e) => updateSettings({ phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Support Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSettings({ email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Computer vs Mobile Footer Logo Dimensions Tabs */}
        {settings.brandLogoType === "IMAGE" && (
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#008B47]" />
                  <span>Responsive Footer Logo Dimensions</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Configure separate logo dimensions for Computer and Mobile devices.
                </p>
              </div>

              {/* Device Tabs */}
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
                  <Monitor className="w-3.5 h-3.5 text-[#008B47]" />
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
                  <Smartphone className="w-3.5 h-3.5 text-[#008B47]" />
                  <span>Mobile Device</span>
                </button>
              </div>
            </div>

            {/* Computer / Desktop Tab */}
            {activeDeviceTab === "desktop" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Desktop Footer Logo Max Width (px)</label>
                    <input
                      type="number"
                      value={settings.brandLogoWidth || 160}
                      onChange={(e) => updateSettings({ brandLogoWidth: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                    />
                    <span className="text-[10px] text-slate-400">Default: 160px</span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Desktop Footer Logo Max Height (px)</label>
                    <input
                      type="number"
                      value={settings.brandLogoHeight || 40}
                      onChange={(e) => updateSettings({ brandLogoHeight: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                    />
                    <span className="text-[10px] text-slate-400">Default: 40px</span>
                  </div>
                </div>

                {/* Desktop Preview */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Computer / Desktop Footer Logo Preview ({settings.brandLogoWidth}×{settings.brandLogoHeight}px)
                  </div>
                  <div className="p-3 bg-slate-900 rounded-xl inline-block">
                    {settings.brandLogoUrl ? (
                      <img
                        src={settings.brandLogoUrl}
                        alt="Desktop Footer Logo Preview"
                        style={{
                          maxHeight: `${settings.brandLogoHeight}px`,
                          maxWidth: `${settings.brandLogoWidth}px`,
                          width: "auto",
                          height: "auto",
                        }}
                        className="object-contain"
                      />
                    ) : (
                      <span className="font-bold text-white text-base">RAIFA&apos;S MART</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Device Tab */}
            {activeDeviceTab === "mobile" && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Mobile Footer Logo Max Width (px)</label>
                    <input
                      type="number"
                      value={settings.mobileBrandLogoWidth || 120}
                      onChange={(e) => updateSettings({ mobileBrandLogoWidth: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                    />
                    <span className="text-[10px] text-slate-400">Recommended: 100px – 130px</span>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Mobile Footer Logo Max Height (px)</label>
                    <input
                      type="number"
                      value={settings.mobileBrandLogoHeight || 32}
                      onChange={(e) => updateSettings({ mobileBrandLogoHeight: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                    />
                    <span className="text-[10px] text-slate-400">Recommended: 28px – 36px</span>
                  </div>
                </div>

                {/* Mobile Preview */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Mobile Footer Logo Preview ({settings.mobileBrandLogoWidth || 120}×{settings.mobileBrandLogoHeight || 32}px)
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl inline-block">
                    {settings.brandLogoUrl ? (
                      <img
                        src={settings.brandLogoUrl}
                        alt="Mobile Footer Logo Preview"
                        style={{
                          maxHeight: `${settings.mobileBrandLogoHeight || 32}px`,
                          maxWidth: `${settings.mobileBrandLogoWidth || 120}px`,
                          width: "auto",
                          height: "auto",
                        }}
                        className="object-contain"
                      />
                    ) : (
                      <span className="font-bold text-white text-xs">RAIFA&apos;S MART</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. FULL CRUD: Column 2 & Column 3 Link Managers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 2 CRUD Manager */}
          <FooterLinkCrudManager
            columnNumber="2"
            columnTitle={settings.col2Title}
            onUpdateColumnTitle={(val) => updateSettings({ col2Title: val })}
            links={settings.col2Links}
            onUpdateLinks={(newLinks) => updateSettings({ col2Links: newLinks })}
            quickPresets={SHOP_PRESETS}
            showNotification={showNotification}
            badgeLabel="Shop Menu"
          />

          {/* Column 3 CRUD Manager */}
          <FooterLinkCrudManager
            columnNumber="3"
            columnTitle={settings.col3Title}
            onUpdateColumnTitle={(val) => updateSettings({ col3Title: val })}
            links={settings.col3Links}
            onUpdateLinks={(newLinks) => updateSettings({ col3Links: newLinks })}
            quickPresets={CUSTOMER_CARE_PRESETS}
            showNotification={showNotification}
            badgeLabel="Customer Care"
          />
        </div>

        {/* 5. Column 4: Payment Badges & Delivery Hours */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#008B47]" />
            <span>Column 4: Payment Options &amp; Delivery Hotline</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableCodBadge}
                onChange={(e) => updateSettings({ enableCodBadge: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600"
              />
              <span className="font-bold text-slate-900">Cash on Delivery (COD)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableBkashBadge}
                onChange={(e) => updateSettings({ enableBkashBadge: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600"
              />
              <span className="font-bold text-slate-900">bKash Merchant Pay</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableNagadBadge}
                onChange={(e) => updateSettings({ enableNagadBadge: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600"
              />
              <span className="font-bold text-slate-900">Nagad Payment</span>
            </label>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="font-bold text-slate-700">Delivery Hours / Note</label>
            <input
              type="text"
              value={settings.deliveryHours}
              onChange={(e) => updateSettings({ deliveryHours: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* 6. FULL CRUD: Bottom Bar Policy Links & Copyright */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#008B47]" />
                <span>Footer Bottom Bar &amp; Policy Links</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Manage copyright statement and bottom legal links.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Copyright Notice Text</label>
                <input
                  type="text"
                  value={settings.copyrightText}
                  onChange={(e) => updateSettings({ copyrightText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Attribution / Sub-Note</label>
                <input
                  type="text"
                  value={settings.attributionText}
                  onChange={(e) => updateSettings({ attributionText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Bottom Links CRUD Manager */}
            <FooterLinkCrudManager
              columnNumber="Bottom Bar"
              columnTitle="Legal &amp; Policy Links"
              links={settings.bottomLinks}
              onUpdateLinks={(newLinks) => updateSettings({ bottomLinks: newLinks })}
              quickPresets={BOTTOM_BAR_PRESETS}
              showNotification={showNotification}
              badgeLabel="Bottom Bar"
              hideTitleEdit={true}
            />
          </div>
        </div>

        {/* 7. LIVE REAL-TIME FOOTER PREVIEW */}
        <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-white font-extrabold text-sm">
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Live Storefront Footer Preview</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
              Real-time Output
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-6 text-slate-400 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Preview Col 1 */}
              <div className="space-y-3">
                {settings.brandLogoType === "IMAGE" && settings.brandLogoUrl ? (
                  <img
                    src={settings.brandLogoUrl}
                    alt="Preview Logo"
                    style={{ maxHeight: `${settings.brandLogoHeight || 40}px`, maxWidth: `${settings.brandLogoWidth || 160}px` }}
                    className="object-contain"
                  />
                ) : (
                  <span className="text-lg font-black text-white">{settings.brandTitle || "RAIFA'S MART"}</span>
                )}
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{settings.description}</p>
                <div className="text-[10px] space-y-1 text-slate-500">
                  {settings.phone && <div>📞 {settings.phone}</div>}
                  {settings.email && <div>✉️ {settings.email}</div>}
                </div>
              </div>

              {/* Preview Col 2 */}
              <div className="space-y-2">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">{settings.col2Title || "SHOP"}</h4>
                <ul className="space-y-1.5 text-[11px]">
                  {settings.col2Links.map((l) => (
                    <li key={l.id} className="hover:text-white transition cursor-default">
                      {l.label}
                    </li>
                  ))}
                  {settings.col2Links.length === 0 && (
                    <li className="text-slate-600 italic">No links added</li>
                  )}
                </ul>
              </div>

              {/* Preview Col 3 */}
              <div className="space-y-2">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">{settings.col3Title || "CUSTOMER CARE"}</h4>
                <ul className="space-y-1.5 text-[11px]">
                  {settings.col3Links.map((l) => (
                    <li key={l.id} className="hover:text-white transition cursor-default">
                      {l.label}
                    </li>
                  ))}
                  {settings.col3Links.length === 0 && (
                    <li className="text-slate-600 italic">No links added</li>
                  )}
                </ul>
              </div>

              {/* Preview Col 4 */}
              <div className="space-y-2">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">{settings.col4Title || "PAYMENT OPTIONS"}</h4>
                <p className="text-[10px] text-slate-400">{settings.col4Note}</p>
                <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-bold">
                  {settings.enableCodBadge && (
                    <span className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800">COD</span>
                  )}
                  {settings.enableBkashBadge && (
                    <span className="px-2 py-0.5 bg-rose-950/70 text-rose-300 rounded border border-rose-900/60">bKash</span>
                  )}
                  {settings.enableNagadBadge && (
                    <span className="px-2 py-0.5 bg-amber-950/70 text-amber-300 rounded border border-amber-900/60">Nagad</span>
                  )}
                </div>
              </div>
            </div>

            {/* Preview Bottom Bar */}
            <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
              <div>{settings.copyrightText}</div>
              <div className="flex items-center gap-3">
                {settings.bottomLinks.map((bl) => (
                  <span key={bl.id} className="hover:text-slate-300">{bl.label}</span>
                ))}
                <span>{settings.attributionText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-8 py-3.5 bg-[#008B47] hover:bg-emerald-600 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save All Footer Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Robust, Full CRUD Manager Component for any Footer Column
 */
function FooterLinkCrudManager({
  columnNumber,
  columnTitle,
  onUpdateColumnTitle,
  links,
  onUpdateLinks,
  quickPresets,
  showNotification,
  badgeLabel,
  hideTitleEdit = false,
}: {
  columnNumber: string;
  columnTitle: string;
  onUpdateColumnTitle?: (val: string) => void;
  links: FooterLinkItem[];
  onUpdateLinks: (links: FooterLinkItem[]) => void;
  quickPresets?: { label: string; url: string }[];
  showNotification: (msg: string) => void;
  badgeLabel?: string;
  hideTitleEdit?: boolean;
}) {
  // Add new link state
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const handleAddLink = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newLabel.trim()) {
      showNotification("Please enter a link label");
      return;
    }
    if (!newUrl.trim()) {
      showNotification("Please enter a target URL");
      return;
    }

    const newLink: FooterLinkItem = {
      id: `fl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: newLabel.trim(),
      url: newUrl.trim(),
    };

    onUpdateLinks([...links, newLink]);
    setNewLabel("");
    setNewUrl("");
    showNotification(`Added "${newLink.label}" to ${badgeLabel || columnNumber}`);
  };

  const handleStartEdit = (link: FooterLinkItem) => {
    setEditingId(link.id);
    setEditLabel(link.label);
    setEditUrl(link.url);
  };

  const handleSaveEdit = (id: string) => {
    if (!editLabel.trim() || !editUrl.trim()) {
      showNotification("Label and URL cannot be empty");
      return;
    }

    const updated = links.map((l) =>
      l.id === id ? { ...l, label: editLabel.trim(), url: editUrl.trim() } : l
    );
    onUpdateLinks(updated);
    setEditingId(null);
    showNotification(`Updated link "${editLabel.trim()}"`);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditLabel("");
    setEditUrl("");
  };

  const handleDelete = (id: string, label: string) => {
    const updated = links.filter((l) => l.id !== id);
    onUpdateLinks(updated);
    showNotification(`Removed link "${label}"`);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const newLinks = [...links];
    const [movedItem] = newLinks.splice(index, 1);
    newLinks.splice(targetIndex, 0, movedItem);
    onUpdateLinks(newLinks);
  };

  const handleApplyPreset = (preset: { label: string; url: string }) => {
    setNewLabel(preset.label);
    setNewUrl(preset.url);
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-xs">
      {/* Column Header & Title Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <span>{hideTitleEdit ? columnTitle : `Column ${columnNumber} Links`}</span>
            {badgeLabel && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                {links.length} Links
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Click ✏️ Edit or 🗑️ Delete to manage existing menu items.
          </p>
        </div>

        {!hideTitleEdit && onUpdateColumnTitle && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Header:</span>
            <input
              type="text"
              value={columnTitle}
              onChange={(e) => onUpdateColumnTitle(e.target.value)}
              placeholder="e.g. SHOP"
              className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs w-36 uppercase focus:bg-white focus:outline-none focus:border-[#008B47]"
            />
          </div>
        )}
      </div>

      {/* Link Items List (CRUD with Inline Editing) */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {links.map((link, idx) => {
          const isEditing = editingId === link.id;

          if (isEditing) {
            return (
              <div
                key={link.id}
                className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-300 ring-2 ring-emerald-500/10 space-y-2.5 animate-in fade-in"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Editing Link #{idx + 1}</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Link Label</label>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="e.g. Trending Now"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-[#008B47]/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Target URL / Route</label>
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      placeholder="e.g. /shop?filter=trending"
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#008B47]/20"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(link.id)}
                    className="px-4 py-1.5 rounded-xl bg-[#008B47] hover:bg-emerald-600 text-white font-extrabold text-[11px] shadow-xs flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save Link</span>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={link.id}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 transition group"
            >
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="w-5 h-5 rounded-lg bg-slate-200 text-slate-600 font-black text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-900 text-xs truncate flex items-center gap-1.5">
                    <span>{link.label}</span>
                    {link.url.startsWith("http") && (
                      <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{link.url}</div>
                </div>
              </div>

              {/* Action Buttons: Move Up, Move Down, Edit, Delete */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(idx, "up")}
                  disabled={idx === 0}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-25 transition"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, "down")}
                  disabled={idx === links.length - 1}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-25 transition"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStartEdit(link)}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#008B47] hover:border-emerald-300 transition shadow-2xs"
                  title="Edit Link"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(link.id, link.label)}
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition shadow-2xs"
                  title="Delete Link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {links.length === 0 && (
          <div className="py-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
            No links in this column. Add your first link below.
          </div>
        )}
      </div>

      {/* Quick Presets Pills */}
      {quickPresets && quickPresets.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            1-Click Preset Shortcuts:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickPresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-600 text-[10px] font-semibold transition border border-slate-200/80"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add New Link Section */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="font-extrabold text-slate-800 text-xs">Add New Link to Column</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Link Label (e.g. Flash Deals)..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
          />
          <input
            type="text"
            placeholder="Target URL (e.g. /shop?filter=flash)..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-[#008B47]"
          />
        </div>
        <button
          type="button"
          onClick={() => handleAddLink()}
          className="w-full py-2.5 bg-slate-900 hover:bg-[#008B47] text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Link Item</span>
        </button>
      </div>
    </div>
  );
}
