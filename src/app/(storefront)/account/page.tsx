"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useCustomerAuthStore, CustomerAddress } from "@/store/useCustomerAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useProductStore } from "@/store/useProductStore";
import { formatPrice } from "@/lib/formatters";
import {
  LayoutDashboard,
  ShoppingBag,
  MapPin,
  User,
  Heart,
  LogOut,
  ChevronRight,
  Edit,
  CheckCircle2,
  Phone,
  Mail,
  Truck,
  ExternalLink,
  Save,
  Package,
  Calendar,
  Lock,
  ArrowRight,
  Tag,
  Compass,
  Eye,
  RotateCcw,
  X,
  Sparkles,
  ShoppingBasket,
  Clock,
  Check,
} from "lucide-react";

interface CustomerAccountPageProps {
  initialTab?: "dashboard" | "orders" | "addresses" | "account" | "wishlist";
}

export default function CustomerAccountPage({ initialTab }: CustomerAccountPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    customer,
    isLoggedIn,
    orders: authOrders,
    logout,
    updateProfile,
    updateShippingAddress,
    openAuthModal,
  } = useCustomerAuthStore();

  const { orders: centralOrders } = useOrderStore();
  const { products } = useProductStore();
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  // Selected Order for Modern Modal Popup View
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  // Helper to resolve product image, slug, and object
  const resolveProduct = (it: any) => {
    const matched = products.find(
      (p) =>
        (it.productId && p.id === it.productId) ||
        (it.slug && p.slug === it.slug) ||
        p.title.toLowerCase().trim() === (it.title || "").toLowerCase().trim() ||
        (it.title && p.title.toLowerCase().includes(it.title.toLowerCase())) ||
        (it.title && it.title.toLowerCase().includes(p.title.toLowerCase()))
    );

    const slug = it.slug || matched?.slug || "";
    const image =
      it.image ||
      matched?.images?.[0] ||
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80";

    return { matched, slug, image };
  };

  // Buy item again (1-click add to cart)
  const handleBuyAgain = (it: any) => {
    const { matched, slug } = resolveProduct(it);
    if (matched) {
      let targetVariant = undefined;
      if (it.variantName && matched.variants && matched.variants.length > 0) {
        targetVariant = matched.variants.find((v: any) => v.name === it.variantName || v.sku === it.sku);
      }
      addToCart(matched, it.qty || 1, targetVariant);
      useCartStore.getState().openDrawer();
      showNotification(`Added "${it.title}" to cart!`);
    } else if (slug) {
      router.push(`/product/${slug}`);
    } else {
      router.push("/shop");
    }
  };

  // Reorder all items from an order
  const handleReorderAll = (order: any) => {
    if (!order.items || order.items.length === 0) return;
    let addedCount = 0;
    order.items.forEach((it: any) => {
      const { matched } = resolveProduct(it);
      if (matched) {
        let targetVariant = undefined;
        if (it.variantName && matched.variants) {
          targetVariant = matched.variants.find((v: any) => v.name === it.variantName || v.sku === it.sku);
        }
        addToCart(matched, it.qty || 1, targetVariant);
        addedCount++;
      }
    });
    useCartStore.getState().openDrawer();
    showNotification(`Added ${addedCount} items from Order #${order.id} to cart!`);
  };

  // Combine auth orders and central store orders matching customer phone/name with real-time status
  const orders = React.useMemo(() => {
    const custPhone = (customer?.phone || "").replace(/[^0-9]/g, "");
    
    // Find all matching orders from central database
    const matchingCentral = centralOrders.filter((co) => {
      const orderPhone = (co.phone || "").replace(/[^0-9]/g, "");
      const phoneMatch = custPhone && orderPhone && (custPhone.includes(orderPhone) || orderPhone.includes(custPhone));
      const authIdMatch = (authOrders || []).some((ao) => ao.id === co.id);
      return phoneMatch || authIdMatch;
    });

    // Map into customer order history structure with live status
    const combinedMap = new Map<string, any>();

    // First add from authOrders with order creation index for preservation
    (authOrders || []).forEach((ao, idx) => {
      combinedMap.set(ao.id, {
        ...ao,
        _sourceOrder: idx,
      });
    });

    // Update or add from central orders with live status & tracking
    matchingCentral.forEach((co, idx) => {
      const existing = combinedMap.get(co.id);
      combinedMap.set(co.id, {
        id: co.id,
        date: existing?.date || co.time || "Just now",
        createdAt: co.createdAt || existing?.createdAt,
        total: co.total,
        status: co.status,
        paymentMethod: co.payment || existing?.paymentMethod,
        courierTracking: co.courierTracking || existing?.courierTracking,
        address: co.address || existing?.address,
        district: co.district || existing?.district,
        items: co.items?.map((it: any) => ({
          title: it.title,
          slug: it.slug || existing?.items?.find((ei: any) => ei.title === it.title)?.slug,
          productId: it.productId || it.id || existing?.items?.find((ei: any) => ei.title === it.title)?.productId,
          variantName: it.variantName || it.variant,
          qty: it.qty,
          price: it.price,
          image: it.image || existing?.items?.find((ei: any) => ei.title === it.title)?.image,
        })) || existing?.items || [],
        _sourceOrder: existing?._sourceOrder ?? (1000 + idx),
      });
    });

    const list = Array.from(combinedMap.values());
    
    const getOrderTimestamp = (order: any): number => {
      // 1. If explicit ISO createdAt exists
      if (order.createdAt) {
        const t = new Date(order.createdAt).getTime();
        if (!isNaN(t) && t > 1000000000000) return t;
      }

      // 2. If ID contains full epoch timestamp
      const longDigits = String(order.id || "").match(/\d{10,13}/);
      if (longDigits && longDigits[0]) {
        const val = Number(longDigits[0]);
        if (val > 1000000000000) return val;
        if (val > 1000000000) return val * 1000;
      }

      // 3. If ID is RM-XXXXXX-YYYY (standard format where XXXXXX is 6-digit timestamp)
      const rmMatch = String(order.id || "").match(/^RM-(\d{6})/i);
      if (rmMatch && rmMatch[1]) {
        const sixDigit = Number(rmMatch[1]);
        return 1700000000000 + sixDigit * 1000;
      }

      // 4. Try parsing standard date string
      const dateStr = String(order.date || order.time || "").trim();
      if (dateStr && !dateStr.toLowerCase().includes("now") && !dateStr.toLowerCase().includes("recent")) {
        const parsed = Date.parse(dateStr);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }

      // 5. Fallback relative text calculation
      const lower = dateStr.toLowerCase();
      if (lower.includes("just now") || lower.includes("now") || lower.includes("sec")) {
        return Date.now();
      }
      if (lower.includes("min")) {
        const m = parseInt(lower) || 1;
        return Date.now() - m * 60 * 1000;
      }
      if (lower.includes("hour")) {
        const h = parseInt(lower) || 1;
        return Date.now() - h * 3600 * 1000;
      }
      if (lower.includes("day") || lower.includes("yesterday")) {
        const d = parseInt(lower) || 1;
        return Date.now() - d * 86400 * 1000;
      }

      return 0;
    };

    // Sort strictly newest-first (highest timestamp at index 0)
    list.sort((a, b) => {
      const timeA = getOrderTimestamp(a);
      const timeB = getOrderTimestamp(b);
      if (timeB !== timeA) return timeB - timeA;
      // If timestamps tie, sort by ID descending (larger order numbers first)
      return String(b.id || "").localeCompare(String(a.id || ""), undefined, { numeric: true });
    });

    return list;
  }, [customer?.phone, authOrders, centralOrders]);

  // Determine current active tab from pathname or initialTab
  const currentTab = React.useMemo(() => {
    if (initialTab) return initialTab;
    if (pathname.includes("/orders")) return "orders";
    if (pathname.includes("/addresses")) return "addresses";
    if (pathname.includes("/account") && (pathname.endsWith("/account") || pathname.includes("/profile"))) return "account";
    if (pathname.includes("/wishlist")) return "wishlist";
    return "dashboard";
  }, [initialTab, pathname]);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "addresses" | "account" | "wishlist"
  >(currentTab);

  React.useEffect(() => {
    setActiveTab(currentTab);
  }, [currentTab]);

  const handleTabClick = (tabId: "dashboard" | "orders" | "addresses" | "account" | "wishlist") => {
    setActiveTab(tabId);
    const basePath = pathname.startsWith("/account") ? "/account" : "/my-account";
    if (tabId === "dashboard") {
      router.push(basePath);
    } else {
      router.push(`${basePath}/${tabId}`);
    }
  };

  // Notifications
  const [notification, setNotification] = useState<string | null>(null);

  // Edit Address Modal State
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);

  // Account Details Form State
  const [nameInput, setNameInput] = useState(customer?.name || "");
  const [phoneInput, setPhoneInput] = useState(customer?.phone || "");
  const [emailInput, setEmailInput] = useState(customer?.email || "");

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // If not logged in, show clean sign in prompt with quick store navigation
  if (!isLoggedIn || !customer) {
    return (
      <div className="bg-slate-50/60 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-[#008B47] flex items-center justify-center mx-auto shadow-xs">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Customer Account
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Please sign in to your customer account to view past orders, track live dispatches, and manage your delivery addresses.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => openAuthModal("LOGIN")}
              className="px-6 py-3 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold text-xs rounded-2xl shadow-md transition"
            >
              Sign In to Account
            </button>
            <button
              type="button"
              onClick={() => openAuthModal("REGISTER")}
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-xs rounded-2xl border border-slate-200 shadow-xs transition"
            >
              Create New Account
            </button>
          </div>

          <div className="pt-6 border-t border-slate-200/80 flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
            <Link href="/shop" className="hover:text-[#008B47] flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Explore Store</span>
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-[#008B47]">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Save Account Profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: nameInput,
      phone: phoneInput,
      email: emailInput,
    });
    showNotification("Account details updated successfully!");
  };

  // Save Shipping Address
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAddress) return;
    updateShippingAddress(editingAddress);
    setEditingAddress(null);
    showNotification("Shipping address updated!");
  };

  const navTabs: {
    id: "dashboard" | "orders" | "addresses" | "account" | "wishlist";
    label: string;
    icon: any;
    badge?: number;
  }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ShoppingBag, badge: orders.length },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "account", label: "Account Details", icon: User },
    { id: "wishlist", label: "Wishlist", icon: Heart, badge: wishlistItems.length },
  ];

  return (
    <div className="bg-slate-50/50 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Top Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center font-black text-2xl text-[#008B47] shrink-0">
              {customer.avatarUrl ? (
                <img src={customer.avatarUrl} alt={customer.name} className="w-full h-full object-cover" />
              ) : (
                customer.name.charAt(0)
              )}
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Customer Account Dashboard
              </div>
              <h1 className="text-xl sm:text-2xl font-black">{customer.name}</h1>
              <p className="text-xs text-slate-400">
                {customer.email} • {customer.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/shop"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-white/10"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Continue Shopping</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-[#008B47]" />
            <span>{notification}</span>
          </div>
        )}

        {/* Main Two-Column Account Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Left Sidebar Navigation */}
          <div className="lg:col-span-1 p-3 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full p-3 rounded-2xl font-extrabold text-xs flex items-center justify-between transition ${
                    isActive
                      ? "bg-[#008B47] text-white shadow-md"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="w-full p-3 rounded-2xl font-bold text-xs text-rose-600 hover:bg-rose-50 transition flex items-center gap-2.5 text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>

          {/* Right Content View */}
          <div className="lg:col-span-3">
            
            {/* TAB 1: DASHBOARD HOME */}
            {activeTab === "dashboard" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
                <div className="space-y-1">
                  <h2 className="text-base font-extrabold text-slate-900">
                    Hello, <strong>{customer.name}</strong> (not {customer.name}?{" "}
                    <button
                      type="button"
                      onClick={logout}
                      className="text-[#008B47] hover:underline font-bold"
                    >
                      Log out
                    </button>
                    )
                  </h2>
                  <p className="text-slate-500 leading-relaxed">
                    From your account dashboard you can view your{" "}
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-[#008B47] font-bold underline"
                    >
                      recent orders
                    </button>
                    , manage your{" "}
                    <button
                      onClick={() => setActiveTab("addresses")}
                      className="text-[#008B47] font-bold underline"
                    >
                      shipping and billing addresses
                    </button>
                    , and edit your{" "}
                    <button
                      onClick={() => setActiveTab("account")}
                      className="text-[#008B47] font-bold underline"
                    >
                      password and account details
                    </button>
                    .
                  </p>
                </div>

                {/* Quick Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div
                    onClick={() => setActiveTab("orders")}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#008B47] transition cursor-pointer space-y-1 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#008B47] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">Orders</span>
                    <div className="text-xl font-black text-slate-900">{orders.length} Placed</div>
                    <span className="text-[11px] text-[#008B47] font-bold flex items-center gap-0.5">
                      <span>View all orders</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveTab("addresses")}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#008B47] transition cursor-pointer space-y-1 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">Shipping City</span>
                    <div className="text-xl font-black text-slate-900">
                      {customer.shippingAddress?.district || "Dhaka"}
                    </div>
                    <span className="text-[11px] text-blue-600 font-bold flex items-center gap-0.5">
                      <span>Manage address</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>

                  <div
                    onClick={() => setActiveTab("wishlist")}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-[#008B47] transition cursor-pointer space-y-1 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">Saved Wishlist</span>
                    <div className="text-xl font-black text-slate-900">{wishlistItems.length} Products</div>
                    <span className="text-[11px] text-rose-600 font-bold flex items-center gap-0.5">
                      <span>View wishlist</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ORDERS */}
            {activeTab === "orders" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">My Orders History</h2>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Review order status, track live dispatches, and buy your favorite products again.
                    </p>
                  </div>
                  <span className="text-slate-400 font-bold bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                    {orders.length} orders
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-3">
                    <Package className="w-10 h-10 mx-auto opacity-40" />
                    <p className="font-bold text-slate-700">No orders found.</p>
                    <Link
                      href="/shop"
                      className="inline-block px-5 py-2.5 bg-[#008B47] text-white rounded-xl font-bold"
                    >
                      Browse Trending Products
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-3xl border border-slate-200/90 bg-white overflow-hidden shadow-xs transition hover:border-slate-300"
                      >
                        {/* Order Header */}
                        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                              <Package className="w-4 h-4 text-emerald-700" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-slate-900 text-sm">
                                  Order #{ord.id}
                                </span>
                              </div>
                              <span className="text-slate-400 block text-[11px] mt-0.5">
                                Placed on: <strong>{ord.date}</strong>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                ord.status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                  : ord.status === "SHIPPED"
                                  ? "bg-indigo-100 text-indigo-800 border border-indigo-300"
                                  : "bg-amber-100 text-amber-800 border border-amber-300"
                              }`}
                            >
                              {ord.status}
                            </span>
                            <span className="font-mono font-black text-slate-900 text-base">
                              {formatPrice(ord.total)}
                            </span>
                          </div>
                        </div>

                        {/* Order Items List / Table */}
                        <div className="p-4 sm:p-5 space-y-3">
                          <div className="divide-y divide-slate-100">
                            {ord.items && ord.items.map((it: any, i: number) => {
                              const { slug, image } = resolveProduct(it);
                              return (
                                <div
                                  key={i}
                                  className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                  {/* Left: Image & Product info */}
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                                      <img
                                        src={image}
                                        alt={it.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <Link
                                        href={slug ? `/product/${slug}` : "/shop"}
                                        target="_blank"
                                        className="font-extrabold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition flex items-center gap-1.5 line-clamp-1"
                                      >
                                        <span>{it.title}</span>
                                        <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                                      </Link>

                                      <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5 flex-wrap">
                                        {it.variantName && (
                                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-extrabold text-[10px]">
                                            {it.variantName}
                                          </span>
                                        )}
                                        <span className="font-semibold">
                                          Qty: <strong className="text-slate-800">{it.qty}</strong>
                                        </span>
                                        <span>•</span>
                                        <span className="font-mono">{formatPrice(it.price)} each</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right: Line Total & Buy Again Button */}
                                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                    <span className="font-mono font-black text-slate-900 text-xs sm:text-sm">
                                      {formatPrice(it.price * it.qty)}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() => handleBuyAgain(it)}
                                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-[#008B47] text-white font-extrabold text-xs transition shadow-2xs flex items-center gap-1.5"
                                      title="Add this product to cart again"
                                    >
                                      <ShoppingBag className="w-3.5 h-3.5" />
                                      <span>Buy Again</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Courier Tracking Banner (if available) */}
                        {ord.courierTracking && (
                          <div className="px-4 sm:px-5 py-2.5 bg-emerald-50/70 border-t border-emerald-100 flex items-center justify-between text-xs">
                            <span className="text-emerald-900 font-medium flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Live Courier Tracking: <strong>{ord.courierTracking}</strong></span>
                            </span>
                            <span className="font-black text-emerald-800 uppercase text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-md">
                              In Transit
                            </span>
                          </div>
                        )}

                        {/* Order Actions Footer */}
                        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[11px] text-slate-500">
                            Payment: <strong>{ord.paymentMethod || "Cash on Delivery"}</strong>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetails(ord)}
                              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-extrabold text-xs transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-600" />
                              <span>View Order Details</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleReorderAll(ord)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reorder All</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
                <div className="space-y-1">
                  <h2 className="text-base font-extrabold text-slate-900">Delivery Addresses</h2>
                  <p className="text-slate-500">
                    The following addresses will be used on the checkout page by default.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shipping Address */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        Shipping Address
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingAddress(
                            customer.shippingAddress || {
                              fullName: customer.name,
                              phone: customer.phone,
                              streetAddress: "Dhanmondi, Dhaka",
                              city: "Dhaka",
                              district: "Dhaka",
                            }
                          )
                        }
                        className="text-[#008B47] hover:underline font-bold flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="space-y-1 text-slate-600">
                      <div className="font-bold text-slate-900">
                        {customer.shippingAddress?.fullName || customer.name}
                      </div>
                      <div>{customer.shippingAddress?.streetAddress || "Not specified"}</div>
                      <div>
                        {customer.shippingAddress?.city}, {customer.shippingAddress?.district}
                      </div>
                      <div className="font-mono text-slate-400">
                        Phone: {customer.shippingAddress?.phone || customer.phone}
                      </div>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                        Billing Address
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingAddress(
                            customer.billingAddress || {
                              fullName: customer.name,
                              phone: customer.phone,
                              streetAddress: "Dhanmondi, Dhaka",
                              city: "Dhaka",
                              district: "Dhaka",
                            }
                          )
                        }
                        className="text-[#008B47] hover:underline font-bold flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>

                    <div className="space-y-1 text-slate-600">
                      <div className="font-bold text-slate-900">
                        {customer.billingAddress?.fullName || customer.name}
                      </div>
                      <div>{customer.billingAddress?.streetAddress || "Same as shipping"}</div>
                      <div>
                        {customer.billingAddress?.city || "Dhaka"},{" "}
                        {customer.billingAddress?.district || "Dhaka"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ACCOUNT DETAILS */}
            {activeTab === "account" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6 text-xs">
                <div className="space-y-1">
                  <h2 className="text-base font-extrabold text-slate-900">Account Details</h2>
                  <p className="text-slate-500">
                    Update your contact information and login password.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-[#008B47]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold rounded-xl transition shadow-sm flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 5: WISHLIST */}
            {activeTab === "wishlist" && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-extrabold text-slate-900">My Saved Wishlist</h2>
                  <span className="text-slate-400 font-bold">{wishlistItems.length} saved</span>
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-3">
                    <Heart className="w-10 h-10 mx-auto opacity-30 text-rose-500" />
                    <p className="font-bold text-slate-700">Your wishlist is currently empty.</p>
                    <Link
                      href="/shop"
                      className="inline-block px-5 py-2.5 bg-[#008B47] text-white rounded-xl font-bold"
                    >
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistItems.map((prod) => (
                      <div
                        key={prod.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-center gap-3"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                          <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover" />
                        </div>

                        <div className="flex-1 space-y-1">
                          <h4 className="font-bold text-slate-900 line-clamp-1">{prod.title}</h4>
                          <div className="font-black text-[#008B47]">{formatPrice(prod.price)}</div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                addToCart(prod);
                                showNotification(`Added "${prod.title}" to cart!`);
                              }}
                              className="px-3 py-1 bg-[#008B47] hover:bg-[#007a3e] text-white font-bold rounded-lg text-[10px]"
                            >
                              Add to Cart
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromWishlist(prod.id)}
                              className="text-slate-400 hover:text-rose-600 text-[10px]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* ============================================================== */}
        {/* EDIT ADDRESS MODAL                                             */}
        {/* ============================================================== */}
        {editingAddress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-black text-base text-slate-900">Edit Delivery Address</h3>
                <button
                  type="button"
                  onClick={() => setEditingAddress(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAddress} className="p-6 space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editingAddress.fullName}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, fullName: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={editingAddress.phone}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, phone: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Street / House / Area Address *</label>
                  <input
                    type="text"
                    required
                    value={editingAddress.streetAddress}
                    onChange={(e) =>
                      setEditingAddress({ ...editingAddress, streetAddress: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">City *</label>
                    <input
                      type="text"
                      required
                      value={editingAddress.city}
                      onChange={(e) =>
                        setEditingAddress({ ...editingAddress, city: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">District *</label>
                    <input
                      type="text"
                      required
                      value={editingAddress.district}
                      onChange={(e) =>
                        setEditingAddress({ ...editingAddress, district: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-[#008B47]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setEditingAddress(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#008B47] hover:bg-[#007a3e] text-white font-extrabold rounded-xl shadow-xs"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW ORDER DETAILS MODAL POPUP */}
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base sm:text-lg font-black tracking-tight">
                      Order #{selectedOrderDetails.id}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
                    <span>Placed: <strong>{selectedOrderDetails.date}</strong></span>
                    <span>•</span>
                    <span className="font-semibold text-white">
                      {selectedOrderDetails.items?.length || 0} product{selectedOrderDetails.items?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      selectedOrderDetails.status === "DELIVERED"
                        ? "bg-emerald-500 text-white"
                        : selectedOrderDetails.status === "SHIPPED"
                        ? "bg-indigo-500 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {selectedOrderDetails.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderDetails(null)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition ml-2"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
                {/* Order Status Stepper */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Order Lifecycle Status
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                    <div className="flex flex-col items-center space-y-1 text-emerald-700">
                      <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
                        ✓
                      </div>
                      <span>Confirmed</span>
                    </div>

                    <div
                      className={`flex flex-col items-center space-y-1 ${
                        ["PROCESSING", "SHIPPED", "DELIVERED"].includes(selectedOrderDetails.status)
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          ["PROCESSING", "SHIPPED", "DELIVERED"].includes(selectedOrderDetails.status)
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        2
                      </div>
                      <span>Processing</span>
                    </div>

                    <div
                      className={`flex flex-col items-center space-y-1 ${
                        ["SHIPPED", "DELIVERED"].includes(selectedOrderDetails.status)
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          ["SHIPPED", "DELIVERED"].includes(selectedOrderDetails.status)
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        3
                      </div>
                      <span>In Transit</span>
                    </div>

                    <div
                      className={`flex flex-col items-center space-y-1 ${
                        selectedOrderDetails.status === "DELIVERED"
                          ? "text-emerald-700"
                          : "text-slate-400"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                          selectedOrderDetails.status === "DELIVERED"
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        4
                      </div>
                      <span>Delivered</span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-3">
                  <div className="font-extrabold text-slate-900 text-sm flex items-center justify-between">
                    <span>Purchased Items</span>
                    <span className="text-slate-400 text-xs font-normal">
                      Click any item to view product page
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                    {selectedOrderDetails.items?.map((it: any, idx: number) => {
                      const { slug, image } = resolveProduct(it);
                      return (
                        <div
                          key={idx}
                          className="p-3.5 sm:p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative">
                              <img
                                src={image}
                                alt={it.title}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={slug ? `/product/${slug}` : "/shop"}
                                target="_blank"
                                className="font-extrabold text-xs sm:text-sm text-slate-900 hover:text-emerald-700 transition flex items-center gap-1.5 line-clamp-1"
                              >
                                <span>{it.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                              </Link>

                              <div className="flex items-center gap-2 text-slate-500 text-xs mt-0.5 flex-wrap">
                                {it.variantName && (
                                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                                    {it.variantName}
                                  </span>
                                )}
                                <span>Qty: <strong>{it.qty}</strong></span>
                                <span>•</span>
                                <span className="font-mono">{formatPrice(it.price)} each</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <span className="font-mono font-black text-slate-900 text-sm">
                              {formatPrice(it.price * it.qty)}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleBuyAgain(it)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#008B47] text-white font-extrabold text-[11px] transition flex items-center gap-1.5 shadow-2xs"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Buy Again</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery & Payment Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Shipping Destination</span>
                    </div>
                    <div className="text-slate-600 text-xs leading-relaxed">
                      {selectedOrderDetails.address || customer.shippingAddress?.streetAddress || "Dhaka, Bangladesh"}
                    </div>
                    {selectedOrderDetails.courierTracking && (
                      <div className="pt-2 text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Live Tracking: {selectedOrderDetails.courierTracking}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      <span>Payment &amp; Order Total</span>
                    </div>
                    <div className="text-slate-600 text-xs">
                      Method: <strong>{selectedOrderDetails.paymentMethod || "Cash on Delivery"}</strong>
                    </div>
                    <div className="font-black text-slate-900 text-sm pt-1">
                      Grand Total: {formatPrice(selectedOrderDetails.total)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-700 font-bold text-xs transition"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleReorderAll(selectedOrderDetails);
                    setSelectedOrderDetails(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#008B47] hover:bg-[#007a3e] text-white font-black text-xs transition shadow-md flex items-center gap-2"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Reorder Entire Order ({formatPrice(selectedOrderDetails.total)})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
