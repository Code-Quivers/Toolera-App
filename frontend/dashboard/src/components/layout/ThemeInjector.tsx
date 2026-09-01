"use client";

import React, { useEffect } from "react";
import { useCmsStore } from "@/lib/cms/useCmsStore";

// Google Font name map (CSS value → GF family name for URL)
const GF_MAP: Record<string, string> = {
  "Inter, sans-serif": "Inter",
  "'Plus Jakarta Sans', sans-serif": "Plus+Jakarta+Sans",
  "'Poppins', sans-serif": "Poppins",
  "'DM Sans', sans-serif": "DM+Sans",
  "'Outfit', sans-serif": "Outfit",
  "'Nunito', sans-serif": "Nunito",
  "'Montserrat', sans-serif": "Montserrat",
  "'Raleway', sans-serif": "Raleway",
  "'Urbanist', sans-serif": "Urbanist",
  "'Space Grotesk', sans-serif": "Space+Grotesk",
  "'Sora', sans-serif": "Sora",
  "'Figtree', sans-serif": "Figtree",
  "'Josefin Sans', sans-serif": "Josefin+Sans",
  "'Lato', sans-serif": "Lato",
  "'Open Sans', sans-serif": "Open+Sans",
  "'Roboto', sans-serif": "Roboto",
  "'Hind Siliguri', sans-serif": "Hind+Siliguri",
  "'Noto Sans Bengali', sans-serif": "Noto+Sans+Bengali",
  "'Baloo Da 2', sans-serif": "Baloo+Da+2",
  "'Tiro Bangla', serif": "Tiro+Bangla",
  "'Anek Bangla', sans-serif": "Anek+Bangla",
};

/**
 * Dynamically applies Theme Customizer settings (Primary Green, Accent Amber/Gold,
 * Button Text Color, Border Radius Token, Font Family) to the entire website in real time.
 */
export function ThemeInjector() {
  const { theme } = useCmsStore();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Google Font if needed
    const gfName = GF_MAP[theme.bodyFont];
    if (gfName) {
      const linkId = `gf-${gfName}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${gfName}:wght@400;500;600;700;800;900&display=swap`;
        document.head.appendChild(link);
      }
    }

    const root = document.documentElement;

    const primaryColor = theme.primary || "#008B47";
    const accentColor = theme.accent || "#F9A01B";
    const primaryBtnText = theme.primaryButtonText || "#FFFFFF";
    const accentBtnText = theme.accentButtonText || "#0F172A";
    const borderRadius = theme.radius || "1rem";
    const fontFamily = theme.bodyFont || "Inter, sans-serif";

    // Set CSS custom properties on :root
    root.style.setProperty("--theme-primary", primaryColor);
    root.style.setProperty("--theme-accent", accentColor);
    root.style.setProperty("--theme-primary-btn-text", primaryBtnText);
    root.style.setProperty("--theme-accent-btn-text", accentBtnText);
    root.style.setProperty("--theme-radius", borderRadius);
    root.style.setProperty("--theme-font", fontFamily);

    // Inject dynamic CSS style overrides for brand consistency
    let styleTag = document.getElementById("dynamic-theme-overrides") as HTMLStyleElement;
    if (!styleTag) {
      styleTag = document.createElement("style");
      styleTag.id = "dynamic-theme-overrides";
      document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
      :root {
        --theme-primary: ${primaryColor};
        --theme-accent: ${accentColor};
        --theme-primary-btn-text: ${primaryBtnText};
        --theme-accent-btn-text: ${accentBtnText};
        --theme-radius: ${borderRadius};
        --theme-font: ${fontFamily};
      }

      body {
        font-family: ${fontFamily} !important;
      }

      /* Dynamic Theme Primary Brand Color Overrides */
      .bg-emerald-600,
      .bg-teal-500,
      .bg-emerald-500,
      .bg-emerald-700 {
        background-color: ${primaryColor} !important;
        color: ${primaryBtnText} !important;
      }

      .bg-emerald-600 *,
      .bg-teal-500 *,
      .bg-emerald-500 *,
      .bg-emerald-700 * {
        color: ${primaryBtnText} !important;
      }

      .text-emerald-600,
      .text-emerald-700,
      .text-emerald-800,
      .text-teal-600,
      .text-teal-700 {
        color: ${primaryColor} !important;
      }

      .border-emerald-500,
      .border-emerald-600,
      .border-teal-500 {
        border-color: ${primaryColor} !important;
      }

      /* Dynamic Theme Secondary Accent (Golden Amber from Logo) Overrides */
      .bg-amber-500,
      .bg-amber-400,
      .bg-amber-600,
      .bg-yellow-500 {
        background-color: ${accentColor} !important;
        color: ${accentBtnText} !important;
      }

      .text-amber-500,
      .text-amber-600,
      .text-amber-700,
      .text-yellow-500,
      .text-yellow-600 {
        color: ${accentColor} !important;
      }

      .border-amber-400,
      .border-amber-500,
      .border-amber-600 {
        border-color: ${accentColor} !important;
      }

      /* Hover states */
      .hover\\:bg-emerald-500:hover,
      .hover\\:bg-emerald-600:hover,
      .hover\\:bg-teal-400:hover,
      .hover\\:bg-teal-700:hover {
        background-color: ${primaryColor} !important;
        color: ${primaryBtnText} !important;
        filter: brightness(0.92);
      }

      .hover\\:text-emerald-700:hover,
      .hover\\:text-teal-700:hover,
      .hover\\:text-teal-900:hover {
        color: ${primaryColor} !important;
      }

      /* Dynamic Theme Radius Overrides */
      .rounded-2xl,
      .rounded-3xl {
        border-radius: ${borderRadius} !important;
      }
    `;
  }, [theme.primary, theme.accent, theme.primaryButtonText, theme.accentButtonText, theme.radius, theme.bodyFont]);

  return null;
}
