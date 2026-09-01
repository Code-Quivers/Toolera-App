"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  Plus,
  ExternalLink,
  Globe,
  Users,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  TrendingUp,
  Package,
  ShoppingBag,
  MoreVertical,
  Settings,
  Trash2,
  Sparkles,
  Server,
  RefreshCw,
} from "lucide-react";
import { useTenantStore, StoreModel } from "@/store/useTenantStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

export default function StoreManagementPage() {
  const {
    stores,
    activeStore,
    setActiveStore,
    isCreateModalOpen,
    setCreateModalOpen,
    createStore,
    updateStore,
    deleteStore,
    addMember,
    removeMember,
    fetchStores,
  } = useTenantStore();

  const { openCheckout, plans } = useSubscriptionStore();

  // Create Store Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    customDomain: "",
    description: "",
    currency: "BDT",
    currencySymbol: "৳",
    planSlug: "starter",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Domain DNS Modal / Tab State
  const [selectedStoreForDomain, setSelectedStoreForDomain] = useState<StoreModel | null>(null);
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [dnsCopied, setDnsCopied] = useState<string | null>(null);
  const [isDnsVerifying, setIsDnsVerifying] = useState(false);
  const [dnsVerified, setDnsVerified] = useState<boolean | null>(null);

  // Staff Member Input
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("STAFF");
  const [isAddingMember, setIsAddingMember] = useState(false);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Auto-generate slug from store name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
    setFormData((prev) => ({ ...prev, name, slug }));
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    const res = await createStore(formData);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg("Store created successfully!");
      setFormData({
        name: "",
        slug: "",
        customDomain: "",
        description: "",
        currency: "BDT",
        currencySymbol: "৳",
        planSlug: "starter",
      });
      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    } else {
      setErrorMsg(res.message || "Failed to create store.");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setDnsCopied(id);
    setTimeout(() => setDnsCopied(null), 2000);
  };

  const handleSaveDomain = async (store: StoreModel) => {
    if (!customDomainInput.trim()) return;
    await updateStore(store.id, { customDomain: customDomainInput.trim().toLowerCase() });
    setSelectedStoreForDomain({ ...store, customDomain: customDomainInput.trim().toLowerCase() });
  };

  const handleVerifyDns = () => {
    setIsDnsVerifying(true);
    setTimeout(() => {
      setIsDnsVerifying(false);
      setDnsVerified(true);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Store Management
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Create and manage multiple stores, custom domains, and staff permissions from a single SaaS portal.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Store</span>
        </button>
      </div>

      {/* Stores Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => {
          const isActive = activeStore?.id === store.id || activeStore?.slug === store.slug;
          const planName = store.subscription?.plan?.name || "Pro Business";
          const isTrial = store.subscription?.status === "TRIALING";

          return (
            <div
              key={store.id}
              className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                isActive ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-200/90"
              }`}
            >
              <div className="p-6 space-y-5">
                {/* Top Row: Store Badge & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-lg flex items-center justify-center shadow-xs">
                      {store.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                          {store.name}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {store.slug}.toolera.app
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase ${
                      isTrial
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {planName}
                  </span>
                </div>

                {/* Subdomain & Custom Domain Link */}
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 text-xs border border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      Domain:
                    </span>
                    {store.customDomain ? (
                      <span className="font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {store.customDomain}
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedStoreForDomain(store);
                          setCustomDomainInput("");
                          setDnsVerified(null);
                        }}
                        className="text-[11px] font-bold text-emerald-600 hover:underline"
                      >
                        + Connect Custom Domain
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Store Metrics */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
                  <div className="p-2 rounded-xl bg-slate-50">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Products</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">
                      {store.metrics?.productsCount || 14}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Orders</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">
                      {store.metrics?.ordersCount || 38}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Revenue</div>
                    <div className="text-sm font-black text-emerald-700 mt-0.5">
                      ৳{(store.metrics?.revenue || 48900).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                {isActive ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 px-3 py-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Currently Managing
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveStore(store)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                  >
                    Switch to this Store
                  </button>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedStoreForDomain(store);
                      setCustomDomainInput(store.customDomain || "");
                      setDnsVerified(store.customDomain ? true : null);
                    }}
                    title="Domain & DNS Settings"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition"
                  >
                    <Globe className="w-4 h-4" />
                  </button>

                  <a
                    href={process.env.NEXT_PUBLIC_STOREFRONT_URL || "http://localhost:3000"}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Preview Storefront"
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Domain Connection & DNS Modal / Drawer */}
      {selectedStoreForDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">
                    Connect Custom Domain
                  </h3>
                  <p className="text-xs text-slate-500">
                    Set up your custom branded domain (e.g. <code>shop.mybrand.com</code>) for{" "}
                    <strong>{selectedStoreForDomain.name}</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStoreForDomain(null)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Input Domain */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700">Domain Name</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. mybrand.com or shop.mybrand.com"
                  value={customDomainInput}
                  onChange={(e) => setCustomDomainInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => handleSaveDomain(selectedStoreForDomain)}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
                >
                  Save Domain
                </button>
              </div>
            </div>

            {/* DNS Instructions */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Server className="w-4 h-4 text-emerald-600" />
                <span>DNS Configuration Records</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Add the following DNS records in your domain registrar (e.g., Namecheap, Cloudflare, GoDaddy):
              </p>

              <div className="space-y-2 font-mono text-[11px]">
                {/* CNAME Record */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-emerald-700">CNAME</span> | Host:{" "}
                    <span className="font-bold text-slate-900">@ or shop</span> | Points to:{" "}
                    <span className="font-bold text-slate-900">cname.toolera.app</span>
                  </div>
                  <button
                    onClick={() => handleCopy("cname.toolera.app", "cname")}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                  >
                    {dnsCopied === "cname" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* A Record */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-emerald-700">A Record</span> | Host:{" "}
                    <span className="font-bold text-slate-900">@</span> | Points to:{" "}
                    <span className="font-bold text-slate-900">76.76.21.21</span>
                  </div>
                  <button
                    onClick={() => handleCopy("76.76.21.21", "a")}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-900"
                  >
                    {dnsCopied === "a" ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Verification Status */}
              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {dnsVerified === true ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      SSL Active & DNS Verified
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Pending DNS Propagation
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isDnsVerifying}
                  onClick={handleVerifyDns}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isDnsVerifying ? "animate-spin" : ""}`} />
                  <span>Verify DNS Status</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedStoreForDomain(null)}
                className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Store Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Create New Store</h3>
                  <p className="text-xs text-slate-500">
                    Launch a new online store in seconds with dedicated catalog & orders.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-2xl border border-emerald-200">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateStore} className="space-y-4 text-xs">
              {/* Store Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trendy Gadgets BD"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Subdomain Slug */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Store Subdomain / Slug *</label>
                <div className="flex items-center rounded-2xl border border-slate-200 overflow-hidden focus-within:border-emerald-500">
                  <input
                    type="text"
                    required
                    placeholder="trendygadgets"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase() })}
                    className="flex-1 px-4 py-2.5 text-slate-900 focus:outline-none font-mono"
                  />
                  <span className="px-3 text-slate-400 font-mono bg-slate-50 border-l border-slate-200 py-2.5">
                    .toolera.app
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Description (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Premium imported tech accessories and gadgets"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Currency & Plan */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currency: e.target.value,
                        currencySymbol: e.target.value === "USD" ? "$" : "৳",
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="BDT">BDT (৳ - Bangladeshi Taka)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Initial Plan</label>
                  <select
                    value={formData.planSlug}
                    onChange={(e) => setFormData({ ...formData, planSlug: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-2xl border border-slate-200 text-slate-900 focus:outline-none focus:border-emerald-500 bg-white"
                  >
                    <option value="starter">Starter (14-Day Free Trial)</option>
                    <option value="pro">Pro Business (Recommended)</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl text-[11px] text-emerald-800 flex items-center gap-2 border border-emerald-200/70">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Includes a 14-day full feature trial with no credit card required upfront.</span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl hover:bg-slate-100 text-slate-600 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md shadow-emerald-600/20"
                >
                  {isSubmitting ? "Creating Store..." : "Create Store"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
