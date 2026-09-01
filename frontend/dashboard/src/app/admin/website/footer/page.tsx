"use client";

import React, { useState } from "react";
import { useFooterStore, FooterLinkItem, FooterSettings } from "@/store/useFooterStore";
import { ImageUploader } from "@/components/admin/ImageUploader";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
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
  X,
  Eye,
  ShieldCheck,
  Loader2,
} from "lucide-react";

/* ─── presets ──────────────────────────────────────────────────── */
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

/* ─── small shared primitives ───────────────────────────────────── */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 text-xs">
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  right,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-3">
      <div>
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </h2>
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="font-bold text-slate-700 text-xs">{children}</label>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
    />
  );
}

function IconInput({ icon, value, onChange, placeholder, type = "text" }: {
  icon: React.ReactNode; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500 transition"
      />
    </div>
  );
}

/* ─── link CRUD manager ─────────────────────────────────────────── */
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
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editUrl, setEditUrl] = useState("");

  const handleAddLink = () => {
    if (!newLabel.trim()) { showNotification("Please enter a link label"); return; }
    if (!newUrl.trim()) { showNotification("Please enter a target URL"); return; }
    const newLink: FooterLinkItem = {
      id: `fl-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      label: newLabel.trim(),
      url: newUrl.trim(),
    };
    onUpdateLinks([...links, newLink]);
    setNewLabel("");
    setNewUrl("");
    showNotification(`Added "${newLink.label}"`);
  };

  const handleSaveEdit = (id: string) => {
    if (!editLabel.trim() || !editUrl.trim()) {
      showNotification("Label and URL cannot be empty");
      return;
    }
    onUpdateLinks(links.map(l => l.id === id ? { ...l, label: editLabel.trim(), url: editUrl.trim() } : l));
    setEditingId(null);
    showNotification(`Updated link "${editLabel.trim()}"`);
  };

  const handleDelete = (id: string, label: string) => {
    onUpdateLinks(links.filter(l => l.id !== id));
    showNotification(`Removed link "${label}"`);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= links.length) return;
    const next = [...links];
    [next[index], next[target]] = [next[target], next[index]];
    onUpdateLinks(next);
  };

  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <span>{hideTitleEdit ? columnTitle : `Column ${columnNumber} Links`}</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
              {links.length} Links
            </span>
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
              onChange={e => onUpdateColumnTitle(e.target.value)}
              placeholder="e.g. SHOP"
              className="px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs w-36 uppercase focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {/* Link list */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {links.map((link, idx) => {
          if (editingId === link.id) {
            return (
              <div key={link.id} className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-300 ring-2 ring-emerald-500/10 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                  <span className="flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5 text-emerald-600" />
                    Editing Link #{idx + 1}
                  </span>
                  <button type="button" onClick={() => setEditingId(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Link Label</label>
                    <input
                      type="text"
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-600">Target URL</label>
                    <input
                      type="text"
                      value={editUrl}
                      onChange={e => setEditUrl(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-[11px]">
                    Cancel
                  </button>
                  <button type="button" onClick={() => handleSaveEdit(link.id)} className="px-4 py-1.5 rounded-xl bg-[#008B47] text-white font-extrabold text-[11px] flex items-center gap-1">
                    <Check className="w-3 h-3" /> Save Link
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={link.id} className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/80 transition group">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="w-5 h-5 rounded-lg bg-slate-200 text-slate-600 font-black text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-900 text-xs truncate flex items-center gap-1.5">
                    {link.label}
                    {link.url.startsWith("http") && <ExternalLink className="w-2.5 h-2.5 text-slate-400 shrink-0" />}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">{link.url}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" onClick={() => handleMove(idx, "up")} disabled={idx === 0} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-25 transition" title="Move Up">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleMove(idx, "down")} disabled={idx === links.length - 1} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white disabled:opacity-25 transition" title="Move Down">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => { setEditingId(link.id); setEditLabel(link.label); setEditUrl(link.url); }} className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#008B47] hover:border-emerald-300 transition shadow-2xs">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => handleDelete(link.id, link.label)} className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition shadow-2xs">
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

      {/* Quick presets */}
      {quickPresets && quickPresets.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">1-Click Preset Shortcuts:</span>
          <div className="flex flex-wrap gap-1.5">
            {quickPresets.map(preset => (
              <button key={preset.label} type="button" onClick={() => { setNewLabel(preset.label); setNewUrl(preset.url); }}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-900 text-slate-600 text-[10px] font-semibold transition border border-slate-200/80">
                + {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add new link */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <div className="font-extrabold text-slate-800 text-xs">Add New Link to Column</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Link Label (e.g. Flash Deals)..."
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddLink()}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Target URL (e.g. /shop?filter=flash)..."
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAddLink()}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
          />
        </div>
        <button type="button" onClick={handleAddLink}
          className="w-full py-2.5 bg-slate-900 hover:bg-[#008B47] text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition shadow-xs">
          <Plus className="w-3.5 h-3.5" />
          Add Link Item
        </button>
      </div>
    </div>
  );
}

/* ─── page ──────────────────────────────────────────────────────── */
export default function AdminFooterPage() {
  const { settings, isLoading, isSaving, error, setField, saveSettings, resetToDefaults } = useFooterStore();
  const [activeDeviceTab, setActiveDeviceTab] = useState<"desktop" | "mobile">("desktop");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      await saveSettings();
      showToast("Footer settings saved to store!");
    } catch {
      showToast("Failed to save. Please try again.", false);
    }
  }

  async function handleReset() {
    if (!confirm("Reset all footer settings to default?")) return;
    try {
      await resetToDefaults();
      showToast("Footer settings reset to defaults.");
    } catch {
      showToast("Failed to reset.", false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading footer settings…
      </div>
    );
  }

  // Assurance pillars always has 4 slots; merge defaults if stored value has fewer
  const defaultPillars = [
    { title: "Fast Delivery", subtitle: "All across Bangladesh", iconName: "Truck" },
    { title: "Quality Checked", subtitle: "100% inspected items", iconName: "ShieldCheck" },
    { title: "7-Day Easy Return", subtitle: "Hassle-free guarantee", iconName: "RotateCcw" },
    { title: "24/7 Live Support", subtitle: `Call ${settings.phone || "our hotline"}`, iconName: "Headphones" },
  ];
  const pillars = Array.from({ length: 4 }, (_, i) => ({
    ...defaultPillars[i],
    ...(settings.assurancePillars?.[i] ?? {}),
  }));

  return (
    <form onSubmit={handleSave} className="space-y-6 w-full pb-16">

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Globe className="w-7 h-7 text-[#008B47]" />
            Footer Menu &amp; Layout Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Full CRUD management for footer link columns, policy menus, Computer &amp; Mobile logo sizing, and payment badges.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button type="button" onClick={handleReset} disabled={isSaving}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold disabled:opacity-50 transition">
            Reset Defaults
          </button>
          <button type="submit" disabled={isSaving}
            className="px-5 py-2.5 bg-[#008B47] hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {isSaving ? "Saving…" : "Save All Changes"}
          </button>
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────────────── */}
      {toast && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
          toast.ok ? "bg-emerald-50 border border-emerald-200 text-emerald-900" : "bg-red-50 border border-red-200 text-red-900"
        }`}>
          {toast.ok
            ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            : <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {error && !toast && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {error}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. COLUMN LAYOUT STRUCTURE                               */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<Sliders className="w-4 h-4 text-[#008B47]" />}
          title="Footer Column Layout Structure"
          subtitle="Select how many columns appear across the footer."
          right={
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold shrink-0">
              {settings.columnsCount} Columns Active
            </span>
          }
        />

        <div className="grid grid-cols-3 gap-3 max-w-md">
          {([3, 4, 5] as const).map(cols => (
            <button
              key={cols}
              type="button"
              onClick={() => setField("columnsCount", cols)}
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
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 2. TOP VALUE ASSURANCE BADGES                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<ShieldCheck className="w-4 h-4 text-[#008B47]" />}
          title="Top Footer Value Assurance Badges"
          subtitle="Customize the 4 customer trust badges displayed at the top of the footer."
          right={
            <label className="flex items-center gap-2 p-2 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer self-start shrink-0">
              <input
                type="checkbox"
                checked={settings.showTopAssuranceBanner}
                onChange={e => setField("showTopAssuranceBanner", e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-600"
              />
              <span className="font-extrabold text-slate-800 text-xs">
                {settings.showTopAssuranceBanner ? "✅ Enabled on Storefront" : "❌ Hidden"}
              </span>
            </label>
          }
        />

        {settings.showTopAssuranceBanner && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map((pillar, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 shadow-2xs">
                <div className="flex items-center gap-1.5 border-b border-slate-200/70 pb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-slate-800 text-xs">Assurance Badge #{idx + 1}</span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Badge Icon</label>
                  <select
                    value={pillar.iconName || "ShieldCheck"}
                    onChange={e => {
                      const updated = [...pillars];
                      updated[idx] = { ...updated[idx], iconName: e.target.value };
                      setField("assurancePillars", updated);
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-[#008B47] cursor-pointer"
                  >
                    <option value="Truck">🚚 Fast Truck / Delivery</option>
                    <option value="ShieldCheck">🛡️ Quality Checked / Shield</option>
                    <option value="RotateCcw">🔄 7-Day Easy Return</option>
                    <option value="Headphones">🎧 24/7 Live Support</option>
                    <option value="Sparkles">✨ Sparkles / Premium</option>
                    <option value="Banknote">💵 Cash on Delivery (COD)</option>
                    <option value="Award">🏆 Award Quality</option>
                    <option value="CheckCircle2">✅ Verified Guarantee</option>
                    <option value="Lock">🔒 Secure Payment</option>
                    <option value="Phone">📞 Direct Phone Call</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Main Title</label>
                  <input
                    type="text"
                    value={pillar.title}
                    onChange={e => {
                      const updated = [...pillars];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setField("assurancePillars", updated);
                    }}
                    placeholder="e.g. Fast Delivery"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-bold text-xs focus:outline-none focus:border-[#008B47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Subtitle / Guarantee Note</label>
                  <input
                    type="text"
                    value={pillar.subtitle}
                    onChange={e => {
                      const updated = [...pillars];
                      updated[idx] = { ...updated[idx], subtitle: e.target.value };
                      setField("assurancePillars", updated);
                    }}
                    placeholder="e.g. All across Bangladesh"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 3. COLUMN 1 – BRAND LOGO & STORE CONTACT                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<Sliders className="w-4 h-4 text-[#008B47]" />}
          title="Column 1: Brand Logo & Store Contact Info"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Logo side */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Footer Logo Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["TEXT", "IMAGE"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setField("brandLogoType", t)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      settings.brandLogoType === t
                        ? "bg-emerald-50 border-[#008B47] text-emerald-950 ring-1 ring-[#008B47]"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}>
                    {t === "TEXT" ? "Text Logo" : "Image Logo"}
                  </button>
                ))}
              </div>
            </div>

            {settings.brandLogoType === "TEXT" ? (
              <div className="space-y-1.5">
                <Label>Brand Title</Label>
                <TextInput value={settings.brandTitle} onChange={v => setField("brandTitle", v)} placeholder="Your Brand Name" />
                <div className="mt-2 flex items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-700">
                  <span className="font-extrabold text-white text-lg tracking-tight">{settings.brandTitle || "Brand"}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <ImageUploader
                  value={settings.brandLogoUrl}
                  onChange={url => setField("brandLogoUrl", url)}
                  label="Footer Logo Image"
                  recommendedDimensions="160×40 px PNG/SVG Transparent"
                />
                {settings.brandLogoUrl && (
                  <div className="flex items-center justify-center p-4 rounded-2xl bg-slate-900 border border-slate-700">
                    <img src={settings.brandLogoUrl} alt="Footer logo preview"
                      style={{ maxHeight: `${settings.brandLogoHeight}px`, maxWidth: `${settings.brandLogoWidth}px` }}
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Brand Description Statement</Label>
              <textarea
                rows={3}
                value={settings.description}
                onChange={e => setField("description", e.target.value)}
                placeholder="Short brand tagline shown under the logo in the footer."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition resize-none"
              />
            </div>
          </div>

          {/* Contact side */}
          <div className="space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6 pt-4 lg:pt-0">
            <div className="space-y-1.5">
              <Label>Store Address</Label>
              <IconInput icon={<MapPin className="w-4 h-4" />} value={settings.address} onChange={v => setField("address", v)} placeholder="Dhaka, Bangladesh" />
            </div>
            <div className="space-y-1.5">
              <Label>Phone Hotline</Label>
              <IconInput icon={<Phone className="w-4 h-4" />} value={settings.phone} onChange={v => setField("phone", v)} placeholder="01712-345678" />
            </div>
            <div className="space-y-1.5">
              <Label>Support Email</Label>
              <IconInput icon={<Mail className="w-4 h-4" />} value={settings.email} onChange={v => setField("email", v)} placeholder="support@toolera.store" type="email" />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 4. LOGO DIMENSIONS (shown only when IMAGE logo selected) */}
      {/* ══════════════════════════════════════════════════════════ */}
      {settings.brandLogoType === "IMAGE" && (
        <SectionCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#008B47]" />
                Responsive Footer Logo Dimensions
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Configure separate logo dimensions for Computer and Mobile devices.</p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start shrink-0">
              {(["desktop", "mobile"] as const).map(tab => (
                <button key={tab} type="button" onClick={() => setActiveDeviceTab(tab)}
                  className={`px-4 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                    activeDeviceTab === tab ? "bg-white text-emerald-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}>
                  {tab === "desktop" ? <Monitor className="w-3.5 h-3.5 text-[#008B47]" /> : <Smartphone className="w-3.5 h-3.5 text-[#008B47]" />}
                  {tab === "desktop" ? "Computer / Desktop" : "Mobile Device"}
                </button>
              ))}
            </div>
          </div>

          {activeDeviceTab === "desktop" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Desktop Logo Max Width (px)</Label>
                  <input type="number" value={settings.brandLogoWidth} onChange={e => setField("brandLogoWidth", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:border-emerald-500" />
                  <span className="text-[10px] text-slate-400">Default: 160px</span>
                </div>
                <div className="space-y-1">
                  <Label>Desktop Logo Max Height (px)</Label>
                  <input type="number" value={settings.brandLogoHeight} onChange={e => setField("brandLogoHeight", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:border-emerald-500" />
                  <span className="text-[10px] text-slate-400">Default: 40px</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Desktop Preview ({settings.brandLogoWidth}×{settings.brandLogoHeight}px)
                </div>
                <div className="p-3 bg-slate-900 rounded-xl inline-block">
                  {settings.brandLogoUrl
                    ? <img src={settings.brandLogoUrl} alt="Desktop logo preview" style={{ maxHeight: `${settings.brandLogoHeight}px`, maxWidth: `${settings.brandLogoWidth}px` }} className="object-contain" />
                    : <span className="font-bold text-white text-base">{settings.brandTitle || "Brand"}</span>
                  }
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Mobile Logo Max Width (px)</Label>
                  <input type="number" value={settings.mobileBrandLogoWidth} onChange={e => setField("mobileBrandLogoWidth", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:border-emerald-500" />
                  <span className="text-[10px] text-slate-400">Recommended: 100px – 130px</span>
                </div>
                <div className="space-y-1">
                  <Label>Mobile Logo Max Height (px)</Label>
                  <input type="number" value={settings.mobileBrandLogoHeight} onChange={e => setField("mobileBrandLogoHeight", Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-xs focus:bg-white focus:outline-none focus:border-emerald-500" />
                  <span className="text-[10px] text-slate-400">Recommended: 28px – 36px</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Mobile Preview ({settings.mobileBrandLogoWidth}×{settings.mobileBrandLogoHeight}px)
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl inline-block">
                  {settings.brandLogoUrl
                    ? <img src={settings.brandLogoUrl} alt="Mobile logo preview" style={{ maxHeight: `${settings.mobileBrandLogoHeight}px`, maxWidth: `${settings.mobileBrandLogoWidth}px` }} className="object-contain" />
                    : <span className="font-bold text-white text-xs">{settings.brandTitle || "Brand"}</span>
                  }
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 5. COLUMN 2 & 3 LINK MANAGERS                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FooterLinkCrudManager
          columnNumber="2"
          columnTitle={settings.col2Title}
          onUpdateColumnTitle={v => setField("col2Title", v)}
          links={settings.col2Links}
          onUpdateLinks={v => setField("col2Links", v)}
          quickPresets={SHOP_PRESETS}
          showNotification={msg => showToast(msg)}
          badgeLabel="Shop Menu"
        />
        <FooterLinkCrudManager
          columnNumber="3"
          columnTitle={settings.col3Title}
          onUpdateColumnTitle={v => setField("col3Title", v)}
          links={settings.col3Links}
          onUpdateLinks={v => setField("col3Links", v)}
          quickPresets={CUSTOMER_CARE_PRESETS}
          showNotification={msg => showToast(msg)}
          badgeLabel="Customer Care"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 6. COLUMN 4 – PAYMENT OPTIONS & DELIVERY                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<CreditCard className="w-4 h-4 text-[#008B47]" />}
          title="Column 4: Payment Options & Delivery Hotline"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: "enableCodBadge" as const, label: "Cash on Delivery (COD)" },
            { key: "enableBkashBadge" as const, label: "bKash Merchant Pay" },
            { key: "enableNagadBadge" as const, label: "Nagad Payment" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
              <input type="checkbox" checked={settings[key]} onChange={e => setField(key, e.target.checked)} className="w-4 h-4 rounded accent-emerald-600" />
              <span className="font-bold text-slate-900">{label}</span>
            </label>
          ))}
        </div>

        <div className="space-y-1.5 pt-1">
          <Label>Delivery Hours / Note</Label>
          <TextInput value={settings.deliveryHours} onChange={v => setField("deliveryHours", v)} placeholder="e.g. Delivered within 1–3 business days" />
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 7. BOTTOM BAR & POLICY LINKS                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <SectionCard>
        <SectionHeader
          icon={<ShieldCheck className="w-4 h-4 text-[#008B47]" />}
          title="Footer Bottom Bar & Policy Links"
          subtitle="Manage copyright statement and bottom legal links."
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Copyright Notice Text</Label>
              <TextInput value={settings.copyrightText} onChange={v => setField("copyrightText", v)} placeholder="© 2025 Toolera. All rights reserved." />
            </div>
            <div className="space-y-1.5">
              <Label>Attribution / Sub-Note</Label>
              <TextInput value={settings.attributionText} onChange={v => setField("attributionText", v)} placeholder="Powered by Toolera Platform" />
            </div>
          </div>

          <FooterLinkCrudManager
            columnNumber="Bottom Bar"
            columnTitle="Legal & Policy Links"
            links={settings.bottomLinks}
            onUpdateLinks={v => setField("bottomLinks", v)}
            quickPresets={BOTTOM_BAR_PRESETS}
            showNotification={msg => showToast(msg)}
            badgeLabel="Bottom Bar"
            hideTitleEdit
          />
        </div>
      </SectionCard>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 8. LIVE STOREFRONT FOOTER PREVIEW                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-extrabold text-sm">
            <Eye className="w-4 h-4 text-emerald-400" />
            Live Storefront Footer Preview
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
            Real-time Output
          </span>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-6 text-slate-400 space-y-6">
          <div className={`grid gap-8 ${
            settings.columnsCount === 3 ? "grid-cols-1 md:grid-cols-3"
              : settings.columnsCount === 4 ? "grid-cols-1 md:grid-cols-4"
              : "grid-cols-1 md:grid-cols-5"
          }`}>
            {/* Col 1 */}
            <div className="space-y-3">
              {settings.brandLogoType === "IMAGE" && settings.brandLogoUrl ? (
                <img src={settings.brandLogoUrl} alt="Preview" style={{ maxHeight: `${settings.brandLogoHeight}px`, maxWidth: `${settings.brandLogoWidth}px` }} className="object-contain" />
              ) : (
                <span className="text-lg font-black text-white">{settings.brandTitle || "BRAND"}</span>
              )}
              {settings.description && <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">{settings.description}</p>}
              <div className="text-[10px] space-y-1 text-slate-500">
                {settings.phone && <div>📞 {settings.phone}</div>}
                {settings.email && <div>✉️ {settings.email}</div>}
                {settings.address && <div>📍 {settings.address}</div>}
              </div>
            </div>

            {/* Col 2 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">{settings.col2Title || "SHOP"}</h4>
              <ul className="space-y-1.5 text-[11px]">
                {(settings.col2Links ?? []).map(l => (
                  <li key={l.id} className="hover:text-white transition cursor-default">{l.label}</li>
                ))}
                {(settings.col2Links ?? []).length === 0 && <li className="text-slate-600 italic">No links added</li>}
              </ul>
            </div>

            {/* Col 3 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">{settings.col3Title || "CUSTOMER CARE"}</h4>
              <ul className="space-y-1.5 text-[11px]">
                {(settings.col3Links ?? []).map(l => (
                  <li key={l.id} className="hover:text-white transition cursor-default">{l.label}</li>
                ))}
                {(settings.col3Links ?? []).length === 0 && <li className="text-slate-600 italic">No links added</li>}
              </ul>
            </div>

            {/* Col 4 */}
            <div className="space-y-2">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider">{settings.col4Title || "PAYMENT OPTIONS"}</h4>
              {settings.deliveryHours && <p className="text-[10px] text-slate-400">{settings.deliveryHours}</p>}
              <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-bold">
                {settings.enableCodBadge && <span className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800">COD</span>}
                {settings.enableBkashBadge && <span className="px-2 py-0.5 bg-rose-950/70 text-rose-300 rounded border border-rose-900/60">bKash</span>}
                {settings.enableNagadBadge && <span className="px-2 py-0.5 bg-amber-950/70 text-amber-300 rounded border border-amber-900/60">Nagad</span>}
              </div>
            </div>

            {/* Col 5 — only shown if 5 columns selected */}
            {settings.columnsCount === 5 && (
              <div className="space-y-2">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">{settings.col5Title || "MORE"}</h4>
                <ul className="space-y-1.5 text-[11px]">
                  {(settings.col5Links ?? []).map(l => (
                    <li key={l.id} className="hover:text-white transition cursor-default">{l.label}</li>
                  ))}
                  {(settings.col5Links ?? []).length === 0 && <li className="text-slate-600 italic">No links added</li>}
                </ul>
              </div>
            )}
          </div>

          {/* Bottom bar preview */}
          <div className="border-t border-slate-800/80 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
            <div>{settings.copyrightText || "© 2025 Toolera"}</div>
            <div className="flex items-center gap-3 flex-wrap">
              {(settings.bottomLinks ?? []).map(bl => (
                <span key={bl.id} className="hover:text-slate-300">{bl.label}</span>
              ))}
              {settings.attributionText && <span>{settings.attributionText}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Save */}
      <div className="pt-2 flex items-center justify-end">
        <button type="submit" disabled={isSaving}
          className="px-8 py-3.5 bg-[#008B47] hover:bg-emerald-600 disabled:opacity-60 text-white font-black text-xs rounded-2xl shadow-md transition flex items-center gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {isSaving ? "Saving…" : "Save All Footer Settings"}
        </button>
      </div>

      {/* Sticky mobile save bar */}
      <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white border-t border-slate-200 px-4 py-3 z-40">
        <button type="submit" disabled={isSaving}
          className="w-full py-2.5 bg-[#008B47] hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {isSaving ? "Saving…" : "Save All Changes"}
        </button>
      </div>
    </form>
  );
}
