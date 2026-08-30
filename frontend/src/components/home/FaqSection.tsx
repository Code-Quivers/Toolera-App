"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqProps {
  settings?: {
    title: string;
    items: Array<{ question: string; answer: string }>;
  };
}

export function FaqSection({ settings }: FaqProps) {
  const title = settings?.title || "Frequently Asked Questions";
  const items = settings?.items || [
    { question: "How long does delivery take?", answer: "1–2 days inside Dhaka Metro, and 2–4 days across the rest of Bangladesh." },
    { question: "Is Cash on Delivery available?", answer: "Yes! Cash on Delivery is available in all 64 districts." },
    { question: "What is your return policy?", answer: "We offer a 7-day hassle-free return policy if an item arrives damaged or malfunctioning." },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-12 sm:py-16 bg-slate-50/60 border-b border-slate-200/60">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-teal-600 text-xs font-bold uppercase tracking-wider mb-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                    openIndex === idx ? "rotate-180 text-teal-600" : ""
                  }`}
                />
              </button>
              {openIndex === idx && (
                <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
