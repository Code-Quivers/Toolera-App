import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { FaviconInjector } from "@/components/layout/FaviconInjector";
import { ThemeInjector } from "@/components/layout/ThemeInjector";
import { SoftLoadingBar } from "@/components/layout/SoftLoadingBar";
import { NavigationProgress } from "@/components/layout/NavigationProgress";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Toolera Dashboard",
    template: "%s | Toolera Dashboard",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-white text-slate-900 antialiased font-sans">
        <Suspense fallback={null}>
          <NavigationProgress />
          <SoftLoadingBar />
        </Suspense>
        <FaviconInjector />
        <ThemeInjector />
        {children}
      </body>
    </html>
  );
}
