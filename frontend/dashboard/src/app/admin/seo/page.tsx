"use client";

import React, { useState } from "react";
import { Search, Globe, CheckCircle2 } from "lucide-react";

export default function AdminSeoPage() {
  const [metaTitle, setMetaTitle] = useState("Toolera — Curated China Finds for Bangladesh");
  const [metaDescription, setMetaDescription] = useState(
    "Discover trendy, smart, useful, and unique China products curated for modern Bangladesh lifestyles. 100% genuine quality, Cash on Delivery, and express shipping."
  );
  const [canonicalUrl, setCanonicalUrl] = useState("https://toolera.store");
  const [notification, setNotification] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification("Global SEO & OpenGraph settings updated!");
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Global Search Engine Optimization (SEO)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage meta tags, OpenGraph social cards, and Google search index snippet previews.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Google Snippet Search Preview */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
          Live Google Search Result Snippet Preview
        </h3>
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-sans space-y-1">
          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono truncate">
            <span>https://toolera.store</span>
            <span>› bangladesh › china-gadgets</span>
          </div>
          <div className="text-base text-blue-700 hover:underline font-medium cursor-pointer">
            {metaTitle}
          </div>
          <p className="text-xs text-slate-600 line-clamp-2">{metaDescription}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5 text-xs">
        <div className="space-y-1.5">
          <div className="flex justify-between font-bold text-slate-700">
            <label>Global Meta Title</label>
            <span className="text-[11px] text-slate-400 font-normal">{metaTitle.length}/60</span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between font-bold text-slate-700">
            <label>Global Meta Description</label>
            <span className="text-[11px] text-slate-400 font-normal">{metaDescription.length}/160</span>
          </div>
          <textarea
            rows={3}
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none leading-relaxed"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-slate-700">Canonical Website URL</label>
          <input
            type="url"
            value={canonicalUrl}
            onChange={(e) => setCanonicalUrl(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-xs transition"
          >
            Save Global SEO Settings
          </button>
        </div>
      </form>
    </div>
  );
}
