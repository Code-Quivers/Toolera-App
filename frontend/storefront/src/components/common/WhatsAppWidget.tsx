"use client";

import React, { useState, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("01712345678");
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    // Fetch store contact number if configured in CMS or settings
    api.getCmsConfig().then((res) => {
      if (res.success && res.data?.footer?.phone) {
        setPhoneNumber(res.data.footer.phone);
      }
    });
  }, []);

  if (!mounted) return null;

  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  const formattedNumber = cleanNumber.startsWith("88") ? cleanNumber : `88${cleanNumber}`;

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const defaultText = userMessage.trim() || "Hi Toolera, I am interested in your products and have a question.";
    const url = `https://wa.me/${formattedNumber}?text=${encodeURIComponent(defaultText)}`;
    window.open(url, "_blank");
    setIsOpen(false);
    setUserMessage("");
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
      {/* Expanded WhatsApp Chat Bubble Card */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="bg-[#075E54] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center font-black text-lg shadow-inner">
                  RM
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-white absolute bottom-0 right-0" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">Toolera Helpline</h3>
                <span className="text-[11px] text-emerald-200 font-medium">Online • Typically replies in 2 mins</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Preview Body */}
          <div className="p-4 bg-slate-50 space-y-3 text-xs">
            <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-xs border border-slate-100 text-slate-800 space-y-1">
              <p className="font-medium leading-relaxed">
                👋 Assalamu Alaikum! Welcome to <strong>Toolera</strong>.
              </p>
              <p className="text-slate-500 text-[11px]">
                How can we help you today? Ask about product details, stock, or fast delivery across Bangladesh.
              </p>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-2 pt-1">
              <input
                type="text"
                placeholder="Type your message here..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 focus:border-[#25D366]"
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-extrabold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Chat on WhatsApp</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Circular WhatsApp Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center relative group"
        aria-label="Chat on WhatsApp"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-7 h-7" />
            {/* Pulse Indicator */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
            </span>
          </>
        )}
      </button>
    </div>
  );
}
