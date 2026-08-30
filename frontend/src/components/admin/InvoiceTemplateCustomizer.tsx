"use client";

import React, { useState } from "react";
import {
  FileText,
  Palette,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle2,
  Printer,
  ShieldCheck,
  ShoppingBag,
  Image as ImageIcon,
  Heart,
  Phone,
  Mail,
  Truck,
  Eye,
  Sliders,
  UploadCloud,
  Layers,
  Trash2,
  X,
} from "lucide-react";
import { useInvoiceSettingsStore, DEFAULT_INVOICE_SETTINGS, InvoiceSettings } from "@/store/useInvoiceSettingsStore";
import OrderInvoiceDocument from "@/components/admin/OrderInvoiceDocument";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { OrderItem } from "@/store/useOrderStore";

const SAMPLE_ORDER: OrderItem = {
  id: "RM-786598-8988",
  customer: "MD RAFIQUL ISLAM",
  phone: "01647221566",
  address: "Shapla, Rangpur Bangladesh, dbam, Rangpur",
  district: "Rangpur",
  items: [
    {
      title: "Mini Glass Battery-Operated Candle Light",
      qty: 1,
      price: 130,
      image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=300&auto=format&fit=crop&q=80",
    },
  ],
  total: 260,
  payment: "Cash on Delivery",
  status: "PROCESSING",
  time: "2025-05-18T10:30:00.000Z",
  shippingCost: 130,
  vatAmount: 7,
};

const ACCENT_COLORS = [
  { name: "Emerald Green", hex: "#005A2B", bgClass: "bg-[#005A2B]" },
  { name: "Royal Blue", hex: "#1E40AF", bgClass: "bg-[#1E40AF]" },
  { name: "Crimson Red", hex: "#B91C1C", bgClass: "bg-[#B91C1C]" },
  { name: "Modern Charcoal", hex: "#0F172A", bgClass: "bg-[#0F172A]" },
  { name: "Sunset Amber", hex: "#D97706", bgClass: "bg-[#D97706]" },
];

export default function InvoiceTemplateCustomizer() {
  const storeSettings = useInvoiceSettingsStore();
  const [localSettings, setLocalSettings] = useState<InvoiceSettings>({ ...storeSettings });
  const [activeConfigSection, setActiveConfigSection] = useState<"TEMPLATE" | "BRAND" | "TRUST" | "FOOTER">("TEMPLATE");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdate = (field: keyof InvoiceSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    storeSettings.updateSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Reset invoice settings to default Raifa's Mart template?")) {
      setLocalSettings({ ...DEFAULT_INVOICE_SETTINGS });
      storeSettings.resetDefaults();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#005A2B] border border-emerald-100 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Invoice Templates &amp; Customizer
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize your store logo, header, trust badges, footer info, and choose from multiple templates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#005A2B] hover:bg-[#004D25] text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Saved Successfully!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Invoice Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (5 cols) & Right Live Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ============================================================== */}
        {/* LEFT COLUMN: CUSTOMIZATION SETTINGS TABS & INPUTS              */}
        {/* ============================================================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* Sub-Navigation Pills */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveConfigSection("TEMPLATE")}
              className={`py-2 rounded-xl transition ${
                activeConfigSection === "TEMPLATE"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Layout
            </button>
            <button
              type="button"
              onClick={() => setActiveConfigSection("BRAND")}
              className={`py-2 rounded-xl transition ${
                activeConfigSection === "BRAND"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Brand
            </button>
            <button
              type="button"
              onClick={() => setActiveConfigSection("TRUST")}
              className={`py-2 rounded-xl transition ${
                activeConfigSection === "TRUST"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Badges
            </button>
            <button
              type="button"
              onClick={() => setActiveConfigSection("FOOTER")}
              className={`py-2 rounded-xl transition ${
                activeConfigSection === "FOOTER"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Footer
            </button>
          </div>

          {/* Section 1: Template Layout & Theme Colors */}
          {activeConfigSection === "TEMPLATE" && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5 text-xs">
              <div className="space-y-1">
                <span className="font-extrabold text-slate-900 text-sm block">Invoice Layout Design</span>
                <p className="text-slate-400 text-xs">Choose the visual architecture for printed &amp; PDF invoices.</p>
              </div>

              {/* Template Cards */}
              <div className="space-y-2.5">
                {[
                  {
                    id: "EMERALD",
                    title: "Emerald Modern (Recommended)",
                    desc: "Official Raifa's Mart design with rich green headers, verified seller card, and clean typography.",
                    badge: "Default Design",
                  },
                  {
                    id: "CLASSIC",
                    title: "Classic Corporate",
                    desc: "Monochromatic formal theme with slate headers and sharp border structure.",
                    badge: "Minimal",
                  },
                  {
                    id: "MODERN_MINIMAL",
                    title: "Modern Retail POS",
                    desc: "Airy, high-legibility layout optimized for fast packing and clear barcode reading.",
                    badge: "Compact",
                  },
                ].map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => handleUpdate("templateId", tmpl.id)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-start justify-between gap-3 ${
                      localSettings.templateId === tmpl.id
                        ? "border-[#005A2B] bg-emerald-50/40 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-xs">{tmpl.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{tmpl.desc}</p>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border-2 mt-1 shrink-0 flex items-center justify-center ${
                        localSettings.templateId === tmpl.id
                          ? "border-[#005A2B] bg-[#005A2B]"
                          : "border-slate-300"
                      }`}
                    >
                      {localSettings.templateId === tmpl.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Brand Accent Color Swatches */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="font-extrabold text-slate-900 text-xs block">Brand Accent Theme Color</span>
                <div className="grid grid-cols-5 gap-2">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => handleUpdate("accentColor", c.hex)}
                      className={`p-2 rounded-xl border-2 flex flex-col items-center gap-1 transition ${
                        localSettings.accentColor === c.hex
                          ? "border-slate-900 bg-slate-50 shadow-2xs"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full ${c.bgClass} shadow-xs`} />
                      <span className="text-[9px] font-bold text-slate-600 truncate w-full text-center">
                        {c.name.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Store / Brand Details */}
          {activeConfigSection === "BRAND" && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-5 text-xs">
              <div className="space-y-1">
                <span className="font-extrabold text-slate-900 text-sm block">Store Logo &amp; Identity</span>
                <p className="text-slate-400 text-xs">Configure how your logo and brand title appear in the header.</p>
              </div>

              {/* Logo Display Mode Switcher */}
              <div className="space-y-2">
                <label className="font-bold text-slate-800 block">Header Logo Display Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: "LOGO_AND_TEXT",
                      label: "Logo & Text",
                      sub: "Icon + Store Name",
                    },
                    {
                      id: "LOGO_ONLY",
                      label: "Logo Only",
                      sub: "Full Logo Banner",
                    },
                    {
                      id: "TEXT_ONLY",
                      label: "Text Only",
                      sub: "Brand Typography",
                    },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleUpdate("logoDisplayMode", mode.id)}
                      className={`p-2.5 rounded-xl border-2 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                        localSettings.logoDisplayMode === mode.id
                          ? "border-[#005A2B] bg-emerald-50/50 text-[#005A2B] shadow-2xs font-black"
                          : "border-slate-200 hover:border-slate-300 text-slate-600 font-bold"
                      }`}
                    >
                      <span className="text-xs block">{mode.label}</span>
                      <span className="text-[9px] text-slate-400 font-normal block mt-0.5">{mode.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload & Configuration (Visible when not TEXT_ONLY) */}
              {localSettings.logoDisplayMode !== "TEXT_ONLY" && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 block text-xs">Custom Logo Graphic</span>
                    <button
                      type="button"
                      onClick={() => setIsMediaModalOpen(true)}
                      className="px-3 py-1.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>+ Open Media Library</span>
                    </button>
                  </div>

                  {/* Dropzone identical to Add Products */}
                  <div
                    onClick={() => setIsMediaModalOpen(true)}
                    className="p-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#008B47] bg-white hover:bg-emerald-50/20 transition cursor-pointer flex flex-col items-center justify-center gap-2 text-center group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008B47] border border-emerald-100 flex items-center justify-center shadow-2xs group-hover:scale-110 transition">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-800 text-xs group-hover:text-[#008B47] block">
                        Click to select or upload logo from Media Library
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        Same unified media library as Add Products
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail & Direct URL Row */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                      {localSettings.companyLogo ? (
                        <img
                          src={localSettings.companyLogo}
                          alt="Logo Preview"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        type="text"
                        value={localSettings.companyLogo}
                        onChange={(e) => handleUpdate("companyLogo", e.target.value)}
                        placeholder="Logo URL or /assets/favicon.png"
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono text-xs text-slate-700 outline-none focus:border-[#005A2B]"
                      />
                    </div>

                    {localSettings.companyLogo && (
                      <button
                        type="button"
                        onClick={() => handleUpdate("companyLogo", "")}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                        title="Remove Logo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Logo Size / Height Slider */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                      <span>Logo Display Height</span>
                      <span className="font-mono text-[#005A2B]">{localSettings.logoHeight || 48}px</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="85"
                      step="2"
                      value={localSettings.logoHeight || 48}
                      onChange={(e) => handleUpdate("logoHeight", Number(e.target.value))}
                      className="w-full accent-[#005A2B] cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Text Information Details (Visible when not LOGO_ONLY) */}
              <div className="space-y-3 pt-1">
                {localSettings.logoDisplayMode !== "LOGO_ONLY" && (
                  <>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Company / Store Name</label>
                      <input
                        type="text"
                        value={localSettings.companyName}
                        onChange={(e) => handleUpdate("companyName", e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs outline-none focus:border-[#005A2B]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Store Tagline / Slogan</label>
                      <input
                        type="text"
                        value={localSettings.companyTagline}
                        onChange={(e) => handleUpdate("companyTagline", e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs outline-none focus:border-[#005A2B]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Store / Warehouse Address</label>
                  <input
                    type="text"
                    value={localSettings.companyAddress}
                    onChange={(e) => handleUpdate("companyAddress", e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs outline-none focus:border-[#005A2B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Helpline / Hotline</label>
                    <input
                      type="text"
                      value={localSettings.companyHotline}
                      onChange={(e) => handleUpdate("companyHotline", e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-700 outline-none focus:border-[#005A2B]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Support Email</label>
                    <input
                      type="text"
                      value={localSettings.companyEmail}
                      onChange={(e) => handleUpdate("companyEmail", e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none focus:border-[#005A2B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Trust & Verification Badges */}
          {activeConfigSection === "TRUST" && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-extrabold text-slate-900 text-sm block">Trust Badges &amp; Signatures</span>
                <p className="text-slate-400 text-xs">Build immediate confidence on delivery &amp; COD.</p>
              </div>

              {/* Verified Badge Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-bold text-slate-900">Show "Verified Seller" Badge</span>
                  <input
                    type="checkbox"
                    checked={localSettings.verifiedSellerBadge}
                    onChange={(e) => handleUpdate("verifiedSellerBadge", e.target.checked)}
                    className="w-4 h-4 text-[#005A2B] rounded border-slate-300 focus:ring-[#005A2B]"
                  />
                </label>

                {localSettings.verifiedSellerBadge && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                    <input
                      type="text"
                      value={localSettings.verifiedSellerText}
                      onChange={(e) => handleUpdate("verifiedSellerText", e.target.value)}
                      placeholder="Title"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                    />
                    <input
                      type="text"
                      value={localSettings.verifiedSellerSubText}
                      onChange={(e) => handleUpdate("verifiedSellerSubText", e.target.value)}
                      placeholder="Subtext"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Thank you note & Signatory */}
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thank You Title</label>
                  <input
                    type="text"
                    value={localSettings.thankYouHeading}
                    onChange={(e) => handleUpdate("thankYouHeading", e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thank You Note Subtext</label>
                  <input
                    type="text"
                    value={localSettings.thankYouMessage}
                    onChange={(e) => handleUpdate("thankYouMessage", e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Signatory Cursive Name</label>
                    <input
                      type="text"
                      value={localSettings.signatoryName}
                      onChange={(e) => handleUpdate("signatoryName", e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-serif italic text-slate-900 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Signatory Designation</label>
                    <input
                      type="text"
                      value={localSettings.signatoryRole}
                      onChange={(e) => handleUpdate("signatoryRole", e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Footer Info & Social Links */}
          {activeConfigSection === "FOOTER" && (
            <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-extrabold text-slate-900 text-sm block">Footer Columns &amp; Socials</span>
                <p className="text-slate-400 text-xs">Customer support links and trust statements.</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Trust Statement 1</label>
                    <input
                      type="text"
                      value={localSettings.trustBadge1}
                      onChange={(e) => handleUpdate("trustBadge1", e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Trust Statement 2</label>
                    <input
                      type="text"
                      value={localSettings.trustBadge2}
                      onChange={(e) => handleUpdate("trustBadge2", e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bottom Banner Copyright Text</label>
                  <input
                    type="text"
                    value={localSettings.footerNote}
                    onChange={(e) => handleUpdate("footerNote", e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* RIGHT COLUMN: LIVE REAL-TIME INVOICE PREVIEW                   */}
        {/* ============================================================== */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#005A2B]" />
              <span className="font-extrabold text-slate-900">Live Dynamic Preview</span>
              <span className="text-slate-400">(Updates instantly with your brand settings)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-100/80 text-[#005A2B] font-bold text-[10px]">
              Exact Single-Page Print Ready
            </span>
          </div>

          {/* Actual Rendered Document with live overrides */}
          <div className="bg-slate-100 p-3 sm:p-4 rounded-3xl border border-slate-200 shadow-inner">
            <OrderInvoiceDocument
              order={SAMPLE_ORDER}
              overrideSettings={localSettings}
            />
          </div>
        </div>
      </div>

      {/* Unified Media Library Modal (Identical to Add Products) */}
      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={(url) => {
          handleUpdate("companyLogo", url);
          setIsMediaModalOpen(false);
        }}
        multiple={false}
        title="Select or Upload Store Logo"
        buttonLabel="Set as Invoice Logo"
        initialSelectedUrl={localSettings.companyLogo}
        recommendedDimensions="Recommended: Square or transparent PNG (e.g. 500x500px)"
      />
    </div>
  );
}
