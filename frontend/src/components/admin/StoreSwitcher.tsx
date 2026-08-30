"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Store,
  ChevronDown,
  PlusCircle,
  Check,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Settings,
} from "lucide-react";
import { useTenantStore } from "@/store/useTenantStore";
import { useSubscriptionStore } from "@/store/useSubscriptionStore";

export function StoreSwitcher() {
  const { stores, activeStore, isPaymentPending: tenantPending, setActiveStore, setCreateModalOpen, fetchStores } = useTenantStore();
  const { currentPlan, fetchCurrentSubscription } = useSubscriptionStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isPaymentPending =
    tenantPending ||
    !activeStore?.subscription ||
    activeStore.subscription.status === "PENDING" ||
    activeStore.subscription.status === "UNPAID" ||
    activeStore.subscription.status === "TRIALING" ||
    activeStore.subscription.status !== "ACTIVE";

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (activeStore) {
      fetchCurrentSubscription(activeStore.id);
    }
  }, [activeStore, fetchCurrentSubscription]);

  // Handle outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutside);
    }
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  const currentStoreName = activeStore?.name || "Raifa's Mart";
  const planBadge = currentPlan?.name || "PRO";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 text-slate-800 transition shadow-2xs group"
      >
        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs shrink-0">
          <Store className="w-3.5 h-3.5" />
        </div>

        <div className="text-left hidden sm:block max-w-[130px] md:max-w-[160px]">
          <div className="text-xs font-black text-slate-900 leading-tight truncate">
            {currentStoreName}
          </div>
          {isPaymentPending ? (
            <div className="text-[10px] font-bold text-amber-700 leading-none truncate flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Payment Required</span>
            </div>
          ) : (
            <div className="text-[10px] font-bold text-emerald-700 leading-none truncate flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{planBadge}</span>
            </div>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-2 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              Your Managed Stores ({stores.length})
            </span>
            <Link
              href="/admin/stores"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <span>Manage</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Store List */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {stores.map((store) => {
              const isSelected = activeStore?.id === store.id || activeStore?.slug === store.slug;
              const storePlan = store.subscription?.plan?.name || "Active Store";

              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => {
                    setActiveStore(store);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition ${
                    isSelected
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200/80 font-bold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {store.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 truncate">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {store.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {store.slug}.toolera.app
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-700">
                      {storePlan}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* SaaS Actions */}
          <div className="pt-2 border-t border-slate-100 space-y-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setCreateModalOpen(true);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-xl text-emerald-800 hover:bg-emerald-50 font-bold transition text-xs"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Create New Store</span>
            </button>

            <Link
              href="/admin/subscription"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-between p-2 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold transition text-xs"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>Subscription & Plan</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-100 text-amber-800 uppercase">
                Upgrade
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default StoreSwitcher;
