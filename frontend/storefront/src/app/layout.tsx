import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { FaviconInjector } from "@/components/layout/FaviconInjector";
import { ThemeInjector } from "@/components/layout/ThemeInjector";
import { SoftLoadingBar } from "@/components/layout/SoftLoadingBar";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { CustomerAuthModal } from "@/components/auth/CustomerAuthModal";
import { GlobalDataSyncProvider } from "@/components/providers/GlobalDataSyncProvider";
import { fetchStoreInfo } from "@/lib/api/ssr";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const cms = await fetchStoreInfo();
  const seo = cms?.seo;
  const storeName = seo?.defaultTitle || process.env.NEXT_PUBLIC_SITE_NAME || "My Store";
  const storeDesc = seo?.defaultDescription || "Discover our products.";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: {
      default: storeName,
      template: `%s | ${storeName}`,
    },
    description: storeDesc,
    metadataBase: new URL(siteUrl),
    icons: { icon: "/logo.png", shortcut: "/logo.png", apple: "/logo.png" },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      title: storeName,
      description: storeDesc,
      siteName: storeName,
    },
    twitter: {
      card: "summary_large_image",
      title: storeName,
      description: storeDesc,
    },
    robots: { index: true, follow: true },
  };
}

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
