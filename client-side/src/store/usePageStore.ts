import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: "STANDARD" | "POLICY" | "BUILDER";
  status: "PUBLISHED" | "DRAFT";
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

interface PageStoreState {
  pages: CustomPage[];
  addPage: (page: Omit<CustomPage, "id" | "createdAt" | "updatedAt">) => void;
  updatePage: (id: string, updated: Partial<CustomPage>) => void;
  deletePage: (id: string) => void;
  getPageBySlug: (slug: string) => CustomPage | undefined;
}

export const usePageStore = create<PageStoreState>()(
  persist(
    (set, get) => ({
      pages: [
        {
          id: "page-1",
          title: "About Raifa's Mart",
          slug: "about",
          content:
            "Raifa's Mart is a curated DTC brand delivering the latest China trending products, smart home gadgets, and aesthetic lifestyle goods to Bangladesh.",
          type: "STANDARD",
          status: "PUBLISHED",
          seoTitle: "About Us | Raifa's Mart Bangladesh",
          seoDescription: "Learn how Raifa's Mart sources and delivers curated viral China finds to Dhaka and nationwide.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "page-2",
          title: "Delivery & Shipping Policy",
          slug: "shipping-policy",
          content:
            "We deliver inside Dhaka within 1-2 business days (৳70) and across all 64 districts in Bangladesh within 2-4 business days (৳130). Cash on delivery is supported nationwide.",
          type: "POLICY",
          status: "PUBLISHED",
          seoTitle: "Shipping & Delivery Policy | Raifa's Mart",
          seoDescription: "Inside and Outside Dhaka delivery charges, courier timelines, and cash on delivery information.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "page-3",
          title: "7-Day Return & Refund Guarantee",
          slug: "returns",
          content:
            "If your product arrives damaged or malfunctioning, we provide an instant 7-day hassle-free replacement or full refund.",
          type: "POLICY",
          status: "PUBLISHED",
          seoTitle: "Return & Refund Policy | Raifa's Mart",
          seoDescription: "7-day return and replacement policy details for Bangladesh orders.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "page-4",
          title: "Contact Us & Hotline",
          slug: "contact",
          content:
            "Reach our customer support hotline at 01712-345678 (10:00 AM – 10:00 PM) or via WhatsApp.",
          type: "STANDARD",
          status: "PUBLISHED",
          seoTitle: "Contact Us | Raifa's Mart",
          seoDescription: "Customer service hotline, WhatsApp support, and Dhaka office contact.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "page-5",
          title: "Privacy Policy",
          slug: "privacy-policy",
          content: "We respect your privacy and protect your contact and delivery address information.",
          type: "POLICY",
          status: "PUBLISHED",
          seoTitle: "Privacy Policy | Raifa's Mart",
          seoDescription: "Customer data protection and privacy policy.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "page-6",
          title: "Terms & Conditions",
          slug: "terms",
          content: "Terms of service for ordering China curated products on Raifa's Mart.",
          type: "POLICY",
          status: "PUBLISHED",
          seoTitle: "Terms & Conditions | Raifa's Mart",
          seoDescription: "Store terms of service.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],

      addPage: (newPageData) => {
        const newPage: CustomPage = {
          ...newPageData,
          id: `page-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set({ pages: [newPage, ...get().pages] });
      },

      updatePage: (id, updated) => {
        set({
          pages: get().pages.map((p) =>
            p.id === id ? { ...p, ...updated, updatedAt: new Date().toISOString() } : p
          ),
        });
      },

      deletePage: (id) => {
        set({ pages: get().pages.filter((p) => p.id !== id) });
      },

      getPageBySlug: (slug) => {
        return get().pages.find((p) => p.slug === slug);
      },
    }),
    {
      name: "raifas_mart_pages_store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
