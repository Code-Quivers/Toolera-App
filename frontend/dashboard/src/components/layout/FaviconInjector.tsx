"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useHeaderStore } from "@/store/useHeaderStore";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";

const STATIC_ROUTE_TITLES: Record<string, string> = {
  "/": "Toolera — Discover What's Trending in BD",
  "/shop": "Shop All Products | Toolera",
  "/cart": "Shopping Cart | Toolera",
  "/checkout": "Secure Checkout | Toolera",
  "/order-success": "Order Confirmed | Toolera",
  "/track-order": "Track Your Order | Toolera",
  "/account": "My Account | Toolera",
  "/account/orders": "My Orders | Toolera",
  "/account/profile": "Account Profile | Toolera",
  "/account/address": "Saved Addresses | Toolera",
  "/account/wishlist": "My Wishlist | Toolera",
  "/my-account": "My Account | Toolera",
  "/my-account/orders": "My Orders | Toolera",
  "/my-account/profile": "Account Profile | Toolera",
  "/my-account/address": "Saved Addresses | Toolera",
  "/my-account/wishlist": "My Wishlist | Toolera",
  "/pages/shipping-policy": "Shipping Policy (1–3 Days) | Toolera",
  "/pages/returns": "7-Day Easy Return Policy | Toolera",
  "/pages/terms": "Terms of Service | Toolera",
  "/pages/privacy-policy": "Privacy Policy | Toolera",
  "/pages/contact": "Contact & Customer Support | Toolera",

  // Admin Routes
  "/admin": "Admin Dashboard | Toolera",
  "/admin/orders": "Orders Management | Toolera Admin",
  "/admin/products": "Products Catalog | Toolera Admin",
  "/admin/products/new": "Add New Product | Toolera Admin",
  "/admin/products/bulk": "Bulk Product Manager | Toolera Admin",
  "/admin/products/attributes": "Product Attributes & Variants | Toolera Admin",
  "/admin/categories": "Category Management | Toolera Admin",
  "/admin/customers": "Customers | Toolera Admin",
  "/admin/analytics": "Store Analytics | Toolera Admin",
  "/admin/inventory": "Inventory & Stock | Toolera Admin",
  "/admin/reviews": "Product Reviews | Toolera Admin",
  "/admin/abandoned": "Abandoned Cart Recovery | Toolera Admin",
  "/admin/media": "Media Library | Toolera Admin",
  "/admin/marketing/coupons": "Discount Coupons | Toolera Admin",
  "/admin/website/header": "Header Customizer | Toolera Admin",
  "/admin/website/footer": "Footer Menu Manager | Toolera Admin",
  "/admin/website/homepage": "Homepage Builder | Toolera Admin",
  "/admin/website/navigation": "Navigation Menus | Toolera Admin",
  "/admin/website/pages": "Custom Pages | Toolera Admin",
  "/admin/website/theme": "Theme & Color Customizer | Toolera Admin",
  "/admin/settings": "Settings Hub | Toolera Admin",
  "/admin/settings/all": "All Settings Hub | Toolera Admin",
  "/admin/settings/shipping": "Shipping Rates & Delivery | Toolera Admin",
  "/admin/settings/courier": "Steadfast & Pathao Courier API | Toolera Admin",
  "/admin/settings/payments": "Payment Gateways (COD, bKash, Nagad) | Toolera Admin",
  "/admin/settings/marketing": "Urgency & Bundle Discounts | Toolera Admin",
  "/admin/settings/sms": "SMS Notification Gateway | Toolera Admin",
  "/admin/settings/pixels": "Meta Pixel & GA4 Analytics | Toolera Admin",
  "/admin/settings/backup": "Database JSON Backup & Restore | Toolera Admin",
  "/admin/settings/security": "Admin Profile & Security | Toolera Admin",
  "/admin/seo": "SEO & Meta Tags | Toolera Admin",
  "/login": "Sign In | Toolera",
  "/signup": "Create Store Account | Toolera",
};

/**
 * Dynamically injects and updates the browser tab Favicon, Title, and
 * OpenGraph / Social Share tags in real-time on every route change.
 */
export function FaviconInjector() {
  const pathname = usePathname();
  const { settings } = useHeaderStore();
  const { products = [] } = useProductStore();
  const { categories = [] } = useCategoryStore();

  // 1. Dynamic Page Title & Meta Tag Synchronization
  useEffect(() => {
    if (typeof window === "undefined" || !pathname) return;

    let targetTitle = "";

    // Exact Static Route match
    if (STATIC_ROUTE_TITLES[pathname]) {
      targetTitle = STATIC_ROUTE_TITLES[pathname];
    }
    // Product Page: /product/[slug] or /p/[slug]
    else if (pathname.startsWith("/product/") || pathname.startsWith("/p/")) {
      const slug = pathname.replace(/^\/(product|p)\//, "").split("/")[0];
      const product = (products || []).find(
        (p) =>
          p?.slug?.toLowerCase() === slug?.toLowerCase() ||
          p?.id?.toLowerCase() === slug?.toLowerCase()
      );
      if (product) {
        targetTitle = product.metaTitle || `${product.title} | Toolera`;
      } else {
        const formattedSlug = decodeURIComponent(slug || "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        targetTitle = `${formattedSlug} | Toolera`;
      }
    }
    // Category Page: /category/[slug]
    else if (pathname.startsWith("/category/")) {
      const catSlug = pathname.replace("/category/", "").split("/")[0];
      const category = (categories || []).find(
        (c) =>
          c?.slug?.toLowerCase() === catSlug?.toLowerCase() ||
          c?.id?.toLowerCase() === catSlug?.toLowerCase()
      );
      if (category) {
        targetTitle = `${category.name} | Toolera`;
      } else {
        const formattedCat = decodeURIComponent(catSlug || "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        targetTitle = `${formattedCat} | Toolera`;
      }
    }
    // Custom CMS Page: /pages/[slug]
    else if (pathname.startsWith("/pages/")) {
      const pageSlug = pathname.replace("/pages/", "").split("/")[0];
      const formattedPage = decodeURIComponent(pageSlug || "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      targetTitle = `${formattedPage} | Toolera`;
    }
    // Admin Edit Product: /admin/products/edit/[id]
    else if (pathname.startsWith("/admin/products/edit/")) {
      targetTitle = "Edit Product | Toolera Admin";
    }
    // Generic Segment Fallback
    else {
      const lastSegment = pathname.split("/").filter(Boolean).pop();
      if (lastSegment) {
        const formatted = decodeURIComponent(lastSegment)
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        targetTitle = `${formatted} | Toolera`;
      } else {
        targetTitle = "Toolera — Discover What's Trending";
      }
    }

    if (targetTitle) {
      document.title = targetTitle;
    }
  }, [pathname, products, categories]);

  // 2. Favicon & Social Share Image Synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Update Browser Tab Favicon
    if (settings.faviconUrl) {
      let faviconLink = document.querySelector<HTMLLinkElement>("link[rel*='icon']");
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "shortcut icon";
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.faviconUrl;

      let appleIcon = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
      if (!appleIcon) {
        appleIcon = document.createElement("link");
        appleIcon.rel = "apple-touch-icon";
        document.head.appendChild(appleIcon);
      }
      appleIcon.href = settings.faviconUrl;
    }

    // Update Social Media OpenGraph & Twitter Image Meta Tags
    if (settings.ogImageUrl || settings.logoImageUrl) {
      const shareImg = settings.ogImageUrl || settings.logoImageUrl;

      let ogImgTag = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
      if (!ogImgTag) {
        ogImgTag = document.createElement("meta");
        ogImgTag.setAttribute("property", "og:image");
        document.head.appendChild(ogImgTag);
      }
      ogImgTag.content = shareImg;

      let twitterImgTag = document.querySelector<HTMLMetaElement>("meta[name='twitter:image']");
      if (!twitterImgTag) {
        twitterImgTag = document.createElement("meta");
        twitterImgTag.setAttribute("name", "twitter:image");
        document.head.appendChild(twitterImgTag);
      }
      twitterImgTag.content = shareImg;
    }

    // Update Social Share Title & Description if provided
    if (settings.ogTitle) {
      let ogTitleTag = document.querySelector<HTMLMetaElement>("meta[property='og:title']");
      if (ogTitleTag) ogTitleTag.content = settings.ogTitle;
    }

    if (settings.ogDescription) {
      let ogDescTag = document.querySelector<HTMLMetaElement>("meta[property='og:description']");
      if (ogDescTag) ogDescTag.content = settings.ogDescription;
    }
  }, [
    settings.faviconUrl,
    settings.ogImageUrl,
    settings.logoImageUrl,
    settings.ogTitle,
    settings.ogDescription,
  ]);

  return null;
}

