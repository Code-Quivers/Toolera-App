"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState([
    { id: "wishlist", name: "Customer Wishlist", desc: "Allow shoppers to save favorite products", enabled: true },
    { id: "quick-view", name: "Quick View Modal", desc: "Preview product details without leaving catalog", enabled: true },
    { id: "cod", name: "Cash on Delivery", desc: "Enable COD payment option at checkout across Bangladesh", enabled: true },
    { id: "bkash", name: "bKash / Nagad Instant Pay", desc: "Enable digital mobile wallet payment gateway", enabled: true },
    { id: "whatsapp", name: "Floating WhatsApp Order Button", desc: "Allow direct 1-click orders via WhatsApp", enabled: true },
    { id: "reviews", name: "Customer Reviews & Ratings", desc: "Display star reviews and customer testimonials", enabled: true },
    { id: "newsletter", name: "Email Newsletter & Promo Popup", desc: "Collect subscriber emails for promotions", enabled: true },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const toggleFeature = (id: string) => {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
    setNotification("Feature toggle saved!");
    setTimeout(() => setNotification(null), 2000);
  };

  return (
    <div className="space-y-6 w-full pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Store Feature Flags
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Instantly turn on or off storefront features without touching source code.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      <div className="space-y-3">
        {features.map((feat) => (
          <div
            key={feat.id}
            className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-4"
          >
            <div>
              <div className="font-bold text-slate-900 text-sm">{feat.name}</div>
              <p className="text-xs text-slate-500 mt-0.5">{feat.desc}</p>
            </div>

            <button
              onClick={() => toggleFeature(feat.id)}
              className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                feat.enabled ? "bg-emerald-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  feat.enabled ? "right-1" : "left-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
