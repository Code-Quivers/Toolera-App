"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useHeaderStore } from "@/store/useHeaderStore";
import { useProductStore } from "@/store/useProductStore";
import { useCategoryStore } from "@/store/useCategoryStore";

const STATIC_ROUTE_TITLES: Record<string, string> = {
  "/": "Raifa's Mart — Discover What's Trending in BD",
  "/shop": "Shop All Products | Raifa's Mart",
  "/cart": "Shopping Cart | Raifa's Mart",
  "/checkout": "Secure Checkout | Raifa's Mart",
  "/order-success": "Order Confirmed | Raifa's Mart",
  "/track-order": "Track Your Order | Raifa's Mart",
  "/account": "My Account | Raifa's Mart",
  "/account/orders": "My Orders | Raifa's Mart",
  "/account/profile": "Account Profile | Raifa's Mart",
  "/account/address": "Saved Addresses | Raifa's Mart",
  "/account/wishlist": "My Wishlist | Raifa's Mart",
  "/my-account": "My Account | Raifa's Mart",
  "/my-account/orders": "My Orders | Raifa's Mart",
  "/my-account/profile": "Account Profile | Raifa's Mart",
  "/my-account/address": "Saved Addresses | Raifa's Mart",
  "/my-account/wishlist": "My Wishlist | Raifa's Mart",
  "/pages/shipping-policy": "Shipping Policy (1–3 Days) | Raifa's Mart",
  "/pages/returns": "7-Day Easy Return Policy | Raifa's Mart",
  "/pages/terms": "Terms of Service | Raifa's Mart",
  "/pages/privacy-policy": "Privacy Policy | Raifa's Mart",
  "/pages/contact": "Contact & Customer Support | Raifa's Mart",

  // Admin Routes
  "/admin": "Admin Dashboard | Raifa's Mart",
  "/admin/orders": "Orders Management | Raifa's Mart Admin",
  "/admin/products": "Products Catalog | Raifa's Mart Admin",
  "/admin/products/new": "Add New Product | Raifa's Mart Admin",
  "/admin/products/bulk": "Bulk Product Manager | Raifa's Mart Admin",
  "/admin/products/attributes": "Product Attributes & Variants | Raifa's Mart Admin",
  "/admin/categories": "Category Management | Raifa's Mart Admin",
  "/admin/customers": "Customers | Raifa's Mart Admin",
  "/admin/analytics": "Store Analytics | Raifa's Mart Admin",
  "/admin/inventory": "Inventory & Stock | Raifa's Mart Admin",
  "/admin/reviews": "Product Reviews | Raifa's Mart Admin",
  "/admin/abandoned": "Abandoned Cart Recovery | Raifa's Mart Admin",
  "/admin/media": "Media Library | Raifa's Mart Admin",
  "/admin/marketing/coupons": "Discount Coupons | Raifa's Mart Admin",
  "/admin/website/header": "Header Customizer | Raifa's Mart Admin",
  "/admin/website/footer": "Footer Menu Manager | Raifa's Mart Admin",
  "/admin/website/homepage": "Homepage Builder | Raifa's Mart Admin",
  "/admin/website/navigation": "Navigation Menus | Raifa's Mart Admin",
  "/admin/website/pages": "Custom Pages | Raifa's Mart Admin",
  "/admin/website/theme": "Theme & Color Customizer | Raifa's Mart Admin",
  "/admin/settings": "Settings Hub | Raifa's Mart Admin",
  "/admin/settings/all": "All Settings Hub | Raifa's Mart Admin",
  "/admin/settings/shipping": "Shipping Rates & Delivery | Raifa's Mart Admin",
  "/admin/settings/courier": "Steadfast & Pathao Courier API | Raifa's Mart Admin",
  "/admin/settings/payments": "Payment Gateways (COD, bKash, Nagad) | Raifa's Mart Admin",
  "/admin/settings/marketing": "Urgency & Bundle Discounts | Raifa's Mart Admin",
  "/admin/settings/sms": "SMS Notification Gateway | Raifa's Mart Admin",
  "/admin/settings/pixels": "Meta Pixel & GA4 Analytics | Raifa's Mart Admin",
  "/admin/settings/backup": "Database JSON Backup & Restore | Raifa's Mart Admin",
  "/admin/settings/security": "Admin Profile & Security | Raifa's Mart Admin",
  "/admin/seo": "SEO & Meta Tags | Raifa's Mart Admin",
  "/login": "Sign In | Raifa's Mart",
  "/signup": "Create Store Account | Raifa's Mart",
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
        targetTitle = product.metaTitle || `${product.title} | Raifa's Mart`;
      } else {
        const formattedSlug = decodeURIComponent(slug || "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        targetTitle = `${formattedSlug} | Raifa's Mart`;
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
        targetTitle = `${category.name} | Raifa's Mart`;
      } else {
        const formattedCat = decodeURIComponent(catSlug || "")
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        targetTitle = `${formattedCat} | Raifa's Mart`;
      }
    }
    // Custom CMS Page: /pages/[slug]
    else if (pathname.startsWith("/pages/")) {
      const pageSlug = pathname.replace("/pages/", "").split("/")[0];
      const formattedPage = decodeURIComponent(pageSlug || "")
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      targetTitle = `${formattedPage} | Raifa's Mart`;
    }
    // Admin Edit Product: /admin/products/edit/[id]
    else if (pathname.startsWith("/admin/products/edit/")) {
      targetTitle = "Edit Product | Raifa's Mart Admin";
    }
    // Generic Segment Fallback
    else {
      const lastSegment = pathname.split("/").filter(Boolean).pop();
      if (lastSegment) {
        const formatted = decodeURIComponent(lastSegment)
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        targetTitle = `${formatted} | Raifa's Mart`;
      } else {
        targetTitle = "Raifa's Mart — Discover What's Trending";
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

