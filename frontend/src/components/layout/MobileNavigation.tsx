"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Search, Heart, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useCustomerAuthStore } from "@/store/useCustomerAuthStore";
import { cn } from "@/lib/utils";

export function MobileNavigation() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const { openDrawer, getItemCount } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { openSearch } = useSearchStore();
  const { customer, isLoggedIn, openAuthModal } = useCustomerAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? getItemCount() : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  const isHomeActive = pathname === "/";
  const isShopActive = pathname.startsWith("/shop") || pathname.startsWith("/category");
  const isWishlistActive = pathname.includes("wishlist");
  const isAccountActive = pathname.startsWith("/account") || pathname.startsWith("/my-account");

  // Get customer initials (e.g. "MD", "RA", etc.)
  const customerInitials = customer?.name
    ? customer.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "MD";

  return (
    <div className="lg:hidden fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-md mx-auto z-40 pointer-events-none">
      <nav className="pointer-events-auto bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-2xl px-1.5 py-1.5 transition-all">
        <div className="flex items-center justify-between gap-1">
          {/* 1. Home */}
          <Link
            href="/"
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 text-[11px]",
              isHomeActive
                ? "bg-emerald-50/90 text-[#008B47] font-bold shadow-2xs"
                : "text-slate-600 hover:text-[#008B47] hover:bg-slate-50 font-medium"
            )}
          >
            <Home className={cn("w-5 h-5 mb-0.5 transition-transform", isHomeActive ? "scale-105 stroke-[2.5]" : "stroke-[1.75]")} />
            <span>Home</span>
          </Link>

          {/* 2. Shop */}
          <Link
            href="/shop"
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 text-[11px]",
              isShopActive
                ? "bg-emerald-50/90 text-[#008B47] font-bold shadow-2xs"
                : "text-slate-600 hover:text-[#008B47] hover:bg-slate-50 font-medium"
            )}
          >
            <ShoppingBag className={cn("w-5 h-5 mb-0.5 transition-transform", isShopActive ? "scale-105 stroke-[2.5]" : "stroke-[1.75]")} />
            <span>Shop</span>
          </Link>

          {/* 3. Search */}
          <button
            type="button"
            onClick={openSearch}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-slate-600 hover:text-[#008B47] hover:bg-slate-50 transition-all duration-200 text-[11px] font-medium cursor-pointer"
          >
            <Search className="w-5 h-5 mb-0.5 stroke-[1.75]" />
            <span>Search</span>
          </button>

          {/* 4. Wishlist */}
          <Link
            href="/shop?view=wishlist"
            className={cn(
              "flex-1 relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 text-[11px]",
              isWishlistActive
                ? "bg-emerald-50/90 text-[#008B47] font-bold shadow-2xs"
                : "text-slate-600 hover:text-[#008B47] hover:bg-slate-50 font-medium"
            )}
          >
            <div className="relative">
              <Heart className={cn("w-5 h-5 mb-0.5 transition-transform", isWishlistActive ? "scale-105 stroke-[2.5]" : "stroke-[1.75]")} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center px-0.5 shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span>Wishlist</span>
          </Link>

          {/* 5. Cart */}
          <button
            type="button"
            onClick={openDrawer}
            className="flex-1 relative flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-slate-600 hover:text-[#008B47] hover:bg-slate-50 transition-all duration-200 text-[11px] font-medium cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 mb-0.5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2.5 min-w-[17px] h-[17px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>

          {/* 6. Account */}
          {mounted && isLoggedIn && customer ? (
            <Link
              href="/account"
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 text-[11px]",
                isAccountActive
                  ? "bg-emerald-50/90 text-[#008B47] font-bold shadow-2xs"
                  : "text-slate-600 hover:text-[#008B47] hover:bg-slate-50 font-medium"
              )}
            >
              <div className="w-5 h-5 rounded-full bg-[#008B47] text-white flex items-center justify-center text-[9px] font-black mb-0.5 shadow-2xs">
                {customerInitials}
              </div>
              <span className="truncate max-w-[48px]">Account</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("LOGIN")}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl text-slate-600 hover:text-[#008B47] hover:bg-slate-50 transition-all duration-200 text-[11px] font-medium cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-rose-500/90 text-white flex items-center justify-center text-[9px] font-black mb-0.5 shadow-2xs">
                MD
              </div>
              <span>Account</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
