"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, ArrowRight, Sparkles } from "lucide-react";

interface CountdownProps {
  settings?: {
    title: string;
    targetHours?: number;
    couponCode?: string;
    discountText?: string;
    linkUrl?: string;
  };
}

export function CountdownSection({ settings }: CountdownProps) {
  const title = settings?.title || "Midnight Flash Deals End Soon!";
  const couponCode = settings?.couponCode || "TRENDY40";
  const discountText = settings?.discountText || "Get 40% OFF with code";
  const linkUrl = settings?.linkUrl || "/shop?filter=trending";

  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-6 bg-slate-900 text-white border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LIMITED TIME ONLY</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {title}
            </h3>
            <p className="text-xs text-slate-300">
              Use code <strong className="text-teal-400 font-mono font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{couponCode}</strong> at checkout.
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 font-mono font-black text-lg sm:text-xl">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center min-w-[60px]">
              <div>{String(timeLeft.hours).padStart(2, "0")}</div>
              <div className="text-[9px] font-sans font-medium text-slate-500 uppercase">Hours</div>
            </div>
            <span className="text-slate-500">:</span>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center min-w-[60px]">
              <div>{String(timeLeft.minutes).padStart(2, "0")}</div>
              <div className="text-[9px] font-sans font-medium text-slate-500 uppercase">Mins</div>
            </div>
            <span className="text-slate-500">:</span>
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center min-w-[60px]">
              <div>{String(timeLeft.seconds).padStart(2, "0")}</div>
              <div className="text-[9px] font-sans font-medium text-slate-500 uppercase">Secs</div>
            </div>
          </div>

          {/* CTA */}
          <div>
            <Link
              href={linkUrl}
              className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition"
            >
              <span>Shop Flash Deals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
