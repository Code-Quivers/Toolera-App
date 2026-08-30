"use client";

import React, { useState } from "react";
import { Mail, CheckCircle2, ArrowRight } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    setSubscribed(true);
  };

  return (
    <section className="py-12 sm:py-16 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white border border-slate-800 text-center relative overflow-hidden shadow-xl">
          {/* Subtle Ambient light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-teal-400 text-xs font-semibold border border-slate-700">
              <Mail className="w-3.5 h-3.5" />
              <span>Stay in the Loop</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Get the Good Stuff First.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Be the first to discover new trending finds, viral gadgets, and flash deals before they sell out.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-2xl bg-teal-900/60 border border-teal-500/40 text-teal-200 text-sm font-medium flex items-center justify-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                <span>You&apos;re in! We&apos;ll only send high-quality new product drops.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  className="flex-1 px-4 py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-teal-500 transition"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition shrink-0"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="text-[11px] text-slate-500 pt-2">
              Zero spam. Unsubscribe anytime with 1-click.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
