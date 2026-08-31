"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Sliders,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Warehouse,
  Image as ImageIcon,
  Tag,
  Search,
  Settings,
  ArrowUpRight,
  Menu as MenuIcon,
  X,
  FileText,
  Palette,
  Navigation as NavigationIcon,
  Bell,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Truck,
  PhoneCall,
  BarChart3,
  Send,
  CreditCard,
  MessageSquare,
  Database,
  Shield,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Store,
  Zap,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useAdminCounts } from "@/hooks/useAdminCounts";
import { useStore } from "@/hooks/useStore";
import { PageTransition } from "@/components/layout/PageTransition";
import { AdminNotificationDropdown } from "@/components/admin/AdminNotificationDropdown";
import { LogOut, User, Lock, AlertTriangle } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user: adminUser, authenticated, loading: authLoading, logout, checkSession } = useAdminAuth();
  const { store: activeStore, isPaymentPending } = useStore();
  const counts = useAdminCounts();

  const [authChecked, setAuthChecked] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (pathname === "/login" || pathname === "/signup") {
      setAuthChecked(true);
      return;
    }
    const isValid = checkSession();
    if (!isValid) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else {
      setAuthChecked(true);
    }
  }, [pathname, checkSession, router, authLoading]);

  useEffect(() => {
    if (isPaymentPending && pathname !== "/admin" && pathname !== "/admin/billing") {
      router.replace("/admin/billing");
    }
  }, [isPaymentPending, pathname, router]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [profileDropdownOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [seenOrdersCount, setSeenOrdersCount] = useState(0);
  const [seenCustomersCount, setSeenCustomersCount] = useState(0);

  useEffect(() => {
    const storedOrders = parseInt(localStorage.getItem("admin_seen_orders_count") || "0", 10);
    const storedCusts = parseInt(localStorage.getItem("admin_seen_customers_count") || "0", 10);
    setSeenOrdersCount(storedOrders);
    setSeenCustomersCount(storedCusts);
  }, []);

  useEffect(() => {
    if (pathname === "/admin/orders") {
      setSeenOrdersCount(counts.orders);
      localStorage.setItem("admin_seen_orders_count", String(counts.orders));
    }
  }, [pathname, counts.orders]);

  useEffect(() => {
    if (pathname === "/admin/customers") {
      setSeenCustomersCount(counts.customers);
      localStorage.setItem("admin_seen_customers_count", String(counts.customers));
    }
  }, [pathname, counts.customers]);

  const newOrdersCount = Math.max(0, counts.orders - seenOrdersCount);
  const newCustomersCount = Math.max(0, counts.customers - seenCustomersCount);

  const navGroups = [
    {
      label: "STORE",
      items: [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/analytics", label: "Analytics & Reports", icon: BarChart3 },
      ],
    },
    {
      label: "STORE MANAGEMENT",
      items: [
        { href: "/admin/settings/store", label: "Store Settings", icon: Store, badge: isPaymentPending ? "Setup" : "Active" },
        { href: "/admin/billing", label: "Subscription & Billing", icon: Zap, badge: isPaymentPending ? "PAY NOW" : "PRO" },
      ],
    },
    {
      label: "WEBSITE",
      items: [
        { href: "/admin/website/homepage", label: "Homepage", icon: Sliders },
        { href: "/admin/website/pages", label: "Pages", icon: FileText },
        { href: "/admin/website/navigation", label: "Menu", icon: NavigationIcon },
        { href: "/admin/website/header", label: "Header", icon: Bell },
        { href: "/admin/website/footer", label: "Footer", icon: Globe },
        { href: "/admin/website/theme", label: "Theme Customizer", icon: Palette },
      ],
    },
    {
      label: "CATALOG",
      items: [
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/categories", label: "Categories", icon: Layers },
        { href: "/admin/products/attributes", label: "Attributes", icon: Sliders },
        { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
      ],
    },
    {
      label: "SALES",
      items: [
        {
          href: "/admin/orders",
          label: "Orders",
          icon: ShoppingBag,
          badge: newOrdersCount > 0 ? String(newOrdersCount) : undefined,
        },
        {
          href: "/admin/customers",
          label: "Customers",
          icon: Users,
          badge: newCustomersCount > 0 ? String(newCustomersCount) : undefined,
        },
        { href: "/admin/abandoned", label: "Abandoned Leads", icon: PhoneCall },
      ],
    },
    {
      label: "FINANCE",
      items: [
        { href: "/admin/expenses", label: "Expenses (খরচ)", icon: Wallet },
        { href: "/admin/reports/profit-loss", label: "Profit & Loss (লাভ-ক্ষতি)", icon: TrendingUp },
      ],
    },
    {
      label: "SETTINGS",
      items: [
        { href: "/admin/settings/shipping", label: "Shipping Rates", icon: Truck },
        { href: "/admin/settings/courier", label: "Courier Integration", icon: Send },
        { href: "/admin/settings/payments", label: "Payment Gateways", icon: CreditCard },
        { href: "/admin/settings/invoice", label: "Invoice Templates", icon: FileText },
        { href: "/admin/marketing/coupons", label: "Coupons & Discounts", icon: Tag },
        { href: "/admin/settings/security", label: "Admin Security", icon: ShieldCheck },
        { href: "/admin/settings/account", label: "Account & Password", icon: User },
        { href: "/admin/settings/sms", label: "SMS Gateway", icon: MessageSquare },
        { href: "/admin/settings/pixels", label: "Ad Pixels & GA4", icon: BarChart3 },
        { href: "/admin/settings/backup", label: "Database Backup", icon: Database },
      ],
    },
  ];

  const commandItems = [
    { title: "Store Management (Multi-Store & Custom Domains)", category: "SaaS", href: "/admin/stores" },
    { title: "Subscription & Billing Plans", category: "SaaS", href: "/admin/subscription" },
    { title: "Homepage Builder", category: "CMS", href: "/admin/website/homepage" },
    { title: "Add New Product", category: "Store", href: "/admin/products/new" },
    { title: "Products Catalog", category: "Store", href: "/admin/products" },
    { title: "Orders & Dispatch", category: "Store", href: "/admin/orders" },
    { title: "Theme Customizer", category: "CMS", href: "/admin/website/theme" },
    { title: "Media Library", category: "Media", href: "/admin/media" },
    { title: "Coupons & Discounts", category: "Marketing", href: "/admin/marketing/coupons" },
    { title: "Shipping Settings", category: "Settings", href: "/admin/settings" },
    { title: "View Storefront", category: "Storefront", href: "/" },
  ];

  const filteredCommands = commandItems.filter(
    c =>
      c.title.toLowerCase().includes(commandQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(commandQuery.toLowerCase())
  );

  if (pathname === "/admin/login") return <>{children}</>;

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center shadow-lg animate-pulse">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Verifying Admin Access...</h3>
            <p className="text-xs text-slate-400">Ensuring authorized administrative credentials.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex antialiased font-sans">
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen bg-white border-r border-slate-200/80 flex flex-col justify-between z-40 transition-all duration-300 shadow-xs ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div>
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3">
              <img
                src="/assets/favicon.png"
                alt="RM"
                className="w-8 h-8 rounded-xl object-contain shadow-xs shrink-0"
              />
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <span className="font-extrabold text-slate-900 text-sm block leading-tight truncate">
                    {activeStore?.name || "Raifa's Mart"}
                  </span>
                  {isPaymentPending ? (
                    <span className="text-[10px] text-amber-600 font-black tracking-wider uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Payment Required</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 font-bold tracking-wider uppercase flex items-center gap-1">
                      ● Store Active
                    </span>
                  )}
                </div>
              )}
            </Link>
          </div>

          <div className="px-3 py-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] text-xs">
            {navGroups
              .filter(group => {
                if (isPaymentPending) {
                  return group.label === "STORE" || group.label === "STORE MANAGEMENT";
                }
                if (adminUser?.role === "Editor") {
                  return group.label !== "ACCOUNTING & FINANCE" && group.label !== "SETTINGS";
                }
                return true;
              })
              .map(group => (
                <div key={group.label} className="space-y-1">
                  {!sidebarCollapsed && (
                    <div className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      {group.label}
                    </div>
                  )}
                  {group.items.map(item => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl font-medium transition ${
                          isActive
                            ? "bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600 shadow-xs"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-700" : "text-slate-400"}`} />
                          {!sidebarCollapsed && <span>{item.label}</span>}
                        </div>
                        {!sidebarCollapsed && item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}

            {isPaymentPending && !sidebarCollapsed && (
              <div className="p-3.5 mx-2 my-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 animate-in fade-in">
                <div className="flex items-center gap-1.5 font-black text-xs text-amber-800">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Navigation Locked</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-tight">
                  Website, Catalog, Orders, Finance &amp; Settings are hidden until your store subscription is activated.
                </p>
                <Link
                  href="/admin/billing"
                  className="block w-full py-1.5 px-3 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold text-center transition shadow-xs cursor-pointer"
                >
                  Pay &amp; Unlock All Tabs →
                </Link>
              </div>
            )}
          </div>
        </div>

        {!sidebarCollapsed && (
          <div className="px-4 py-2 border-t border-slate-100 space-y-1 text-xs">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between p-1.5 rounded-lg text-slate-500 hover:text-[#008B47] hover:bg-emerald-50/50 transition font-medium"
            >
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                <span>Storefront</span>
              </span>
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              href="/admin/settings/account"
              className="flex items-center justify-between p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition font-medium"
            >
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Account &amp; Security</span>
              </span>
            </Link>
          </div>
        )}

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!sidebarCollapsed && <span>Collapse Menu</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                readOnly
                onClick={() => setCommandPaletteOpen(true)}
                placeholder="Search anything..."
                className="w-full pl-10 pr-12 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 cursor-pointer transition"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400 shadow-2xs">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <AdminNotificationDropdown />
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-xs font-bold transition shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>View Store</span>
            </Link>

            <div className="relative pl-2 border-l border-slate-200" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-bold text-slate-900 text-xs leading-none">
                    {adminUser?.name || "Administrator"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                    {adminUser?.role || "Super Admin"}
                  </div>
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-2 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                    <div className="font-black text-slate-900 text-xs">{adminUser?.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{adminUser?.email}</div>
                    <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {adminUser?.role || "Super Admin"}
                    </span>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 text-slate-700 font-bold transition"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Store Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                      router.replace("/login");
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-rose-50 text-rose-600 font-bold transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {isPaymentPending && (
          <div className="bg-amber-500 text-white px-4 sm:px-8 py-2.5 text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs sticky top-16 z-20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-bounce" />
              <span>
                Subscription payment pending. Activate your plan to unlock all store navigation and accept online orders!
              </span>
            </div>
            <Link
              href="/admin/billing"
              className="px-3.5 py-1 bg-white text-slate-900 rounded-xl text-xs font-black hover:bg-slate-100 transition shrink-0 shadow-xs cursor-pointer"
            >
              Pay &amp; Activate Now →
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-8 lg:p-10 w-full overflow-x-hidden flex flex-col">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>

      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-4 h-4 text-emerald-600 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Type a command or page..."
                value={commandQuery}
                onChange={e => setCommandQuery(e.target.value)}
                className="w-full bg-transparent text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="text-[11px] text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded bg-slate-100"
              >
                ESC
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 text-xs">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      router.push(cmd.href);
                    }}
                    className="w-full p-2.5 rounded-xl hover:bg-slate-50 text-left flex items-center justify-between text-slate-700 hover:text-slate-900 transition"
                  >
                    <span className="font-semibold">{cmd.title}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase">
                      {cmd.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">No matching admin actions found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
