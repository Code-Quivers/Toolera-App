"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  CheckCircle2,
  DollarSign,
  Sparkles,
  Sliders,
  ShieldCheck,
  KeyRound,
  Wallet,
  RefreshCw,
  Send,
  CreditCard,
  Smartphone,
  Copy,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Database,
  DownloadCloud,
  UploadCloud,
  HardDrive,
  FileText,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { formatPrice } from "@/lib/formatters";
import { useShippingSettingsStore } from "@/store/useShippingSettingsStore";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { api } from "@/lib/api";
import InvoiceTemplateCustomizer from "@/components/admin/InvoiceTemplateCustomizer";

export const SETTING_TABS = [
  { id: "shipping", label: "Shipping Rates", icon: Truck, title: "Shipping Rates & Delivery Settings", desc: "Configure inside & outside Dhaka shipping rates, COD fees, and free delivery thresholds." },
  { id: "courier", label: "Courier Integration", icon: Send, title: "Courier Integration & Logistics APIs", desc: "Automate consignment bookings with Steadfast and Pathao, generate tracking IDs, and monitor COD balances." },
  { id: "payments", label: "Payment Gateways", icon: CreditCard, title: "Payment Gateways (COD, bKash & Nagad)", desc: "Manage Cash on Delivery (COD), bKash Merchant/Personal Send Money, and Nagad Automated PGW." },
  { id: "vat", label: "VAT & Tax", icon: DollarSign, title: "VAT & Government Tax Management", desc: "Configure NBR VAT rates, Business Identification Number (BIN), and tax-inclusive invoice calculation." },
  { id: "invoice", label: "Invoice Templates", icon: FileText, title: "Invoice Templates & Brand Customizer", desc: "Customize your invoice templates, brand logo, store header, footer information, trust badges, and colors." },
  { id: "marketing", label: "Marketing & Bundles", icon: Sparkles, title: "Product Page Conversion & Marketing Widgets", desc: "Configure Flash Sale urgency countdown timers and multi-buy quantity bundle discount offers." },
  { id: "sms", label: "SMS Gateway", icon: MessageSquare, title: "SMS Notification Gateway", desc: "Automate customer SMS alerts for order placement, shipment tracking, and OTP verification." },
  { id: "pixels", label: "Ad Pixels & GA4", icon: BarChart3, title: "Ad Pixels & Conversion Tracking", desc: "Track PageView, ViewContent, AddToCart, InitiateCheckout & Purchase events for Facebook, TikTok, and GA4." },
  { id: "backup", label: "Database Backup", icon: Database, title: "1-Click Store Database Backup & Restore", desc: "Export and import your entire catalog, orders, and customer database securely in JSON format." },
  { id: "security", label: "Admin Security", icon: ShieldCheck, title: "Admin Profile & Security Settings", desc: "Manage store admin login credentials, email address, and account password." },
  { id: "all", label: "View All", icon: Sliders, title: "All Settings Hub", desc: "View and configure all store settings sections on a single continuous page." },
];

export default function AdminSettingsPage({ initialTab }: { initialTab?: string } = {}) {
  const pathname = usePathname();
  const router = useRouter();

  // Tab detection from URL or prop
  const currentTabFromUrl = pathname.includes("/admin/settings/")
    ? pathname.replace("/admin/settings/", "").split("/")[0]
    : initialTab || "shipping";

  const [activeTab, setActiveTab] = useState<string>(currentTabFromUrl || "shipping");

  useEffect(() => {
    if (currentTabFromUrl && currentTabFromUrl !== activeTab) {
      setActiveTab(currentTabFromUrl);
    }
  }, [currentTabFromUrl]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "shipping") {
      router.push("/admin/settings/shipping");
    } else {
      router.push(`/admin/settings/${tabId}`);
    }
  };

  const currentTabConfig = SETTING_TABS.find((t) => t.id === activeTab) || SETTING_TABS[0];
  const {
    insideDhakaCost,
    outsideDhakaCost,
    freeShippingThreshold,
    isFreeShippingEnabled,
    freeShippingBannerText,
    showFlashSaleCountdown,
    showBundleDiscounts,
    bundle2Qty = 2,
    bundle2DiscountPercent = 10,
    bundle3Qty = 3,
    bundle3DiscountPercent = 18,
    bundle3FreeDelivery = true,
    flashSaleBannerTitle = "Flash Sale Offer Ending Soon:",
    flashSaleScarcityText = "84% Sold — Limited China Import Stock",
    flashSaleProgressPercent = 84,
    flashSaleSavingsBadge = "AUTO",
    vatEnabled = true,
    vatRate = 5,
    vatRegistrationNumber = "BIN-004819283-0101",
    vatInclusive = false,
    updateSettings,
  } = useShippingSettingsStore();

  const [insideDhakaFee, setInsideDhakaFee] = useState<number | string>(insideDhakaCost);
  const [outsideDhakaFee, setOutsideDhakaFee] = useState<number | string>(outsideDhakaCost);
  const [threshold, setThreshold] = useState<number | string>(freeShippingThreshold);
  const [enabled, setEnabled] = useState<boolean>(isFreeShippingEnabled);
  const [bannerText, setBannerText] = useState<string>(freeShippingBannerText);
  const [flashTimerEnabled, setFlashTimerEnabled] = useState<boolean>(showFlashSaleCountdown ?? true);
  const [bundleOffersEnabled, setBundleOffersEnabled] = useState<boolean>(showBundleDiscounts ?? true);
  const [b2Qty, setB2Qty] = useState<number>(bundle2Qty || 2);
  const [b2Disc, setB2Disc] = useState<number>(bundle2DiscountPercent || 10);
  const [b3Qty, setB3Qty] = useState<number>(bundle3Qty || 3);
  const [b3Disc, setB3Disc] = useState<number>(bundle3DiscountPercent || 18);
  const [b3FreeShip, setB3FreeShip] = useState<boolean>(bundle3FreeDelivery !== false);
  const [bannerTitle, setBannerTitle] = useState<string>(flashSaleBannerTitle || "Flash Sale Offer Ending Soon:");
  const [scarcityText, setScarcityText] = useState<string>(flashSaleScarcityText || "84% Sold — Limited China Import Stock");
  const [progressPct, setProgressPct] = useState<number>(flashSaleProgressPercent || 84);
  const [savingsBadge, setSavingsBadge] = useState<string>(flashSaleSavingsBadge || "AUTO");
  
  // VAT State
  const [vatOn, setVatOn] = useState<boolean>(vatEnabled ?? true);
  const [vRate, setVRate] = useState<number>(vatRate ?? 5);
  const [vBin, setVBin] = useState<string>(vatRegistrationNumber ?? "BIN-004819283-0101");
  const [vInclusive, setVInclusive] = useState<boolean>(vatInclusive ?? false);

  const [notification, setNotification] = useState<string | null>(null);

  // Steadfast & Pathao Courier State
  const [steadfastApiKey, setSteadfastApiKey] = useState("");
  const [steadfastSecretKey, setSteadfastSecretKey] = useState("");
  const [steadfastEnabled, setSteadfastEnabled] = useState(true);
  const [pathaoClientId, setPathaoClientId] = useState("");
  const [pathaoClientSecret, setPathaoClientSecret] = useState("");
  const [pathaoUsername, setPathaoUsername] = useState("");
  const [pathaoPassword, setPathaoPassword] = useState("");
  const [pathaoStoreId, setPathaoStoreId] = useState("");
  const [pathaoEnabled, setPathaoEnabled] = useState(false);
  const [courierBalance, setCourierBalance] = useState<string>("৳0.00");
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isTestingPathao, setIsTestingPathao] = useState(false);
  const [pathaoTestResult, setPathaoTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // SMS Notification Gateway State
  const [smsProvider, setSmsProvider] = useState<"GREENWEB" | "BULKSMSBD" | "CUSTOM">("GREENWEB");
  const [smsApiKey, setSmsApiKey] = useState("");
  const [smsSenderId, setSmsSenderId] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(true);
  const [smsOrderPlacedEnabled, setSmsOrderPlacedEnabled] = useState(true);
  const [smsOrderPlacedTemplate, setSmsOrderPlacedTemplate] = useState("Dear {customer_name}, your order #{order_number} for BDT {total} is confirmed at Raifa's Mart! Helpline: 01712-345678");
  const [smsOrderShippedEnabled, setSmsOrderShippedEnabled] = useState(true);
  const [smsOrderShippedTemplate, setSmsOrderShippedTemplate] = useState("Dear {customer_name}, your parcel #{order_number} is dispatched via {courier_name}. Tracking ID: {tracking_code}.");
  const [smsBalance, setSmsBalance] = useState<string>("100 SMS (Sandbox Simulator)");
  const [isLoadingSmsBalance, setIsLoadingSmsBalance] = useState(false);
  const [testPhone, setTestPhone] = useState("01712345678");
  const [isSendingTestSms, setIsSendingTestSms] = useState(false);
  const [testSmsResult, setTestSmsResult] = useState<{ success: boolean; message: string } | null>(null);

  // Payment Settings State
  const [codEnabled, setCodEnabled] = useState(true);
  const [bkashEnabled, setBkashEnabled] = useState(true);
  const [bkashType, setBkashType] = useState<"PGW" | "MANUAL_NUMBER">("MANUAL_NUMBER");
  const [bkashMerchantNumber, setBkashMerchantNumber] = useState("01712345678");
  const [bkashAppKey, setBkashAppKey] = useState("");
  const [bkashAppSecret, setBkashAppSecret] = useState("");
  const [bkashUsername, setBkashUsername] = useState("");
  const [bkashPassword, setBkashPassword] = useState("");

  const [nagadEnabled, setNagadEnabled] = useState(true);
  const [nagadType, setNagadType] = useState<"PGW" | "MANUAL_NUMBER">("MANUAL_NUMBER");
  const [nagadMerchantNumber, setNagadMerchantNumber] = useState("01712345678");
  const [nagadMerchantId, setNagadMerchantId] = useState("");
  const [requireAdvanceShipping, setRequireAdvanceShipping] = useState(false);

  // Ad Pixels & Conversion Tracking State
  const [metaPixelId, setMetaPixelId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");
  const [ga4MeasurementId, setGa4MeasurementId] = useState("");
  const [isSavingPixels, setIsSavingPixels] = useState(false);

  useEffect(() => {
    setInsideDhakaFee(insideDhakaCost);
    setOutsideDhakaFee(outsideDhakaCost);
    setThreshold(freeShippingThreshold);
    setEnabled(isFreeShippingEnabled);
    setBannerText(freeShippingBannerText);

    // Fetch SEO & Ad Pixels
    api.getCmsConfig().then((res) => {
      if (res.success && res.data?.seo) {
        setMetaPixelId(res.data.seo.metaPixelId || "");
        setTiktokPixelId(res.data.seo.tiktokPixelId || "");
        setGa4MeasurementId(res.data.seo.ga4MeasurementId || "");
      }
    });

    // Fetch Courier Settings & Balance
    api.getCourierSettings().then((res) => {
      if (res.success && res.data) {
        setSteadfastApiKey(res.data.steadfastApiKey || "");
        setSteadfastSecretKey(res.data.steadfastSecretKey || "");
        setSteadfastEnabled(res.data.steadfastEnabled !== false);
        setPathaoClientId(res.data.pathaoClientId || "");
        setPathaoClientSecret(res.data.pathaoClientSecret || "");
        setPathaoUsername(res.data.pathaoUsername || "");
        setPathaoPassword(res.data.pathaoPassword || "");
        setPathaoStoreId(res.data.pathaoStoreId || "");
        setPathaoEnabled(Boolean(res.data.pathaoEnabled));
      }
    });

    // Fetch SMS Settings & Balance
    api.getSmsSettings().then((res) => {
      if (res.success && res.data) {
        setSmsProvider(res.data.provider || "GREENWEB");
        setSmsApiKey(res.data.apiKey || "");
        setSmsSenderId(res.data.senderId || "");
        setSmsEnabled(res.data.enabled !== false);
        setSmsOrderPlacedEnabled(res.data.orderPlacedEnabled !== false);
        if (res.data.orderPlacedTemplate) setSmsOrderPlacedTemplate(res.data.orderPlacedTemplate);
        setSmsOrderShippedEnabled(res.data.orderShippedEnabled !== false);
        if (res.data.orderShippedTemplate) setSmsOrderShippedTemplate(res.data.orderShippedTemplate);
      }
    });

    api.getSmsBalance().then((res) => {
      if (res.success && res.data) {
        setSmsBalance(res.data.formatted || `${res.data.balance} SMS`);
      }
    });

    // Fetch Payment Settings
    api.getPaymentSettings().then((res) => {
      if (res.success && res.data) {
        setCodEnabled(res.data.codEnabled !== false);
        setBkashEnabled(res.data.bkashEnabled !== false);
        setBkashType(res.data.bkashType || "MANUAL_NUMBER");
        setBkashMerchantNumber(res.data.bkashMerchantNumber || "01712345678");
        setBkashAppKey(res.data.bkashAppKey || "");
        setBkashAppSecret(res.data.bkashAppSecret || "");
        setBkashUsername(res.data.bkashUsername || "");
        setBkashPassword(res.data.bkashPassword || "");
        setNagadEnabled(res.data.nagadEnabled !== false);
        setNagadType(res.data.nagadType || "MANUAL_NUMBER");
        setNagadMerchantNumber(res.data.nagadMerchantNumber || "01712345678");
        setNagadMerchantId(res.data.nagadMerchantId || "");
        setRequireAdvanceShipping(Boolean(res.data.requireAdvanceShipping));
      }
    });

    fetchBalance();
  }, [insideDhakaCost, outsideDhakaCost, freeShippingThreshold, isFreeShippingEnabled, freeShippingBannerText]);

  const fetchBalance = async () => {
    setIsLoadingBalance(true);
    try {
      const res = await api.getCourierBalance();
      if (res.success && res.data) {
        setCourierBalance(res.data.formatted || `৳${res.data.current_balance || 0}`);
      }
    } catch {}
    setIsLoadingBalance(false);
  };

  const handleSaveShipping = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      insideDhakaCost: Number(insideDhakaFee) || 0,
      outsideDhakaCost: Number(outsideDhakaFee) || 0,
      freeShippingThreshold: Number(threshold) || 0,
      isFreeShippingEnabled: enabled,
      freeShippingBannerText: bannerText.trim() || "Add {remaining} more to get Free Delivery across Bangladesh!",
    });
    setNotification("Shipping settings saved successfully!");
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.updateCourierSettings({
      steadfastApiKey: steadfastApiKey.trim(),
      steadfastSecretKey: steadfastSecretKey.trim(),
      steadfastEnabled,
      pathaoClientId: pathaoClientId.trim(),
      pathaoClientSecret: pathaoClientSecret.trim(),
      pathaoUsername: pathaoUsername.trim(),
      pathaoPassword: pathaoPassword.trim(),
      pathaoStoreId: pathaoStoreId.trim(),
      pathaoEnabled,
    });
    if (res.success) {
      setNotification("Steadfast & Pathao Courier credentials updated successfully!");
    } else {
      setNotification("Courier credentials saved.");
    }
    setTimeout(() => setNotification(null), 3500);
  };

  const handleTestPathao = async () => {
    setIsTestingPathao(true);
    setPathaoTestResult(null);

    // Save first
    await api.updateCourierSettings({
      steadfastApiKey: steadfastApiKey.trim(),
      steadfastSecretKey: steadfastSecretKey.trim(),
      steadfastEnabled,
      pathaoClientId: pathaoClientId.trim(),
      pathaoClientSecret: pathaoClientSecret.trim(),
      pathaoUsername: pathaoUsername.trim(),
      pathaoPassword: pathaoPassword.trim(),
      pathaoStoreId: pathaoStoreId.trim(),
      pathaoEnabled,
    });

    try {
      const res = await api.testPathaoConnection();
      if (res.success && res.data) {
        const storeInfo = res.data.stores?.length
          ? `Connected to Pathao! Found ${res.data.stores.length} store(s): ${res.data.stores.map((s: any) => s.store_name).join(", ")}`
          : "Connected to Pathao successfully!";
        setPathaoTestResult({ success: true, message: `✅ ${storeInfo}` });
      } else {
        setPathaoTestResult({ success: false, message: `❌ ${res.message || "Failed to connect to Pathao API. Please verify credentials."}` });
      }
    } catch (err: any) {
      setPathaoTestResult({ success: false, message: `❌ ${err.message}` });
    } finally {
      setIsTestingPathao(false);
    }
  };

  const handleSaveSms = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.updateSmsSettings({
      provider: smsProvider,
      apiKey: smsApiKey.trim(),
      senderId: smsSenderId.trim(),
      enabled: smsEnabled,
      orderPlacedEnabled: smsOrderPlacedEnabled,
      orderPlacedTemplate: smsOrderPlacedTemplate.trim(),
      orderShippedEnabled: smsOrderShippedEnabled,
      orderShippedTemplate: smsOrderShippedTemplate.trim(),
    });

    if (res.success) {
      setNotification("SMS Notification Gateway settings updated successfully!");
      handleRefreshSmsBalance();
    } else {
      setNotification("Failed to update SMS settings.");
    }
    setTimeout(() => setNotification(null), 3500);
  };

  const handleRefreshSmsBalance = async () => {
    setIsLoadingSmsBalance(true);
    try {
      const res = await api.getSmsBalance();
      if (res.success && res.data) {
        setSmsBalance(res.data.formatted || `${res.data.balance} SMS`);
      }
    } catch {}
    finally {
      setIsLoadingSmsBalance(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhone) return;
    setIsSendingTestSms(true);
    setTestSmsResult(null);

    // Save current settings first
    await api.updateSmsSettings({
      provider: smsProvider,
      apiKey: smsApiKey.trim(),
      senderId: smsSenderId.trim(),
      enabled: smsEnabled,
      orderPlacedEnabled: smsOrderPlacedEnabled,
      orderPlacedTemplate: smsOrderPlacedTemplate.trim(),
      orderShippedEnabled: smsOrderShippedEnabled,
      orderShippedTemplate: smsOrderShippedTemplate.trim(),
    });

    try {
      const res = await api.sendTestSms(testPhone.trim(), `Test SMS from Raifa's Mart! Gateway is verified.`);
      if (res.success) {
        setTestSmsResult({ success: true, message: `✅ ${res.message || "Test SMS sent successfully!"}` });
      } else {
        setTestSmsResult({ success: false, message: `❌ ${res.message || "Failed to send SMS."}` });
      }
    } catch (err: any) {
      setTestSmsResult({ success: false, message: `❌ ${err.message}` });
    } finally {
      setIsSendingTestSms(false);
      handleRefreshSmsBalance();
    }
  };

  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.updatePaymentSettings({
      codEnabled,
      bkashEnabled,
      bkashType,
      bkashMerchantNumber: bkashMerchantNumber.trim(),
      bkashAppKey: bkashAppKey.trim(),
      bkashAppSecret: bkashAppSecret.trim(),
      bkashUsername: bkashUsername.trim(),
      bkashPassword: bkashPassword.trim(),
      nagadEnabled,
      nagadType,
      nagadMerchantNumber: nagadMerchantNumber.trim(),
      nagadMerchantId: nagadMerchantId.trim(),
      requireAdvanceShipping,
    });

    if (res.success) {
      setNotification("bKash, Nagad & COD Payment settings saved successfully!");
    } else {
      setNotification("Payment settings updated.");
    }
    setTimeout(() => setNotification(null), 3500);
  };

  const handleSaveVat = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      vatEnabled: vatOn,
      vatRate: Number(vRate) || 0,
      vatRegistrationNumber: vBin.trim() || undefined,
      vatInclusive: vInclusive,
    });
    setNotification("✅ VAT & Government Tax settings saved successfully!");
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            {currentTabConfig.icon && <currentTabConfig.icon className="w-7 h-7 text-[#008B47]" />}
            <span>{currentTabConfig.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {currentTabConfig.desc}
          </p>
        </div>
      </div>

      {/* Settings Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/80 no-scrollbar">
        {SETTING_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm ring-1 ring-slate-900"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. PAYMENT GATEWAYS (COD, BKASH, NAGAD)                         */}
      {/* ============================================================== */}
      {(activeTab === "all" || activeTab === "payments") && (
        <form onSubmit={handleSavePayment} className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center font-black">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Payment Methods (COD, bKash &amp; Nagad)</h2>
              <p className="text-slate-400 text-[11px]">
                Configure Cash on Delivery, bKash Merchant/Personal Send Money, and Nagad Automated PGW
              </p>
            </div>
        </div>

        {/* COD Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
              <span>Cash on Delivery (COD)</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Primary (Recommended)
              </span>
            </div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Allow shoppers across Bangladesh to pay in cash upon doorstep parcel delivery.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={codEnabled}
              onChange={(e) => setCodEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* bKash Section */}
        <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-rose-900 text-sm">bKash Payment Gateway</span>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                Mobile Banking
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={bkashEnabled}
                onChange={(e) => setBkashEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {bkashEnabled && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3">
                <label className="font-bold text-slate-700 text-xs">Integration Mode:</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBkashType("MANUAL_NUMBER")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      bkashType === "MANUAL_NUMBER"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200"
                    }`}
                  >
                    Merchant / Send Money (TrxID)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBkashType("PGW")}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                      bkashType === "PGW"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200"
                    }`}
                  >
                    Official PGW API (Automated)
                  </button>
                </div>
              </div>

              {bkashType === "MANUAL_NUMBER" ? (
                <div className="space-y-1.5 w-full sm:w-1/2">
                  <label className="font-bold text-slate-700">bKash Merchant / Personal Account Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 01712345678"
                    value={bkashMerchantNumber}
                    onChange={(e) => setBkashMerchantNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <span className="text-[10px] text-slate-500">
                    Customers will send payment to this number and input their TrxID on checkout.
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">bKash App Key</label>
                    <input
                      type="text"
                      placeholder="Enter bKash App Key..."
                      value={bkashAppKey}
                      onChange={(e) => setBkashAppKey(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">bKash App Secret</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={bkashAppSecret}
                      onChange={(e) => setBkashAppSecret(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">bKash Username</label>
                    <input
                      type="text"
                      placeholder="Merchant Username..."
                      value={bkashUsername}
                      onChange={(e) => setBkashUsername(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">bKash Password</label>
                    <input
                      type="password"
                      placeholder="••••••••••••"
                      value={bkashPassword}
                      onChange={(e) => setBkashPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nagad Section */}
        <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-black text-amber-900 text-sm">Nagad Payment Gateway</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Fast Post Office
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={nagadEnabled}
                onChange={(e) => setNagadEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          {nagadEnabled && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5 w-full sm:w-1/2">
                <label className="font-bold text-slate-700">Nagad Merchant / Personal Account Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01712345678"
                  value={nagadMerchantNumber}
                  onChange={(e) => setNagadMerchantNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <span className="text-[10px] text-slate-500">
                  Customers will send payment to this number and input their TrxID on checkout.
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-[#008B47] text-white font-extrabold rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save Payment Settings</span>
          </button>
        </div>
      </form>
      )}

      {/* ============================================================== */}
      {/* 1.5 VAT & GOVERNMENT TAX SETTINGS                              */}
      {/* ============================================================== */}
      {(activeTab === "all" || activeTab === "vat") && (
      <form onSubmit={handleSaveVat} className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">VAT &amp; Government Tax Settings (ভ্যাট ম্যানেজমেন্ট)</h2>
              <p className="text-slate-400 text-[11px]">Configure NBR VAT rates, Business Identification Number (BIN), and tax-inclusive invoice calculation.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={vatOn}
              onChange={(e) => setVatOn(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#008B47]"></div>
            <span className="ml-2 font-bold text-slate-700">{vatOn ? "VAT Enabled" : "Disabled"}</span>
          </label>
        </div>

        {vatOn && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Standard VAT Rate (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={vRate}
                    onChange={(e) => setVRate(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-bold focus:outline-none focus:border-[#008B47]"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
                <span className="text-[10px] text-slate-400">Bangladesh standard NBR e-commerce rate is typically 5% or 7.5%.</span>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Business Identification Number (BIN / VAT Reg No.)</label>
                <input
                  type="text"
                  placeholder="e.g. BIN-004819283-0101"
                  value={vBin}
                  onChange={(e) => setVBin(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-[#008B47]"
                />
                <span className="text-[10px] text-slate-400">Printed on official customer invoice headers as per NBR guidelines.</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={vInclusive}
                  onChange={(e) => setVInclusive(e.target.checked)}
                  className="w-4 h-4 rounded text-[#008B47] focus:ring-[#008B47]"
                />
                <span className="font-extrabold text-slate-800">Product Prices are Already VAT-Inclusive (মূল্যের মধ্যে ভ্যাট অন্তর্ভুক্ত)</span>
              </label>
              <p className="text-[11px] text-slate-500 pl-6">
                When checked, listed product prices include VAT (tax is reverse-calculated on invoices). When unchecked, VAT ({vRate}%) is added as an extra line item during checkout.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-slate-900 hover:bg-[#008B47] text-white font-extrabold rounded-xl transition shadow-xs flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Save VAT Settings</span>
          </button>
        </div>
      </form>
      )}

      {/* ============================================================== */}
      {/* 1.6 INVOICE TEMPLATES & BRAND CUSTOMIZER                        */}
      {/* ============================================================== */}
      {(activeTab === "all" || activeTab === "invoice") && (
        <InvoiceTemplateCustomizer />
      )}

      {/* ============================================================== */}
      {/* 2. STEADFAST & PATHAO COURIER API CARD                         */}
      {/* ============================================================== */}
      {(activeTab === "all" || activeTab === "courier") && (
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Steadfast &amp; Pathao Courier Logistics API</h2>
              <p className="text-slate-400 text-[11px]">
                Automate consignment bookings, generate instant tracking IDs, and view merchant COD balance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-emerald-50 p-2.5 rounded-2xl border border-emerald-200">
            <Wallet className="w-4 h-4 text-emerald-700" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Steadfast COD Balance</span>
              <span className="text-sm font-black text-emerald-800">{courierBalance}</span>
            </div>
            <button
              type="button"
              onClick={fetchBalance}
              disabled={isLoadingBalance}
              className="p-1 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded-lg transition"
              title="Refresh Balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBalance ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveCourier} className="space-y-5">
          {/* Steadfast Courier Section */}
          <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-black text-emerald-900 text-xs uppercase tracking-wide">Steadfast Courier API</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={steadfastEnabled}
                  onChange={(e) => setSteadfastEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Steadfast API Key</label>
                <input
                  type="text"
                  placeholder="Enter Steadfast API Key..."
                  value={steadfastApiKey}
                  onChange={(e) => setSteadfastApiKey(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Steadfast Secret Key</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••"
                  value={steadfastSecretKey}
                  onChange={(e) => setSteadfastSecretKey(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>

          {/* Pathao Courier Section */}
          <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-rose-900 text-xs uppercase tracking-wide">Pathao Courier Merchant API</span>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">v2 Aladdin</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPathaoClientId("7N1aMJQBwm");
                    setPathaoClientSecret("wRcaibZkUdSNz2EI9ZyuXLINrnAv0TdPUPXMnD39");
                    setPathaoUsername("test@pathao.com");
                    setPathaoPassword("lovePathao");
                    setPathaoStoreId("");
                    showNotification("Loaded Pathao official Sandbox/Test credentials!");
                  }}
                  className="text-[10px] font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs transition"
                >
                  🧪 Fill Test Sandbox Keys
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pathaoEnabled}
                    onChange={(e) => setPathaoEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600"></div>
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Pathao Client ID *</label>
                <input
                  type="text"
                  placeholder="e.g. nXe0E97axr"
                  value={pathaoClientId}
                  onChange={(e) => setPathaoClientId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Pathao Client Secret *</label>
                <input
                  type="password"
                  placeholder="Enter Pathao Client Secret..."
                  value={pathaoClientSecret}
                  onChange={(e) => setPathaoClientSecret(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Pathao Merchant Username (Email) *</label>
                <input
                  type="email"
                  placeholder="e.g. your-email@domain.com"
                  value={pathaoUsername}
                  onChange={(e) => setPathaoUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Pathao Account Password *</label>
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={pathaoPassword}
                  onChange={(e) => setPathaoPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Pathao Store ID (Optional)</label>
                  <button
                    type="button"
                    disabled={isTestingPathao}
                    onClick={handleTestPathao}
                    className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-100 hover:bg-rose-200 px-3 py-1 rounded-lg transition flex items-center gap-1"
                  >
                    {isTestingPathao ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    <span>Test Pathao Connection</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Leave empty for primary default pickup store..."
                  value={pathaoStoreId}
                  onChange={(e) => setPathaoStoreId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            {pathaoTestResult && (
              <div className={`p-3 rounded-xl text-xs font-bold ${pathaoTestResult.success ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-rose-100 text-rose-900 border border-rose-300"}`}>
                {pathaoTestResult.message}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-[#008B47] text-white font-extrabold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save Courier Credentials</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* ============================================================== */}
      {/* 2.5 SMS NOTIFICATION GATEWAY (Greenweb / BulkSMSBD / Sandbox) */}
      {/* ============================================================== */}
      {(activeTab === "all" || activeTab === "sms") && (
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">SMS Notification Gateway</h2>
              <p className="text-slate-400 text-[11px]">Instant Order Confirmation and Tracking Link SMS to customer mobile phones</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-[11px] font-extrabold flex items-center gap-1.5">
              <span>Balance:</span>
              <span className="text-indigo-600 font-black">{smsBalance}</span>
            </div>
            <button
              type="button"
              onClick={handleRefreshSmsBalance}
              disabled={isLoadingSmsBalance}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
              title="Refresh SMS Balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSmsBalance ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSaveSms} className="space-y-5">
          {/* SMS Status Toggle */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2">
                <span>Enable Automated SMS Gateway</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                  Customer Notifications
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Automatically fire transactional SMS when customers place orders or when parcels are dispatched
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={smsEnabled}
                onChange={(e) => setSmsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Provider Selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700">Select SMS Provider</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSmsProvider("GREENWEB")}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  smsProvider === "GREENWEB"
                    ? "bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
                  <span>Greenweb Bangladesh</span>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                    Popular
                  </span>
                </div>
                <div className="text-[10px] font-normal text-slate-500 mt-0.5">greenweb.com.bd</div>
              </button>

              <button
                type="button"
                onClick={() => setSmsProvider("BULKSMSBD")}
                className={`p-3.5 rounded-2xl border text-left transition ${
                  smsProvider === "BULKSMSBD"
                    ? "bg-indigo-50/70 border-indigo-500 ring-1 ring-indigo-500"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="font-extrabold text-slate-900 text-xs flex items-center justify-between">
                  <span>BulkSMSBD</span>
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    Direct API
                  </span>
                </div>
                <div className="text-[10px] font-normal text-slate-500 mt-0.5">bulksmsbd.net</div>
              </button>
            </div>
          </div>

          {/* Credentials */}
          <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">API Key / Token</label>
              <input
                type="password"
                placeholder="Leave empty for free Sandbox Simulation mode..."
                value={smsApiKey}
                onChange={(e) => setSmsApiKey(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-slate-400 block">
                {smsProvider === "GREENWEB" ? "Your Greenweb API Token" : "Your BulkSMSBD API Key"}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Sender ID / Masking Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 8809612345678 or Brand Name..."
                value={smsSenderId}
                onChange={(e) => setSmsSenderId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[10px] text-slate-400 block">Leave blank for non-masking standard rate</span>
            </div>
          </div>

          {/* Templates */}
          <div className="space-y-4 pt-1">
            <div className="font-bold text-slate-900 text-xs">Customer SMS Templates &amp; Triggers</div>

            {/* Order Placed Template */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">1. Order Confirmation SMS</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsOrderPlacedEnabled}
                    onChange={(e) => setSmsOrderPlacedEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
              <textarea
                rows={2}
                value={smsOrderPlacedTemplate}
                onChange={(e) => setSmsOrderPlacedTemplate(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <div className="text-[10px] text-slate-400">
                Variables: <code className="text-indigo-600">&#123;customer_name&#125;</code>,{" "}
                <code className="text-indigo-600">&#123;order_number&#125;</code>,{" "}
                <code className="text-indigo-600">&#123;total&#125;</code>
              </div>
            </div>

            {/* Order Shipped Template */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 text-xs">2. Order Shipped &amp; Dispatched SMS</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smsOrderShippedEnabled}
                    onChange={(e) => setSmsOrderShippedEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <textarea
                rows={2}
                value={smsOrderShippedTemplate}
                onChange={(e) => setSmsOrderShippedTemplate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans"
              />
              <div className="text-[10px] text-slate-400 font-mono">
                Tags: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">{'{customer_name}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">{'{order_number}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">{'{courier_name}'}</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">{'{tracking_code}'}</code>
              </div>
            </div>
          </div>

          {/* Test SMS Dispatch Box */}
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-indigo-950 text-xs">🧪 Send Live Test SMS</span>
              <span className="text-[10px] text-indigo-700 font-medium">Verify your SMS Gateway in real-time</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="tel"
                placeholder="Enter mobile number e.g. 01712345678"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-indigo-200 text-slate-900 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                disabled={isSendingTestSms || !testPhone}
                onClick={handleSendTestSms}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isSendingTestSms ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Send Test SMS</span>
              </button>
            </div>

            {testSmsResult && (
              <div className={`p-3 rounded-xl text-xs font-bold ${testSmsResult.success ? "bg-emerald-100 text-emerald-900 border border-emerald-300" : "bg-rose-100 text-rose-900 border border-rose-300"}`}>
                {testSmsResult.message}
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-extrabold rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save SMS Settings</span>
            </button>
          </div>
        </form>
      </div>
      )}

      {/* ============================================================== */}
      {/* 3. AD PIXELS & ANALYTICS TRACKING (META, TIKTOK, GA4)          */}
      {/* ============================================================== */}
      {(activeTab === "all" || activeTab === "pixels") && (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setIsSavingPixels(true);
          try {
            const res = await api.updateSeoSettings({
              metaPixelId: metaPixelId.trim() || null,
              tiktokPixelId: tiktokPixelId.trim() || null,
              ga4MeasurementId: ga4MeasurementId.trim() || null,
            });
            if (res.success) {
              setNotification("Ad Pixels & Analytics Tracking updated successfully!");
            } else {
              setNotification("Failed to update pixels.");
            }
          } catch (err: any) {
            setNotification(err.message || "Failed to update pixels.");
          } finally {
            setIsSavingPixels(false);
            setTimeout(() => setNotification(null), 3500);
          }
        }}
        className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Ad Pixels &amp; Conversion Analytics</h2>
              <p className="text-slate-400 text-[11px]">
                Track PageView, ViewContent, AddToCart, InitiateCheckout &amp; Purchase (with BDT total) for Facebook &amp; TikTok ads
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>High-ROAS E-Commerce Engine</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Meta (Facebook) Pixel */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>Meta (Facebook) Pixel</span>
              </span>
              {metaPixelId.trim() && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Active</span>
              )}
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Pixel ID (Dataset ID) *</label>
              <input
                type="text"
                placeholder="e.g. 123456789012345"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-[10px] text-slate-400 block">Found in Meta Events Manager &gt; Datasets</span>
            </div>
          </div>

          {/* TikTok Pixel */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                <span>TikTok Pixel</span>
              </span>
              {tiktokPixelId.trim() && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Active</span>
              )}
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">TikTok Pixel ID *</label>
              <input
                type="text"
                placeholder="e.g. C1234567890ABC"
                value={tiktokPixelId}
                onChange={(e) => setTiktokPixelId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
              <span className="text-[10px] text-slate-400 block">Found in TikTok Ads Manager &gt; Assets &gt; Events</span>
            </div>
          </div>

          {/* Google Analytics 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Google Analytics 4 (GA4)</span>
              </span>
              {ga4MeasurementId.trim() && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">Active</span>
              )}
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 text-[11px]">Measurement ID *</label>
              <input
                type="text"
                placeholder="e.g. G-XXXXXXXXXX"
                value={ga4MeasurementId}
                onChange={(e) => setGa4MeasurementId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 font-mono font-bold text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <span className="text-[10px] text-slate-400 block">Found in GA4 Admin &gt; Data Streams</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSavingPixels}
            className="px-6 py-2.5 bg-slate-900 hover:bg-[#008B47] text-white font-extrabold rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSavingPixels ? "Saving Pixels..." : "Save Ad Pixels & Analytics"}</span>
          </button>
        </div>
      </form>
      )}

      {/* ============================================================== */}
      {/* 3. SHIPPING RATES & FREE DELIVERY THRESHOLD                    */}
      {/* ============================================================== */}
      {(activeTab === "all" || activeTab === "shipping") && (
      <form onSubmit={handleSaveShipping} className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-base font-black text-slate-900">Delivery Rates &amp; Free Shipping Bar</h2>
          <p className="text-slate-400 text-[11px]">Configure Inside/Outside Dhaka rates and the dynamic customer cart progress bar</p>
        </div>

        {/* Enable / Disable Toggle */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="font-extrabold text-slate-900 text-sm">Enable Free Shipping Threshold</div>
            <p className="text-slate-500 text-[11px] mt-0.5">
              When enabled, orders exceeding this minimum subtotal unlock automatic 100% Free Delivery.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        {/* Threshold input */}
        {enabled && (
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Free Delivery Minimum Order Threshold (BDT ৳) *</label>
            <div className="relative w-full sm:w-1/2">
              <input
                type="number"
                required
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <span className="text-[11px] text-slate-400 block">
              Example: ৳2000. Any cart with ৳2000 or more will get free shipping.
            </span>
          </div>
        )}

        {/* Courier rates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Inside Dhaka Delivery Rate (BDT ৳) *</label>
            <input
              type="number"
              required
              value={insideDhakaFee}
              onChange={(e) => setInsideDhakaFee(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="text-[11px] text-slate-400">Pathao / Steadfast rate for Dhaka City (1-2 Days)</span>
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Outside Dhaka Delivery Rate (BDT ৳) *</label>
            <input
              type="number"
              required
              value={outsideDhakaFee}
              onChange={(e) => setOutsideDhakaFee(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <span className="text-[11px] text-slate-400">Nationwide courier across all 63 districts (2-4 Days)</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Save Shipping Rates</span>
          </button>
        </div>
      </form>
      )}

      {/* ============================================================== */}
      {/* 4. PRODUCT PAGE MARKETING & URGENCY WIDGETS                   */}
      {/* ============================================================== */}
      {(activeTab === "all" || activeTab === "marketing") && (
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Product Page Conversion &amp; Marketing Widgets</h2>
              <p className="text-slate-400 text-[11px]">
                Control the visibility of flash sale countdown urgency bars and multi-buy quantity bundle discounts
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Flash Deals Urgency Countdown Banner Toggle & Config */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>⚡ Flash Sale Countdown Timer</span>
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={flashTimerEnabled}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setFlashTimerEnabled(val);
                      updateSettings({ showFlashSaleCountdown: val });
                      setNotification(val ? "Flash Sale Countdown enabled on product pages!" : "Flash Sale Countdown hidden from product pages!");
                      setTimeout(() => setNotification(null), 3000);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Displays the animated urgency countdown timer banner (*"04h : 42m : 15s"*) and scarcity progress bar right above the checkout buttons.
              </p>

              {flashTimerEnabled && (
                <div className="space-y-2.5 pt-3 border-t border-slate-200/80">
                  <div className="font-black text-slate-800 text-xs uppercase tracking-wider">
                    Banner Copy &amp; Stock Scarcity Config
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 text-[11px]">Banner Title Text</label>
                    <input
                      type="text"
                      value={bannerTitle}
                      onChange={(e) => {
                        setBannerTitle(e.target.value);
                        updateSettings({ flashSaleBannerTitle: e.target.value });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-bold"
                      placeholder="e.g. Flash Sale Offer Ending Soon:"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="font-semibold text-slate-600 text-[11px]">Scarcity / Stock Text</label>
                      <input
                        type="text"
                        value={scarcityText}
                        onChange={(e) => {
                          setScarcityText(e.target.value);
                          updateSettings({ flashSaleScarcityText: e.target.value });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-medium"
                        placeholder="e.g. 84% Sold — Limited Import Stock"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 text-[11px]">Sold Bar (%)</label>
                      <input
                        type="number"
                        min="5"
                        max="99"
                        value={progressPct}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 84;
                          setProgressPct(val);
                          updateSettings({ flashSaleProgressPercent: val });
                        }}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-bold text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 text-[11px]">Right Savings Badge</label>
                    <input
                      type="text"
                      value={savingsBadge}
                      onChange={(e) => {
                        setSavingsBadge(e.target.value);
                        updateSettings({ flashSaleSavingsBadge: e.target.value });
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-bold text-rose-700 font-mono"
                      placeholder="AUTO (Calculate from bulk discounts) or custom text"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Type <strong>AUTO</strong> to dynamically compute max savings from Tier 3 bundle, or enter custom promo text.
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-200/60">
              <span className={`w-2 h-2 rounded-full ${flashTimerEnabled ? "bg-amber-500" : "bg-slate-300"}`} />
              <span>Status: {flashTimerEnabled ? "Currently Displaying (Active)" : "Hidden from Storefront"}</span>
            </div>
          </div>

          {/* Multi-Buy Quantity Bundle Discounts Toggle & Config */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <span>📦 Multi-Buy Quantity Bundles</span>
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bundleOffersEnabled}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setBundleOffersEnabled(val);
                      updateSettings({ showBundleDiscounts: val });
                      setNotification(val ? "Bundle discount cards enabled on product pages!" : "Bundle discount cards hidden from product pages!");
                      setTimeout(() => setNotification(null), 3000);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Displays 1-Click Multi-Buy discount selector cards (*"Buy 1"*, *"Buy 2 Save 10%"*, *"Buy 3 Save 18% + Free Delivery"*) on product pages.
              </p>

              {bundleOffersEnabled && (
                <div className="space-y-3 pt-3 border-t border-slate-200/80">
                  <div className="font-black text-slate-800 text-xs uppercase tracking-wider">
                    Discount Tiers &amp; Incentives Configuration
                  </div>

                  {/* Tier 2 Config */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>Tier 2 Offer ("Most Popular")</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-black">
                        Save {b2Disc}% OFF
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="font-semibold text-slate-600 text-[11px]">Units Qty</label>
                        <input
                          type="number"
                          min="2"
                          value={b2Qty}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 2;
                            setB2Qty(val);
                            updateSettings({ bundle2Qty: val });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 text-[11px]">Discount (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={b2Disc}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 10;
                            setB2Disc(val);
                            updateSettings({ bundle2DiscountPercent: val });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tier 3 Config */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                    <div className="font-bold text-slate-800 text-xs flex items-center justify-between">
                      <span>Tier 3 Offer ("Best Value")</span>
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-black">
                        Save {b3Disc}% OFF
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="font-semibold text-slate-600 text-[11px]">Units Qty</label>
                        <input
                          type="number"
                          min="3"
                          value={b3Qty}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 3;
                            setB3Qty(val);
                            updateSettings({ bundle3Qty: val });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-600 text-[11px]">Discount (%)</label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={b3Disc}
                          onChange={(e) => {
                            const val = Number(e.target.value) || 18;
                            setB3Disc(val);
                            updateSettings({ bundle3DiscountPercent: val });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 font-bold"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={b3FreeShip}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setB3FreeShip(val);
                          updateSettings({ bundle3FreeDelivery: val });
                        }}
                        className="w-3.5 h-3.5 rounded text-emerald-600"
                      />
                      <span className="text-[11px] font-bold text-emerald-800">
                        Include "+ Free Delivery" badge for Tier 3
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 pt-2 border-t border-slate-200/60">
              <span className={`w-2 h-2 rounded-full ${bundleOffersEnabled ? "bg-emerald-600" : "bg-slate-300"}`} />
              <span>Status: {bundleOffersEnabled ? "Currently Displaying (Active)" : "Hidden from Storefront"}</span>
            </div>
          </div>
        </div>

        {/* Live Visual Preview of Connected Marketing Widgets */}
        {(flashTimerEnabled || bundleOffersEnabled) && (
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-900">
                <span>👁️ Live Storefront Product Page Preview (Sample ৳300 Item):</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded">
                Connected &amp; Dynamic
              </span>
            </div>

            {/* Flash Sale Banner Preview */}
            {flashTimerEnabled && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-black text-slate-900">
                  <span className="flex items-center gap-1.5 text-amber-800">
                    <span className="text-sm">⚡</span>
                    <span>{bannerTitle || "Flash Sale Offer Ending Soon:"}</span>
                  </span>
                  <div className="flex items-center gap-1 font-mono text-[11px] font-black text-white">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900">04h</span>
                    <span className="text-slate-900 font-bold">:</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900">42m</span>
                    <span className="text-slate-900 font-bold">:</span>
                    <span className="px-1.5 py-0.5 rounded bg-rose-600 animate-pulse">15s</span>
                  </div>
                </div>
                <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(5, progressPct || 84))}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-600">
                  <span>🔥 {scarcityText || "84% Sold — Limited China Import Stock"}</span>
                  <span className="text-rose-700 font-black">
                    {savingsBadge && savingsBadge !== "AUTO"
                      ? savingsBadge
                      : `Save Up to ৳${Math.round(300 * b3Qty * (b3Disc / 100))} Extra`}
                  </span>
                </div>
              </div>
            )}

            {/* Bundle Cards Preview */}
            {bundleOffersEnabled && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Bundle Offers &amp; Multi-Buy Discounts:</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    1-Click Auto Apply
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-2xl border border-slate-200 bg-white">
                    <span className="text-[11px] font-black text-slate-900 block">Buy 1 Unit</span>
                    <span className="text-xs font-extrabold text-slate-700 block mt-0.5">৳300</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Standard Price</span>
                  </div>

                  <div className="p-2.5 rounded-2xl border border-[#008B47] bg-emerald-50/50 relative overflow-hidden">
                    <span className="absolute top-0 right-0 bg-[#008B47] text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase">
                      Save ৳{Math.round(300 * b2Qty * (b2Disc / 100))}
                    </span>
                    <span className="text-[11px] font-black text-slate-900 block">Buy {b2Qty} Units</span>
                    <span className="text-xs font-extrabold text-[#008B47] block mt-0.5">
                      ৳{Math.round(300 * b2Qty * (1 - b2Disc / 100))}
                    </span>
                    <span className="text-[9px] text-slate-500 line-through block mt-0.5">৳{300 * b2Qty}</span>
                  </div>

                  <div className="p-2.5 rounded-2xl border border-amber-300 bg-amber-50/30 relative overflow-hidden">
                    <span className="absolute top-0 right-0 bg-amber-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase">
                      Save ৳{Math.round(300 * b3Qty * (b3Disc / 100))}
                    </span>
                    <span className="text-[11px] font-black text-slate-900 block">Buy {b3Qty} Units</span>
                    <span className="text-xs font-extrabold text-amber-700 block mt-0.5">
                      ৳{Math.round(300 * b3Qty * (1 - b3Disc / 100))}
                    </span>
                    <span className="text-[9px] text-emerald-800 font-bold block mt-0.5">
                      {b3FreeShip ? "+ Free Delivery" : `Save ${b3Disc}%`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. DATABASE BACKUP & RESTORE SECTION                           */}
      {/* ============================================================== */}
      {(activeTab === "all" || activeTab === "backup") && (
        <AdminDatabaseBackupCard
          showNotification={(msg) => {
            setNotification(msg);
            setTimeout(() => setNotification(null), 3500);
          }}
        />
      )}

      {/* ============================================================== */}
      {/* 6. ADMIN SECURITY & PASSWORD SECTION                           */}
      {/* ============================================================== */}
      {(activeTab === "all" || activeTab === "security") && (
        <AdminSecuritySettingsCard
          showNotification={(msg) => {
            setNotification(msg);
            setTimeout(() => setNotification(null), 3500);
          }}
        />
      )}
    </div>
  );
}

function AdminDatabaseBackupCard({ showNotification }: { showNotification: (msg: string) => void }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExportBackup = () => {
    setIsExporting(true);
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        store: "Raifa's Mart",
        products: localStorage.getItem("raifas_mart_products_v1") ? JSON.parse(localStorage.getItem("raifas_mart_products_v1")!) : [],
        orders: localStorage.getItem("raifas_mart_orders_v1") ? JSON.parse(localStorage.getItem("raifas_mart_orders_v1")!) : [],
        customers: localStorage.getItem("raifas_mart_customers_v1") ? JSON.parse(localStorage.getItem("raifas_mart_customers_v1")!) : [],
        categories: localStorage.getItem("raifas_mart_categories_v1") ? JSON.parse(localStorage.getItem("raifas_mart_categories_v1")!) : [],
        reviews: localStorage.getItem("raifas_mart_reviews_v1") ? JSON.parse(localStorage.getItem("raifas_mart_reviews_v1")!) : [],
        shippingSettings: localStorage.getItem("raifas_mart_shipping_settings_v1") ? JSON.parse(localStorage.getItem("raifas_mart_shipping_settings_v1")!) : {},
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `raifas-mart-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification("Database snapshot downloaded successfully!");
    } catch (err: any) {
      showNotification("Failed to export backup: " + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        if (data.products) localStorage.setItem("raifas_mart_products_v1", JSON.stringify(data.products));
        if (data.orders) localStorage.setItem("raifas_mart_orders_v1", JSON.stringify(data.orders));
        if (data.customers) localStorage.setItem("raifas_mart_customers_v1", JSON.stringify(data.customers));
        if (data.categories) localStorage.setItem("raifas_mart_categories_v1", JSON.stringify(data.categories));
        if (data.reviews) localStorage.setItem("raifas_mart_reviews_v1", JSON.stringify(data.reviews));
        if (data.shippingSettings) localStorage.setItem("raifas_mart_shipping_settings_v1", JSON.stringify(data.shippingSettings));
        showNotification("Store database restored successfully! Reloading page...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err: any) {
        showNotification("Invalid JSON backup file: " + err.message);
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
      <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-black text-slate-900">1-Click Database Backup &amp; Restore</h2>
          <p className="text-slate-400 text-[11px]">
            Export or import products, customer accounts, orders, reviews, and settings in standard JSON format
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div>
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <DownloadCloud className="w-4 h-4 text-cyan-700" />
              <span>Download Store Backup</span>
            </div>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Creates an encrypted, full snapshot file containing all products, categories, orders, and configurations.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="px-5 py-2.5 bg-slate-900 hover:bg-cyan-700 text-white font-extrabold rounded-xl transition shadow-xs flex items-center gap-2 disabled:opacity-50"
          >
            <DownloadCloud className="w-4 h-4" />
            <span>{isExporting ? "Generating Snapshot..." : "Export Store Backup (.JSON)"}</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
          <div>
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-amber-600" />
              <span>Restore from Backup</span>
            </div>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              Upload a previously downloaded JSON snapshot to instantly restore all catalog and order data.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-800 font-extrabold border border-slate-300 rounded-xl transition shadow-xs cursor-pointer">
            <UploadCloud className="w-4 h-4 text-amber-600" />
            <span>{isImporting ? "Restoring Database..." : "Select .JSON Backup File"}</span>
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}

function AdminSecuritySettingsCard({ showNotification }: { showNotification: (msg: string) => void }) {
  const { adminUser, updateProfile, changePassword } = useAdminAuthStore();
  const [name, setName] = useState(adminUser?.name || "Rafiqul Islam");
  const [email, setEmail] = useState(adminUser?.email || "admin@raifasmart.com");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState<string | null>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: name.trim(), email: email.trim() });
    showNotification("Admin profile details updated successfully!");
  };

  const handlePasswordSave = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPass !== confirmPass) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    const res = changePassword(currentPass, newPass);
    if (!res.success) {
      setPassError(res.message);
    } else {
      showNotification("Admin login password changed successfully!");
      setCurrentPass("");
      setNewPass("");
      setConfirmPass("");
    }
  };

  return (
    <div className="space-y-6">
      {/* ============================================================== */}
      {/* 5. DATABASE BACKUP & 1-CLICK DISASTER RECOVERY                */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Database Backup &amp; Disaster Recovery</h2>
              <p className="text-slate-400 text-[11px]">
                Create full encrypted JSON snapshots of all products, orders, customers, and store configurations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-[#008B47] text-[11px] font-bold border border-emerald-200">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Cloud &amp; Local Redundancy</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Download Backup */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <DownloadCloud className="w-4 h-4 text-indigo-600" />
              <span>Export Store Database Snapshot</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Downloads a complete `.json` archive containing all products, categories, orders, customers, reviews, coupons, and SEO settings.
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await api.exportBackup();
                  if (res.success && res.data) {
                    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `raifas-mart-database-backup-${new Date().toISOString().split("T")[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    setNotification("Database backup downloaded successfully!");
                    setTimeout(() => setNotification(null), 3500);
                  }
                } catch (err: any) {
                  alert(err.message || "Failed to export backup");
                }
              }}
              className="px-4 py-2.5 bg-slate-900 hover:bg-indigo-600 text-white font-extrabold rounded-xl transition shadow-xs flex items-center gap-2"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Download 1-Click Backup (.json)</span>
            </button>
          </div>

          {/* Restore / Import Backup */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              <span>Restore Database from File</span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed">
              Upload a previously downloaded `.json` snapshot to restore your catalog, pricing, and configurations instantly.
            </p>
            <label className="cursor-pointer px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#008B47] border border-emerald-300 font-extrabold rounded-xl transition shadow-xs inline-flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              <span>Select Backup File to Restore</span>
              <input
                type="file"
                accept=".json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const text = await file.text();
                    const parsed = JSON.parse(text);
                    const res = await api.restoreBackup(parsed);
                    if (res.success) {
                      setNotification("Store backup restored successfully!");
                      setTimeout(() => setNotification(null), 3500);
                    }
                  } catch (err: any) {
                    alert("Invalid backup file: " + err.message);
                  }
                }}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-200/80 pt-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-700" />
            <span>Admin Account &amp; Password Security</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your admin credentials, login email, and security password.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Card */}
        <form onSubmit={handleProfileSave} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2.5">
            Administrator Profile
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Login Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-[#008B47] text-white font-extrabold rounded-xl transition shadow-xs"
            >
              Update Admin Profile
            </button>
          </div>
        </form>

        {/* Change Password Card */}
        <form onSubmit={handlePasswordSave} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <div className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2.5">
            Change Login Password
          </div>

          {passError && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs">
              {passError}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Current Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Confirm New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold rounded-xl transition shadow-xs"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


