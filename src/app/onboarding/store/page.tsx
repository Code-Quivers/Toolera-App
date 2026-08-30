"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Store,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Globe,
  Palette,
  Truck,
  CreditCard,
  Layers,
  Check,
  AlertCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";

const BUSINESS_CATEGORIES = [
  "General Store",
  "Fashion & Apparel",
  "Electronics & Gadgets",
  "Mobile & Computer Accessories",
  "Beauty & Cosmetics",
  "Home & Living",
  "Food, Organic & Grocery",
  "Handmade & Crafts",
  "Jewelry & Watches",
  "Health & Wellness",
  "Baby & Kids Toys",
  "Other Retail",
];

export default function StoreOnboardingWizardPage() {
  const router = useRouter();
  const { createStore, activeStore, setPaymentPending } = useTenantStore();

  // Wizard Step: 1 = Store Info, 2 = Branding, 3 = Delivery & Payments
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: Store Details
  const [storeName, setStoreName] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("General Store");
  const [description, setDescription] = useState("");
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  // Step 2: Branding
  const [tagline, setTagline] = useState("Curated products for everyday lifestyle");
  const [logoUrl, setLogoUrl] = useState("/assets/favicon.png");
  const [primaryColor, setPrimaryColor] = useState("#0F172A");
  const [accentColor, setAccentColor] = useState("#008B47");
  const [secondaryColor, setSecondaryColor] = useState("#F59E0B");

  // Step 3: Delivery & Payments
  const [phone, setPhone] = useState("+880 1");
  const [whatsapp, setWhatsapp] = useState("+880 1");
  const [insideDhakaCost, setInsideDhakaCost] = useState(70);
  const [outsideDhakaCost, setOutsideDhakaCost] = useState(130);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(2000);
  const [enableCod, setEnableCod] = useState(true);
  const [enableBkash, setEnableBkash] = useState(true);
  const [enableNagad, setEnableNagad] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-generate slug from store name
  const handleNameChange = (val: string) => {
    setStoreName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(autoSlug);
  };

  // Live slug checking
  useEffect(() => {
    if (!slug || slug.length < 2) {
      setSlugAvailable(null);
      return;
    }
    setIsCheckingSlug(true);
    const timer = setTimeout(() => {
      // In-app check or backend check
      fetch("http://localhost:5000/api/v1/stores/check-slug/" + encodeURIComponent(slug))
        .then((r) => r.json())
        .then((data) => {
          setSlugAvailable(data.available !== false);
        })
        .catch(() => {
          // Fallback: available
          setSlugAvailable(true);
        })
        .finally(() => {
          setIsCheckingSlug(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [slug]);

  // Load saved draft on mount for persistent Back/Next autofill
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rm_onboarding_store_draft");
      if (saved) {
        const d = JSON.parse(saved);
        if (d.storeName) setStoreName(d.storeName);
        if (d.slug) setSlug(d.slug);
        if (d.category) setCategory(d.category);
        if (d.description) setDescription(d.description);
        if (d.tagline) setTagline(d.tagline);
        if (d.logoUrl) setLogoUrl(d.logoUrl);
        if (d.primaryColor) setPrimaryColor(d.primaryColor);
        if (d.accentColor) setAccentColor(d.accentColor);
        if (d.secondaryColor) setSecondaryColor(d.secondaryColor);
        if (d.phone) setPhone(d.phone);
        if (d.whatsapp) setWhatsapp(d.whatsapp);
        if (d.insideDhakaCost) setInsideDhakaCost(d.insideDhakaCost);
        if (d.outsideDhakaCost) setOutsideDhakaCost(d.outsideDhakaCost);
        if (d.freeDeliveryThreshold) setFreeDeliveryThreshold(d.freeDeliveryThreshold);
        if (d.enableCod !== undefined) setEnableCod(d.enableCod);
        if (d.enableBkash !== undefined) setEnableBkash(d.enableBkash);
        if (d.enableNagad !== undefined) setEnableNagad(d.enableNagad);
      }
    } catch {}
  }, []);

  // Sync draft to localStorage whenever any field changes
  useEffect(() => {
    try {
      localStorage.setItem(
        "rm_onboarding_store_draft",
        JSON.stringify({
          storeName,
          slug,
          category,
          description,
          tagline,
          logoUrl,
          primaryColor,
          accentColor,
          secondaryColor,
          phone,
          whatsapp,
          insideDhakaCost,
          outsideDhakaCost,
          freeDeliveryThreshold,
          enableCod,
          enableBkash,
          enableNagad,
        })
      );
    } catch {}
  }, [
    storeName,
    slug,
    category,
    description,
    tagline,
    logoUrl,
    primaryColor,
    accentColor,
    secondaryColor,
    phone,
    whatsapp,
    insideDhakaCost,
    outsideDhakaCost,
    freeDeliveryThreshold,
    enableCod,
    enableBkash,
    enableNagad,
  ]);

  // One-click autofill with standard high-converting Bangladeshi settings
  const handleAutofillStore = () => {
    setStoreName("Raifa's Boutique BD");
    setSlug("raifas-boutique-bd");
    setCategory("Fashion & Apparel");
    setDescription("Premium modest fashion, authentic fabrics, and curated collections across Bangladesh.");
    setTagline("Exclusive collections delivered to your doorstep in 1–3 days.");
    setPhone("+880 1712 345678");
    setWhatsapp("+880 1712 345678");
    setInsideDhakaCost(70);
    setOutsideDhakaCost(130);
    setFreeDeliveryThreshold(2000);
    setEnableCod(true);
    setEnableBkash(true);
    setEnableNagad(true);
    setSlugAvailable(true);
  };

  // Skip payment and go directly to dashboard (Pay Later from dashboard)
  const handleSkipPayment = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await createStore({
        name: storeName.trim() || "My Online Store",
        slug: slug.trim().toLowerCase() || "store-" + Date.now().toString(36),
        description: description.trim() || tagline,
        currency: "BDT",
        currencySymbol: "৳",
        planSlug: "starter",
      });
      setPaymentPending(true);
      router.push("/admin");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initialize store.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (currentStep === 1) {
      if (!storeName.trim() || storeName.trim().length < 2) {
        setErrorMsg("Please enter a valid store name (at least 2 characters).");
        return;
      }
      if (!slug || slug.length < 2) {
        setErrorMsg("Please enter a valid store slug URL.");
        return;
      }
      if (slugAvailable === false) {
        setErrorMsg("This store URL is already taken. Please pick another.");
        return;
      }
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      // Complete store creation & move to Choose Plan!
      handleCreateStoreFinal();
    }
  };

  const handleCreateStoreFinal = async () => {
    setIsLoading(true);
    setErrorMsg("");

    try {
      // Save created store to tenant store
      await createStore({
        name: storeName.trim(),
        slug: slug.trim().toLowerCase(),
        description: description.trim() || tagline,
        currency: "BDT",
        currencySymbol: "৳",
        planSlug: "starter",
      });

      // Save onboarding preferences into localStorage for session continuity
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "rm_onboarding_store_draft",
          JSON.stringify({
            storeName,
            slug,
            category,
            tagline,
            logoUrl,
            primaryColor,
            accentColor,
            secondaryColor,
            phone,
            whatsapp,
            insideDhakaCost,
            outsideDhakaCost,
            freeDeliveryThreshold,
            enableCod,
            enableBkash,
            enableNagad,
          })
        );
      }

      // Proceed to Step 4: Choose Plan!
      router.push("/onboarding/plan");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create store. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Navbar */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#008B47] text-white flex items-center justify-center font-bold shadow-xs">
            <Store className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm block leading-none">Raifa's Mart</span>
            <span className="text-[10px] text-slate-400 font-mono">Store Setup Wizard</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          {[
            { step: 1, label: "Store" },
            { step: 2, label: "Branding" },
            { step: 3, label: "Preferences" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                  currentStep === item.step
                    ? "bg-[#008B47] text-white shadow-xs"
                    : currentStep > item.step
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {currentStep > item.step ? <Check className="w-3 h-3" /> : item.step}
              </span>
              <span className="hidden sm:inline text-xs font-bold text-slate-600 mr-2">{item.label}</span>
            </div>
          ))}
        </div>
      </header>

      {/* Main Form Content */}
      <main className="max-w-2xl mx-auto w-full my-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-lg p-6 sm:p-10 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1: STORE DETAILS                                    */}
          {/* ======================================================== */}
          {currentStep === 1 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Step 01 / 03</span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">Let's create your store</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Give your store a name and URL. You can customize them anytime later.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutofillStore}
                  className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#008B47] border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ Autofill Recommended</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trendy Lifestyle BD"
                  value={storeName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#008B47] focus:bg-white font-medium transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Store Web Address (Subdomain URL) <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-[#008B47] focus-within:bg-white transition">
                  <span className="pl-3.5 pr-1 text-slate-400 text-xs select-none">https://</span>
                  <input
                    type="text"
                    required
                    placeholder="my-shop"
                    value={slug}
                    onChange={(e) =>
                      setSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, "")
                      )
                    }
                    className="flex-1 py-2.5 px-1 bg-transparent text-xs text-slate-900 font-mono font-bold focus:outline-none"
                  />
                  <span className="pr-3 text-slate-400 text-xs font-mono select-none">.toolera.app</span>
                </div>

                {/* Slug Status Feedback */}
                {slug && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                    {isCheckingSlug ? (
                      <span className="text-slate-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                      </span>
                    ) : slugAvailable === true ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> https://{slug}.toolera.app is available!
                      </span>
                    ) : slugAvailable === false ? (
                      <span className="text-rose-600 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> This store URL is already taken. Try another.
                      </span>
                    ) : null}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#008B47] focus:bg-white font-medium transition cursor-pointer"
                >
                  {BUSINESS_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Description</label>
                <textarea
                  rows={2}
                  placeholder="Tell customers what your store is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#008B47] focus:bg-white transition"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Continue to Branding</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 2: STORE BRANDING                                   */}
          {/* ======================================================== */}
          {currentStep === 2 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Step 02 / 03</span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">Customize your brand identity</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your colors and store tagline. You can update these anytime in the Theme Customizer.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Store Tagline / Slogan</label>
                <input
                  type="text"
                  placeholder="e.g. Express Lifestyle Deliveries in Bangladesh"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#008B47] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="font-mono font-bold text-xs text-slate-800">{primaryColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Accent Color</label>
                  <div className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0"
                    />
                    <span className="font-mono font-bold text-xs text-slate-800">{accentColor}</span>
                  </div>
                </div>
              </div>

              {/* Live Storefront Mini Preview */}
              <div className="p-4 rounded-2xl bg-slate-100/80 border border-slate-200 space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Live Mini Preview
                </span>
                <div
                  className="p-4 rounded-xl shadow-xs text-white flex items-center justify-between"
                  style={{ backgroundColor: primaryColor }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {storeName ? storeName.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <span className="font-extrabold text-xs block">{storeName || "My Online Store"}</span>
                      <span className="text-[9px] text-slate-300 block">{tagline}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: accentColor }}
                  >
                    Shop Now
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Continue to Preferences</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* STEP 3: BUSINESS & DELIVERY PREFERENCES                  */}
          {/* ======================================================== */}
          {currentStep === 3 && (
            <form onSubmit={handleNextStep} className="space-y-5">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Step 03 / 03</span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">Delivery &amp; Payment Settings</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Default delivery rates and payment methods tailored for Bangladesh e-commerce.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Support Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#008B47]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Order Hotline</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>

              {/* Delivery Rates */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-900">Standard Delivery Rates (BDT)</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Inside Dhaka</span>
                    <input
                      type="number"
                      value={insideDhakaCost}
                      onChange={(e) => setInsideDhakaCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Outside Dhaka</span>
                    <input
                      type="number"
                      value={outsideDhakaCost}
                      onChange={(e) => setOutsideDhakaCost(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Free Delivery Over</span>
                    <input
                      type="number"
                      value={freeDeliveryThreshold}
                      onChange={(e) => setFreeDeliveryThreshold(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-black text-slate-900 block">Accepted Payment Options</span>
                <div className="grid grid-cols-3 gap-2">
                  <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={enableCod}
                      onChange={(e) => setEnableCod(e.target.checked)}
                      className="rounded text-[#008B47] focus:ring-[#008B47]"
                    />
                    <span className="text-xs font-bold text-slate-800">Cash on Delivery</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={enableBkash}
                      onChange={(e) => setEnableBkash(e.target.checked)}
                      className="rounded text-[#008B47] focus:ring-[#008B47]"
                    />
                    <span className="text-xs font-bold text-slate-800">bKash</span>
                  </label>
                  <label className="flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={enableNagad}
                      onChange={(e) => setEnableNagad(e.target.checked)}
                      className="rounded text-[#008B47] focus:ring-[#008B47]"
                    />
                    <span className="text-xs font-bold text-slate-800">Nagad</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back: Visual Branding</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Choose Subscription Plan</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleSkipPayment}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                  >
                    <span>⚡ Skip Payment for Now &amp; Access Dashboard (Pay Later)</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-700" />
                  </button>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Store navigation tabs will remain hidden until payment is activated from your dashboard.
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-slate-400 pb-4">
        &copy; 2026 Raifa's Mart SaaS E-Commerce Platform. All rights reserved.
      </footer>
    </div>
  );
}
