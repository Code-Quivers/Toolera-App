import React from "react";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { Footer } from "@/components/layout/Footer";
import { SearchModal } from "@/components/layout/SearchModal";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { PageTransition } from "@/components/layout/PageTransition";
import WhatsAppWidget from "@/components/common/WhatsAppWidget";
import PixelTracker from "@/components/analytics/PixelTracker";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans">
      <PixelTracker />
      <Header />

      {/* Public Storefront Main Content with Smooth Page Transitions */}
      <main className="flex-1 flex flex-col">
        <PageTransition>{children}</PageTransition>
      </main>

      <Footer />
      <MobileNavigation />

      {/* Floating Storefront Portals */}
      <SearchModal />
      <QuickViewModal />
      <CartDrawer />
      <WhatsAppWidget />
    </div>
  );
}
