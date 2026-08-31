import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { Suspense } from "react";
import { FaviconInjector } from "@/components/layout/FaviconInjector";
import { ThemeInjector } from "@/components/layout/ThemeInjector";
import { SoftLoadingBar } from "@/components/layout/SoftLoadingBar";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { CustomerAuthModal } from "@/components/auth/CustomerAuthModal";
import { GlobalDataSyncProvider } from "@/components/providers/GlobalDataSyncProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Toolera — Discover What's Trending",
    template: "%s | Toolera",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  description: siteConfig.description,
  keywords: [
    "china trendy products",
    "smart gadgets bangladesh",
    "desk setup accessories",
    "viral products dhaka",
    "unique lifestyle items",
    "cash on delivery bangladesh",
  ],
  authors: [{ name: "Toolera" }],
  creator: "Toolera",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: "Toolera — Curated China Finds for Bangladesh",
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-slate-900 antialiased font-sans" suppressHydrationWarning>
        <GlobalDataSyncProvider>
          <Suspense fallback={null}>
            <NavigationProgress />
            <SoftLoadingBar />
          </Suspense>
          <FaviconInjector />
          <ThemeInjector />
          <CustomerAuthModal />
          {children}
        </GlobalDataSyncProvider>
      </body>
    </html>
  );
}
