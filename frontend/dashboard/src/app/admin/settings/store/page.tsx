"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  Palette,
  Phone,
  Truck,
  CreditCard,
  Search,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Save,
  Globe,
  Sliders,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";

export default function StoreSettingsPage() {
  const { activeStore, updateStore, isPaymentPending } = useTenantStore();
  const [activeTab, setActiveTab] = useState<"general" | "branding" | "contact" | "delivery" | "payments" | "danger">("general");

  // Form states
  const [name, setName] = useState(activeStore?.name || "");
  const [slug, setSlug] = useState(activeStore?.slug || "");
  const [category, setCategory] = useState(activeStore?.category || "General Store");
  const [description, setDescription] = useState(activeStore?.description || "");
  const [tagline, setTagline] = useState(activeStore?.tagline || "Curated products for everyday lifestyle");

  // Contact
  const [email, setEmail] = useState(`support@${activeStore?.slug || "store"}.com`);
  const [phone, setPhone] = useState("+880 1700-000000");
  const [whatsapp, setWhatsapp] = useState("+880 1700-000000");
  const [address, setAddress] = useState("House 42, Road 11, Sector 4, Uttara, Dhaka");
  const [district, setDistrict] = useState("Dhaka");

  // Delivery
  const [insideDhaka, setInsideDhaka] = useState(70);
  const [outsideDhaka, setOutsideDhaka] = useState(130);
  const [freeThreshold, setFreeThreshold] = useState(2000);

  // Danger Zone
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize with activeStore when user changes active store
  useEffect(() => {
    if (activeStore) {
      setName(activeStore.name || "");
      setSlug(activeStore.slug || "");
      setCategory(activeStore.category || "General Store");
      setDescription(activeStore.description || "");
      setTagline(activeStore.tagline || "Curated products for everyday lifestyle");

      try {
        const saved = localStorage.getItem(`store_config_${activeStore.id}`);
        if (saved) {
          const cfg = JSON.parse(saved);
          if (cfg.email) setEmail(cfg.email);
          if (cfg.phone) setPhone(cfg.phone);
          if (cfg.whatsapp) setWhatsapp(cfg.whatsapp);
          if (cfg.address) setAddress(cfg.address);
          if (cfg.district) setDistrict(cfg.district);
          if (cfg.insideDhaka !== undefined) setInsideDhaka(cfg.insideDhaka);
          if (cfg.outsideDhaka !== undefined) setOutsideDhaka(cfg.outsideDhaka);
          if (cfg.freeThreshold !== undefined) setFreeThreshold(cfg.freeThreshold);
          if (cfg.category) setCategory(cfg.category);
          if (cfg.tagline) setTagline(cfg.tagline);
        } else {
          setEmail(`support@${activeStore.slug}.com`);
          setPhone("+880 1700-000000");
          setWhatsapp("+880 1700-000000");
          setAddress("House 42, Road 11, Dhaka");
          setDistrict("Dhaka");
          setInsideDhaka(70);
          setOutsideDhaka(130);
          setFreeThreshold(2000);
        }
      } catch {}
    }
  }, [activeStore]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStore) return;
    setIsSaving(true);
    try {
      await updateStore(activeStore.id, {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim(),
      });

      localStorage.setItem(`store_config_${activeStore.id}`, JSON.stringify({
        email,
        phone,
        whatsapp,
        address,
        district,
        insideDhaka,
        outsideDhaka,
        freeThreshold,
        category,
        tagline,
      }));

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General Information", icon: Store },
    { id: "branding", label: "Branding & Theme", icon: Palette },
    { id: "contact", label: "Contact & Address", icon: Phone },
    { id: "delivery", label: "Delivery & Shipping", icon: Truck },
    { id: "payments", label: "Payment Gateways", icon: CreditCard },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6 w-full pb-16">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#008B47]/10 text-[#008B47] flex items-center justify-center font-black text-xl border border-[#008B47]/20 shadow-xs">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">{name}</h1>
              {isPaymentPending ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 uppercase tracking-wider">
                  ● Payment Pending
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  ● Store Active
                </span>
              )}
            </div>
            <span className="text-xs font-mono text-slate-500 block mt-0.5">
              https://{slug}.toolera.app
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </a>
          <Link
            href="/admin/website/theme"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Theme Customizer</span>
          </Link>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Store settings have been saved successfully!</span>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : t.id === "danger"
                  ? "text-rose-600 hover:bg-rose-50"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        
        {/* GENERAL TAB */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">General Information</h2>
              <p className="text-xs text-slate-500">Configure your store name, URL, and business category.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#008B47]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subdomain Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#008B47]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Business Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#008B47]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#008B47]"
              />
            </div>
          </div>
        )}

        {/* BRANDING TAB */}
        {activeTab === "branding" && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-black text-slate-900">Store Branding</h2>
              <p className="text-xs text-slate-500">
                Your visual styling is connected directly to the existing Theme Customizer.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-xs text-slate-900 block">Visual Theme Customizer Available</span>
                <span className="text-xs text-slate-600 block">
                  Change color palettes, typography, button radius, shadows, and header layouts in real-time.
                </span>
              </div>
              <Link
                href="/admin/website/theme"
                className="px-4 py-2 bg-[#008B47] text-white rounded-xl text-xs font-bold hover:bg-[#007a3e] transition shrink-0"
              >
                Open Theme Customizer →
              </Link>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Store Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === "contact" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Contact &amp; Physical Address</h2>
              <p className="text-xs text-slate-500">Displayed on customer invoices, order slips, and storefront footer.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Hotline</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse / Store Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* DELIVERY TAB */}
        {activeTab === "delivery" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Delivery &amp; Shipping Rates</h2>
              <p className="text-xs text-slate-500">Standard Bangladesh shipping charges applied automatically at checkout.</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Inside Dhaka (৳)</label>
                <input
                  type="number"
                  value={insideDhaka}
                  onChange={(e) => setInsideDhaka(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Outside Dhaka (৳)</label>
                <input
                  type="number"
                  value={outsideDhaka}
                  onChange={(e) => setOutsideDhaka(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Free Delivery Above (৳)</label>
                <input
                  type="number"
                  value={freeThreshold}
                  onChange={(e) => setFreeThreshold(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* DANGER ZONE */}
        {activeTab === "danger" && (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-4">
            <div className="flex items-center gap-2.5 text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-black uppercase tracking-wider">Danger Zone</h3>
            </div>
            <p className="text-xs text-rose-700 leading-relaxed">
              Deleting your store permanently removes all catalog products, customer histories, and orders. This action cannot be undone.
            </p>

            <div>
              <label className="block text-xs font-bold text-rose-900 mb-1">
                To confirm, type <strong className="font-mono underline">{name}</strong> below:
              </label>
              <input
                type="text"
                placeholder={name}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-rose-300 rounded-xl text-xs text-slate-900 focus:outline-none"
              />
            </div>

            <button
              type="button"
              disabled={deleteConfirmText !== name || isDeleting}
              onClick={() => {
                setIsDeleting(true);
                setTimeout(() => {
                  alert("Store deletion simulated safely in demo mode.");
                  setIsDeleting(false);
                }, 1000);
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>Permanently Delete Store</span>
            </button>
          </div>
        )}

        {activeTab !== "danger" && (
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}

      </form>
    </div>
  );
}
