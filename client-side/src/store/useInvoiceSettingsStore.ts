"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface InvoiceSettings {
  templateId: "EMERALD" | "CLASSIC" | "MODERN_MINIMAL";
  accentColor: string;
  
  // Brand / Header Details
  logoDisplayMode: "LOGO_AND_TEXT" | "LOGO_ONLY" | "TEXT_ONLY";
  companyLogo: string;
  logoHeight: number;
  showLogo: boolean;
  companyName: string;
  companyTagline: string;
  companyAddress: string;
  companyHotline: string;
  companyEmail: string;

  // Verified Badge
  verifiedSellerBadge: boolean;
  verifiedSellerText: string;
  verifiedSellerSubText: string;

  // Signatory & Greetings
  thankYouHeading: string;
  thankYouMessage: string;
  signatoryName: string;
  signatoryRole: string;
  showSignature: boolean;

  // Footer & Trust
  footerHelpText: string;
  footerFollowText: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  trustBadge1: string;
  trustBadge2: string;
  footerNote: string;
  invoiceTerms: string;
}

interface InvoiceSettingsStore extends InvoiceSettings {
  updateSettings: (partial: Partial<InvoiceSettings>) => void;
  resetDefaults: () => void;
}

export const DEFAULT_INVOICE_SETTINGS: InvoiceSettings = {
  templateId: "EMERALD",
  accentColor: "#005A2B",
  logoDisplayMode: "LOGO_AND_TEXT",
  companyLogo: "/assets/favicon.png",
  logoHeight: 48,
  showLogo: true,
  companyName: "RAIFA'S MART",
  companyTagline: "Trendy Finds, Better Prices",
  companyAddress: "House 12, Road 5, Dhanmondi, Dhaka, Bangladesh",
  companyHotline: "01712-345678",
  companyEmail: "support@raifasmart.com",

  verifiedSellerBadge: true,
  verifiedSellerText: "Verified Seller",
  verifiedSellerSubText: "100% Verified Phone",

  thankYouHeading: "Thank you for choosing Raifa's Mart!",
  thankYouMessage: "We appreciate your trust in us. We'll deliver your order with care.",
  signatoryName: "Raifa.",
  signatoryRole: "Authorized Signatory",
  showSignature: true,

  footerHelpText: "NEED HELP?",
  footerFollowText: "FOLLOW US",
  facebookUrl: "https://facebook.com",
  instagramUrl: "https://instagram.com",
  tiktokUrl: "https://tiktok.com",
  trustBadge1: "100% Original Products",
  trustBadge2: "Fast & Safe Delivery",
  footerNote: "© 2025 Raifa's Mart. All rights reserved.",
  invoiceTerms: "Exchange possible within 7 days with original invoice & unopened packaging.",
};

export const useInvoiceSettingsStore = create<InvoiceSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_INVOICE_SETTINGS,

      updateSettings: (partial) =>
        set((state) => ({
          ...state,
          ...partial,
        })),

      resetDefaults: () => set({ ...DEFAULT_INVOICE_SETTINGS }),
    }),
    {
      name: "raifas_mart_invoice_settings_v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
