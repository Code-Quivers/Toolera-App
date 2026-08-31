"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Truck, ShieldCheck } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { useShippingSettingsStore } from "@/store/useShippingSettingsStore";

export function AnnouncementBar() {
  const { settings: shippingSettings } = useShippingSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const threshold = mounted ? (shippingSettings?.freeShippingThreshold ?? 2000) : 2000;
  const isFreeShippingEnabled = mounted ? (shippingSettings?.isFreeShippingEnabled ?? false) : false;

  return (
    <div className="bg-slate-950 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-4 text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-teal-400" />
            Fast Delivery across Bangladesh
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            100% Quality Checked
          </span>
        </div>

        <div className="w-full md:w-auto text-center font-medium text-slate-200 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            {isFreeShippingEnabled ? (
              <>
                Free Delivery on orders over <strong className="text-white font-bold">{formatPrice(threshold)}</strong>
              </>
            ) : (
              <>Fast Express Doorstep Delivery Across Bangladesh</>
            )}
          </span>
          <span className="hidden sm:inline text-slate-500">•</span>
          <span className="hidden sm:inline text-teal-300 font-normal">Cash on Delivery Available</span>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-slate-400 text-xs">
          <span>Hotline: 01712-345678</span>
        </div>
      </div>
    </div>
  );
}
