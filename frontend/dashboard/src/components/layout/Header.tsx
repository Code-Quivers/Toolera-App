"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  ShoppingBag,
  Heart,
  Menu as MenuIcon,
  X,
  Phone,
  Flame,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Compass,
  Globe,
  Truck,
  Headphones,
  Tag,
  Layers,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useMenuStore, DEFAULT_MENUS } from "@/store/useMenuStore";
import { useHeaderStore, defaultHeaderSettings } from "@/store/useHeaderStore";
import { useCustomerAuthStore } from "@/store/useCustomerAuthStore";
import { CategoryMegaMenu } from "@/components/layout/CategoryMegaMenu";

export function Header() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { openDrawer: openCartDrawer, getItemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { openSearch: openSearchModal } = useSearchStore();
  const { getMenuByLocation, getActiveMenu } = useMenuStore();
  const headerSettings = useHeaderStore((state) => state.settings);
  const activeNavbarLayout = mounted ? headerSettings.navbarLayout : defaultHeaderSettings.navbarLayout;
  const { customer, isLoggedIn, openAuthModal } = useCustomerAuthStore();

  const headerMenu = getMenuByLocation("header") || getActiveMenu();
  const menuItems = mounted ? (headerMenu?.items || []) : (DEFAULT_MENUS[0]?.items || []);

  const cartCount = mounted ? getItemCount() : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  const getMenuIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("trending") || l.includes("viral"))
      return <Flame className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
    if (l.includes("new") || l.includes("arrival"))
      return <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
    if (l.includes("shop") || l.includes("all"))
      return <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    return null;
  };

  // Top level menu items (without parentId)
  const rootMenuItems = menuItems.filter((it) => !it.parentId);

  // Render Brand Logo
  const renderLogo = () => {
    const logoImg = headerSettings.logoImageUrl || "/logo.png";
    const isImageMode = headerSettings.logoType === "IMAGE" || !headerSettings.logoText;

    return (
      <Link href="/" className="flex items-center gap-2 group shrink-0 min-h-[36px]">
        {isImageMode ? (
          <>
            {/* Mobile Logo */}
            <img
              src={logoImg}
              alt="Toolera"
              style={{
                maxHeight: `${headerSettings.mobileLogoHeight || 36}px`,
                maxWidth: `${headerSettings.mobileLogoWidth || 150}px`,
                width: "auto",
                height: "auto",
              }}
              className="object-contain block sm:hidden transition-transform group-hover:scale-[1.02]"
            />
            {/* Desktop Logo */}
            <img
              src={logoImg}
              alt="Toolera"
              style={{
                maxHeight: `${headerSettings.logoHeight || 48}px`,
                maxWidth: `${headerSettings.logoWidth || 220}px`,
                width: "auto",
                height: "auto",
              }}
              className="object-contain hidden sm:block transition-transform group-hover:scale-[1.02]"
            />
          </>
        ) : (
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {headerSettings.logoText}
          </span>
        )}
      </Link>
    );
  };

  // Render Horizontal Navigation Links with Submenu Dropdowns
  const renderNavLinks = (className = "flex items-center gap-5 text-xs font-semibold text-slate-700") => (
    <nav className={className} suppressHydrationWarning>
      {rootMenuItems.map((item) => {
        const subItems = menuItems.filter((sub) => sub.parentId === item.id);
        const hasSubmenu = subItems.length > 0;
        const isActive = pathname === item.url;
        const Icon = getMenuIcon(item.label);

        if (hasSubmenu) {
          return (
            <div
              key={item.id}
              className="relative group"
              onMouseEnter={() => setActiveDropdownId(item.id)}
              onMouseLeave={() => setActiveDropdownId(null)}
            >
              <Link
                href={item.url}
                target={item.targetBlank ? "_blank" : undefined}
                rel={item.targetBlank ? "noopener noreferrer" : undefined}
                suppressHydrationWarning
                className={`flex items-center gap-1.5 py-3 hover:text-emerald-700 transition ${
                  isActive ? "text-emerald-700 font-bold" : ""
                }`}
              >
                {Icon}
                <span suppressHydrationWarning>{item.label}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition transform duration-200" />
              </Link>

              {activeDropdownId === item.id && (
                <div
                  className={`absolute top-full left-0 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 z-50 animate-in fade-in zoom-in-98 slide-in-from-top-1 text-left ${
                    subItems.length > 4
                      ? "w-[460px] grid grid-cols-2 gap-2"
                      : "w-56 space-y-1"
                  }`}
                >
                  {subItems.map((sub) => (
                    <Link
                      key={sub.id}
                      href={sub.url}
                      target={sub.targetBlank ? "_blank" : undefined}
                      rel={sub.targetBlank ? "noopener noreferrer" : undefined}
                      suppressHydrationWarning
                      className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition font-medium text-xs truncate"
                    >
                      <span suppressHydrationWarning>{sub.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.url}
            target={item.targetBlank ? "_blank" : undefined}
            rel={item.targetBlank ? "noopener noreferrer" : undefined}
            suppressHydrationWarning
            className={`flex items-center gap-1.5 py-3 hover:text-emerald-700 transition ${
              isActive ? "text-emerald-700 font-bold" : ""
            }`}
          >
            {Icon}
            <span suppressHydrationWarning>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const renderAccountWidget = () => {
    if (mounted && isLoggedIn && customer) {
      return (
        <Link
          href="/account"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition shadow-2xs"
          title="Customer Account Dashboard"
        >
          <div className="w-5 h-5 rounded-full bg-[#008B47] text-white flex items-center justify-center text-[10px] font-black shrink-0">
            {customer.name.charAt(0)}
          </div>
          <span className="hidden sm:inline truncate max-w-[90px]">{customer.name.split(" ")[0]}</span>
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => openAuthModal("LOGIN")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition shadow-2xs"
        title="Sign In or Register"
      >
        <User className="w-3.5 h-3.5 text-[#008B47]" />
        <span className="hidden sm:inline">Sign In</span>
      </button>
    );
  };

  return (
    <>
      {/* 1. Top Announcement Bar */}
      {headerSettings.showTopBar && (
        <div
          style={{
            backgroundColor: headerSettings.topBarBgColor,
            color: headerSettings.topBarTextColor,
          }}
          className="text-xs font-semibold py-2 px-4 text-center transition tracking-wide"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 text-center sm:text-left truncate">
              <span>{headerSettings.topBarText}</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] font-bold shrink-0">
              <Link href="/track-order" className="hover:underline text-amber-300 font-extrabold flex items-center gap-1">
                <span>🚚 Track Order</span>
              </Link>
              <Link href="/pages/about-us" className="hover:underline opacity-90">
                About Us
              </Link>
              <Link href="/pages/contact" className="hover:underline opacity-90">
                Contact &amp; Hotline
              </Link>
              <Link href="/pages/delivery" className="hover:underline opacity-90">
                Delivery Info
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Header Shell */}
      <header
        suppressHydrationWarning
        className={`z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition shadow-2xs ${
          headerSettings.isSticky ? "sticky top-0" : "relative"
        }`}
      >
        {/* ============================================================== */}
        {/* TEMPLATE 1: WOODMART MARKETPLACE (Image 1 Style)               */}
        {/* ============================================================== */}
        {activeNavbarLayout === "WOODMART_MARKETPLACE" && (
          <>
            <div suppressHydrationWarning className="max-w-7xl mx-auto px-3 sm:px-6">
              <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-4">
                {/* Mobile Menu & Logo */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  {renderLogo()}
                </div>

                {/* Wide Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-xl mx-4">
                  <button
                    type="button"
                    onClick={openSearchModal}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-400 text-xs transition shadow-2xs group cursor-pointer"
                  >
                    <span className="font-normal">Search for products, smart gadgets...</span>
                    <span className="p-1.5 rounded-full bg-blue-600 group-hover:bg-blue-500 text-white shadow-xs">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                  </button>
                </div>

                {/* Right Widgets: 24/7 Hotline + Free Shipping + Cart */}
                <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
                  <div className="hidden lg:flex items-center gap-2.5 text-left">
                    <div className="p-2 rounded-xl bg-slate-50 text-slate-700 border border-slate-200">
                      <Headphones className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">24/7 Support</div>
                      <a
                        href={`tel:${headerSettings.hotlinePhone || "01712-345678"}`}
                        className="font-extrabold text-xs text-slate-900 hover:text-blue-600 transition font-mono"
                      >
                        {headerSettings.hotlinePhone || "01712-345678"}
                      </a>
                    </div>
                  </div>

                  <div className="hidden xl:flex items-center gap-2 text-left pl-3 border-l border-slate-200">
                    <Globe className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Nationwide</div>
                      <div className="font-bold text-xs text-emerald-700">Cash on Delivery</div>
                    </div>
                  </div>

                  {/* Customer Account Widget */}
                  {renderAccountWidget()}

                  {/* Cart Button */}
                  <button
                    onClick={openCartDrawer}
                    className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="hidden sm:inline">Cart</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white text-blue-900 font-black text-[10px]">
                      {cartCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile Search Bar Row */}
              <div className="md:hidden pb-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={openSearchModal}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-xs shadow-2xs"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Search products, smart gadgets...</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    Search
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Subnav with Hover Category Mega Menu */}
            <div className="hidden lg:block border-t border-slate-100 bg-slate-50/70 relative" suppressHydrationWarning>
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-11">
                  <div className="flex items-center gap-6">
                    {/* Mega Menu Trigger Wrapper */}
                    <div
                      className="relative"
                      onMouseEnter={() => setMegaMenuOpen(true)}
                      onMouseLeave={() => setMegaMenuOpen(false)}
                    >
                      <button
                        type="button"
                        className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-xs hover:bg-blue-500 transition"
                      >
                        <MenuIcon className="w-3.5 h-3.5" />
                        <span>All Categories</span>
                        <ChevronDown
                          className={`w-3 h-3 transition-transform duration-200 ${
                            megaMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Smooth Dropdown Mega Menu */}
                      <CategoryMegaMenu
                        isOpen={megaMenuOpen}
                        onClose={() => setMegaMenuOpen(false)}
                      />
                    </div>

                    {renderNavLinks()}
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/shop"
                      className="flex items-center gap-1 text-slate-600 hover:text-blue-600 text-xs font-bold"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>Wishlist ({wishlistCount})</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* TEMPLATE 2: GROCERY & DIRECT STORE (Image 2 Style)            */}
        {/* ============================================================== */}
        {activeNavbarLayout === "GROCERY_DIRECT" && (
          <>
            <div suppressHydrationWarning className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Left Logo */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  {renderLogo()}
                </div>

                {/* Green All Categories Pill with Hover Mega Menu (Desktop) */}
                <div
                  className="relative hidden lg:block"
                  onMouseEnter={() => setMegaMenuOpen(true)}
                  onMouseLeave={() => setMegaMenuOpen(false)}
                >
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                  >
                    <MenuIcon className="w-4 h-4" />
                    <span>All Categories</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        megaMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <CategoryMegaMenu
                    isOpen={megaMenuOpen}
                    onClose={() => setMegaMenuOpen(false)}
                  />
                </div>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-md mx-2">
                  <button
                    type="button"
                    onClick={openSearchModal}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-400 text-xs transition cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">Search for products, fresh arrivals...</span>
                  </button>
                </div>

                {/* Quick Promo Tags (Desktop) */}
                <div className="hidden xl:flex items-center gap-4 text-xs font-bold text-slate-700">
                  <Link href="/shop?filter=trending" className="flex items-center gap-1 hover:text-emerald-700">
                    <Flame className="w-3.5 h-3.5 text-rose-500" />
                    <span>Promotions</span>
                  </Link>
                  <Link href="/shop?filter=new-arrivals" className="flex items-center gap-1 hover:text-emerald-700">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    <span>Weekly Discounts</span>
                  </Link>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  {/* Customer Account Widget */}
                  {renderAccountWidget()}

                  {/* Floating Green Cart Icon */}
                  <button
                    onClick={openCartDrawer}
                    className="relative p-2 sm:p-2.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                    aria-label="Open Cart"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center px-0.5">
                      {cartCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile Search Bar Row */}
              <div className="md:hidden pt-2">
                <button
                  type="button"
                  onClick={openSearchModal}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-xs shadow-2xs"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Search products, grocery, gadgets...</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    Search
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Subnav */}
            <div className="hidden lg:block border-t border-slate-100 bg-slate-50/50" suppressHydrationWarning>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between">
                {renderNavLinks()}
                <div className="text-xs text-slate-500 font-bold">
                  Hotline: <span className="text-emerald-700">{headerSettings.hotlinePhone || "01712-345678"}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* TEMPLATE 3: MODERN SaaS TECH (Image 3 Style)                   */}
        {/* ============================================================== */}
        {activeNavbarLayout === "TECH_SaaS_CLEAN" && (
          <>
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {/* Logo */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  {renderLogo()}
                </div>

                {/* Integrated Category Pill Search Bar with Mega Menu (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-xl mx-2 relative">
                  <div className="w-full flex items-center rounded-full bg-slate-50 border border-slate-200 p-1">
                    <div
                      className="relative"
                      onMouseEnter={() => setMegaMenuOpen(true)}
                      onMouseLeave={() => setMegaMenuOpen(false)}
                    >
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-slate-800 transition shrink-0"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Categories</span>
                        <ChevronDown
                          className={`w-3 h-3 text-slate-400 transition-transform ${
                            megaMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <CategoryMegaMenu
                        isOpen={megaMenuOpen}
                        onClose={() => setMegaMenuOpen(false)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={openSearchModal}
                      className="flex-1 px-3 text-left text-xs text-slate-400 hover:text-slate-600 truncate cursor-pointer"
                    >
                      Search for products, gadgets, tech...
                    </button>

                    <button
                      type="button"
                      onClick={openSearchModal}
                      className="p-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Discounts Badge + Actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <Link
                    href="/shop?filter=trending"
                    className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full border border-indigo-600 text-indigo-700 font-bold text-xs hover:bg-indigo-50 transition"
                  >
                    Discounts
                  </Link>

                  {/* Customer Account Widget */}
                  {renderAccountWidget()}

                  <button
                    onClick={openCartDrawer}
                    className="p-2 sm:p-2.5 rounded-full bg-slate-900 text-white relative hover:bg-slate-800 transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center">
                      {cartCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile Search Bar Row */}
              <div className="md:hidden pt-2">
                <button
                  type="button"
                  onClick={openSearchModal}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-xs shadow-2xs"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Search products, tech, gadgets...</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                    Search
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Subnav */}
            <div className="hidden lg:block border-t border-slate-100 bg-slate-50/50" suppressHydrationWarning>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between">
                {renderNavLinks()}
                <div className="text-xs text-slate-500 font-bold">
                  Fast Support: <span className="text-indigo-700">{headerSettings.hotlinePhone || "01712-345678"}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* TEMPLATE 4: CLASSIC SPLIT (2-Tier Standard)                    */}
        {/* ============================================================== */}
        {activeNavbarLayout === "CLASSIC_SPLIT" && (
          <>
            <div className="max-w-7xl mx-auto px-3 sm:px-6">
              <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  {renderLogo()}
                </div>

                <div className="hidden md:flex flex-1 max-w-lg mx-4">
                  <button
                    type="button"
                    onClick={openSearchModal}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-slate-400 text-xs transition cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-slate-400" />
                    <span>Search trending products, gadgets...</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <Link
                    href="/shop"
                    className="hidden sm:flex items-center gap-1.5 p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition"
                  >
                    <Heart className="w-5 h-5 text-rose-500" />
                  </Link>

                  {/* Customer Account Widget */}
                  {renderAccountWidget()}

                  <button
                    onClick={openCartDrawer}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Cart</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                      {cartCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile Search Bar Row */}
              <div className="md:hidden pb-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={openSearchModal}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-xs shadow-2xs"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Search products, lifestyle finds...</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                    Search
                  </span>
                </button>
              </div>
            </div>

            <div className="hidden lg:block border-t border-slate-100 bg-white relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className="relative"
                    onMouseEnter={() => setMegaMenuOpen(true)}
                    onMouseLeave={() => setMegaMenuOpen(false)}
                  >
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Browse Categories</span>
                      <ChevronDown
                        className={`w-3 h-3 text-slate-400 transition-transform ${
                          megaMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <CategoryMegaMenu
                      isOpen={megaMenuOpen}
                      onClose={() => setMegaMenuOpen(false)}
                    />
                  </div>

                  {renderNavLinks()}
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call: {headerSettings.hotlinePhone || "01712-345678"}</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* TEMPLATE 5 TO 10: INLINE, CENTERED, MEGA SEARCH, ETC.          */}
        {/* ============================================================== */}
        {![
          "WOODMART_MARKETPLACE",
          "GROCERY_DIRECT",
          "TECH_SaaS_CLEAN",
          "CLASSIC_SPLIT",
        ].includes(activeNavbarLayout) && (
          <>
            <div className="max-w-7xl mx-auto px-3 sm:px-6">
              <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <MenuIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  {renderLogo()}
                </div>

                {/* Inline Nav Links */}
                <div className="hidden lg:block">{renderNavLinks()}</div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <button
                    onClick={openSearchModal}
                    className="hidden sm:flex p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Search className="w-5 h-5" />
                  </button>

                  {/* Customer Account Widget */}
                  {renderAccountWidget()}

                  <button
                    onClick={openCartDrawer}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span className="hidden sm:inline">Cart</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
                      {cartCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* Mobile Search Bar Row */}
              <div className="md:hidden pb-2.5 pt-0.5">
                <button
                  type="button"
                  onClick={openSearchModal}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-slate-400 text-xs shadow-2xs"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Search for products, smart finds...</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#008B47] text-white text-[10px] font-bold">
                    Search
                  </span>
                </button>
              </div>
            </div>

            {/* Bottom Subnav with Mega Menu for Other Layouts */}
            <div className="hidden lg:block border-t border-slate-100 bg-slate-50/60 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between text-xs text-slate-600 font-bold">
                <div className="flex items-center gap-4">
                  <div
                    className="relative"
                    onMouseEnter={() => setMegaMenuOpen(true)}
                    onMouseLeave={() => setMegaMenuOpen(false)}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-800 hover:text-emerald-700"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-600" />
                      <span>All Categories</span>
                      <ChevronDown
                        className={`w-3 h-3 text-slate-400 transition-transform ${
                          megaMenuOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <CategoryMegaMenu
                      isOpen={megaMenuOpen}
                      onClose={() => setMegaMenuOpen(false)}
                    />
                  </div>

                  <Link href="/shop?filter=trending" className="flex items-center gap-1 text-rose-600">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Trending Deals</span>
                  </Link>
                  <Link href="/shop?filter=new-arrivals" className="flex items-center gap-1 text-amber-600">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>New Arrivals</span>
                  </Link>
                </div>
                <div className="text-slate-500">
                  Hotline: <strong className="text-slate-900">{headerSettings.hotlinePhone || "01712-345678"}</strong>
                </div>
              </div>
            </div>
          </>
        )}
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                {renderLogo()}
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Customer Account Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                {mounted && isLoggedIn && customer ? (
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#008B47] text-white flex items-center justify-center font-black text-sm">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 line-clamp-1">{customer.name}</div>
                        <div className="text-[11px] text-[#008B47] font-bold">My Account Dashboard</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-slate-900">Welcome Customer</div>
                      <div className="text-[11px] text-slate-500">Sign in to track orders</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal("LOGIN");
                      }}
                      className="px-3.5 py-1.5 bg-[#008B47] hover:bg-[#007a3e] text-white text-xs font-bold rounded-xl shadow-xs"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Navigation Links */}
              <nav className="space-y-1 text-sm font-bold text-slate-800">
                {rootMenuItems.map((item) => {
                  const subItems = menuItems.filter((sub) => sub.parentId === item.id);
                  return (
                    <div key={item.id} className="space-y-1">
                      <Link
                        href={item.url}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition"
                      >
                        <span>{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </Link>
                      {subItems.length > 0 && (
                        <div className="pl-6 space-y-1 border-l-2 border-slate-100 ml-3">
                          {subItems.map((sub) => (
                            <Link
                              key={sub.id}
                              href={sub.url}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block py-2 px-3 text-xs text-slate-600 hover:text-emerald-700"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer Contact */}
            <div className="pt-6 border-t border-slate-100 space-y-2 text-xs">
              <div className="text-slate-400 font-bold uppercase text-[10px]">Need Help?</div>
              <a
                href={`tel:${headerSettings.hotlinePhone || "01712-345678"}`}
                className="flex items-center gap-2 font-bold text-slate-900 hover:text-emerald-700"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>{headerSettings.hotlinePhone || "01712-345678"}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
