"use client";

import React from "react";
import Link from "next/link";
import { useFooterStore } from "@/store/useFooterStore";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Banknote,
  Award,
  PackageCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

const FOOTER_ICON_MAP: Record<string, React.ElementType> = {
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Sparkles,
  Banknote,
  Award,
  PackageCheck,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  MapPin,
};

export function Footer() {
  const { settings } = useFooterStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!settings) return null;

  const assuranceList =
    settings.assurancePillars && settings.assurancePillars.length > 0
      ? settings.assurancePillars
      : [
          { title: "Fast Delivery", subtitle: "All across Bangladesh", iconName: "Truck" },
          { title: "Quality Checked", subtitle: "100% inspected items", iconName: "ShieldCheck" },
          { title: "7-Day Easy Return", subtitle: "Hassle-free guarantee", iconName: "RotateCcw" },
          { title: "24/7 Live Support", subtitle: `Call ${settings.phone || "hotline"}`, iconName: "Headphones" },
        ];

  return (
    <footer className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800 pb-20 lg:pb-0">
      {/* Top Value Assurance Banner */}
      {settings.showTopAssuranceBanner !== false && (
        <div className="border-b border-slate-900 bg-slate-900/60 py-8 px-4 sm:px-6">
          <div
            className={`max-w-7xl mx-auto grid grid-cols-2 gap-6 text-slate-300 ${
              assuranceList.length === 3
                ? "md:grid-cols-3"
                : assuranceList.length === 5
                ? "md:grid-cols-5"
                : "md:grid-cols-4"
            }`}
          >
            {assuranceList.map((pillar, i) => {
              const Icon = (pillar.iconName && FOOTER_ICON_MAP[pillar.iconName]) || ShieldCheck;
              return (
                <div key={i} className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{pillar.title}</div>
                    <div className="text-xs text-slate-400">{pillar.subtitle}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Footer Links & Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-10 ${
            settings.columnsCount === 3
              ? "lg:grid-cols-3"
              : settings.columnsCount === 5
              ? "lg:grid-cols-5"
              : "lg:grid-cols-4"
          }`}
        >
          {/* Column 1: Brand Info & Logo Customization */}
          <div className="space-y-4">
            <Link href="/" className="inline-block min-h-[32px]">
              {settings.brandLogoType === "IMAGE" || !settings.brandTitle ? (
                <>
                  {/* Mobile Footer Logo */}
                  <img
                    src={settings.brandLogoUrl || "/assets/RaifasMart Logo Footer.png"}
                    alt={settings.brandTitle || "Raifa's Mart"}
                    style={{
                      maxHeight: `${settings.mobileBrandLogoHeight || 36}px`,
                      maxWidth: `${settings.mobileBrandLogoWidth || 150}px`,
                      width: "auto",
                      height: "auto",
                    }}
                    className="object-contain block sm:hidden"
                  />
                  {/* Desktop Footer Logo */}
                  <img
                    src={settings.brandLogoUrl || "/assets/RaifasMart Logo Footer.png"}
                    alt={settings.brandTitle || "Raifa's Mart"}
                    style={{
                      maxHeight: `${settings.brandLogoHeight || 46}px`,
                      maxWidth: `${settings.brandLogoWidth || 200}px`,
                      width: "auto",
                      height: "auto",
                    }}
                    className="object-contain hidden sm:block"
                  />
                </>
              ) : (
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  {settings.brandTitle}
                </span>
              )}
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {settings.description}
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-2">
              {settings.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{settings.address}</span>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="hover:text-white transition">
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="hover:text-white transition">
                    {settings.email}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links (e.g. SHOP) */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              {settings.col2Title}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {settings.col2Links.map((link) => (
                <li key={link.id}>
                  <Link href={link.url} className="hover:text-emerald-400 transition">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Care / Policy Links */}
          <div>
            <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
              {settings.col3Title}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/track-order" className="hover:text-emerald-400 font-bold transition flex items-center gap-1.5 text-emerald-400">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Track Your Order</span>
                </Link>
              </li>
              {settings.col3Links.map((link) => (
                <li key={link.id}>
                  {link.url.startsWith("http") ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.url} className="hover:text-emerald-400 transition">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Payment Options & Delivery Hours */}
          {settings.columnsCount >= 4 && (
            <div>
              <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
                {settings.col4Title}
              </h3>
              <p className="text-xs text-slate-400 mb-3">{settings.col4Note}</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                {settings.enableCodBadge && (
                  <span className="px-2.5 py-1 bg-slate-900 text-slate-300 rounded border border-slate-800">
                    Cash on Delivery
                  </span>
                )}
                {settings.enableBkashBadge && (
                  <span className="px-2.5 py-1 bg-rose-950/70 text-rose-300 rounded border border-rose-900/60">
                    bKash
                  </span>
                )}
                {settings.enableNagadBadge && (
                  <span className="px-2.5 py-1 bg-amber-950/70 text-amber-300 rounded border border-amber-900/60">
                    Nagad
                  </span>
                )}
              </div>
              {settings.deliveryHours && (
                <div className="mt-6 text-xs text-slate-500">
                  {settings.deliveryHours}
                </div>
              )}
            </div>
          )}

          {/* Column 5: Social / Extra (Rendered if 5 columns selected) */}
          {settings.columnsCount === 5 && (
            <div>
              <h3 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">
                {settings.col5Title}
              </h3>
              <p className="text-xs text-slate-400 mb-4">{settings.col5Text}</p>
              <div className="flex items-center gap-3">
                {settings.facebookUrl && (
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                  >
                    FB
                  </a>
                )}
                {settings.instagramUrl && (
                  <a
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                  >
                    IG
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>{settings.copyrightText}</div>
          <div className="flex items-center gap-6">
            {settings.bottomLinks.map((blink) => (
              <Link key={blink.id} href={blink.url} className="hover:text-emerald-400 transition">
                {blink.label}
              </Link>
            ))}
            <span>{settings.attributionText}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
