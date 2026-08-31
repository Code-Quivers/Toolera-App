"use client";

import React, { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useSoftLoadingStore } from "@/store/useSoftLoadingStore";
import { Sparkles, Loader2 } from "lucide-react";

export function SoftLoadingBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isLoading, progress, message, startLoading, stopLoading } = useSoftLoadingStore();

  // Route transition detection
  useEffect(() => {
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  // Global click interception for navigation links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only handle internal navigation links
      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !href.startsWith("/#") &&
        !target.getAttribute("target")?.includes("_blank") &&
        !target.getAttribute("download");

      if (isInternal && href !== pathname) {
        startLoading("Loading page...");
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, [pathname, startLoading]);

  if (!isLoading && progress === 0) return null;

  return (
    <>
      {/* 1. Sleek Brand Gradient Top Bar with Glow */}
      <div className="fixed top-0 left-0 right-0 z-99999 pointer-events-none h-1 bg-transparent">
        <div
          className="h-full bg-linear-to-r from-[#008B47] via-[#10B981] to-[#F9A01B] transition-all duration-300 ease-out shadow-[0_0_12px_rgba(0,139,71,0.6)]"
          style={{
            width: `${progress}%`,
            opacity: progress === 100 ? 0 : 1,
          }}
        >
          {/* Shimmer pulse tip */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-linear-to-r from-transparent to-white/70 animate-pulse" />
        </div>
      </div>

      {/* 2. Floating Luxury Soft Action Toast / Badge */}
      {message && (
        <div className="fixed bottom-6 right-6 z-99999 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950/90 text-white border border-slate-800 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-bold">
            <Loader2 className="w-3.5 h-3.5 text-[#F9A01B] animate-spin shrink-0" />
            <span className="tracking-wide text-slate-100">{message}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-[#008B47] animate-ping" />
          </div>
        </div>
      )}
    </>
  );
}
