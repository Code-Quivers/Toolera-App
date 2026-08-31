import React from "react";
import {
  Sparkles,
  ShieldCheck,
  Banknote,
  RotateCcw,
  Truck,
  Headphones,
  PackageCheck,
  Award,
  HeartHandshake,
  CheckCircle2,
  Lock,
  ThumbsUp,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  ShieldCheck,
  Banknote,
  RotateCcw,
  Truck,
  Headphones,
  PackageCheck,
  Award,
  HeartHandshake,
  CheckCircle2,
  Lock,
  ThumbsUp,
};

const DEFAULT_PILLARS = [
  {
    iconName: "Sparkles",
    title: "Carefully Selected",
    description: "We don't list everything. We curate only items that solve real problems or spark genuine joy.",
  },
  {
    iconName: "ShieldCheck",
    title: "Quality Checked",
    description: "Every product is physically inspected for build quality and function before dispatch.",
  },
  {
    iconName: "Banknote",
    title: "Cash on Delivery",
    description: "Pay conveniently in cash when the delivery person arrives at your doorstep anywhere in Bangladesh.",
  },
  {
    iconName: "RotateCcw",
    title: "Easy 7-Day Returns",
    description: "Received a damaged or malfunctioning unit? We replace it or refund with zero hassle.",
  },
];

interface TrustSectionProps {
  settings?: {
    title?: string;
    headline?: string;
    heading?: string;
    subtitle?: string;
    tagline?: string;
    subtext?: string;
    description?: string;
    pillars?: Array<{
      title: string;
      description: string;
      iconName?: string;
    }>;
  };
}

export function TrustSection({ settings }: TrustSectionProps = {}) {
  const title =
    settings?.title ||
    settings?.headline ||
    settings?.heading ||
    "Why Shop With Toolera?";

  const subtitle =
    settings?.subtitle ||
    settings?.tagline ||
    settings?.subtext ||
    settings?.description ||
    "We are built on trust, genuine curation, and reliable local support.";

  const pillars =
    settings?.pillars && settings.pillars.length > 0
      ? settings.pillars
      : DEFAULT_PILLARS;

  return (
    <section className="py-8 sm:py-10 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Dynamic Pillars */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 gap-8 ${
            pillars.length === 3
              ? "lg:grid-cols-3"
              : pillars.length === 5
              ? "lg:grid-cols-5"
              : "lg:grid-cols-4"
          }`}
        >
          {pillars.map((pillar, i) => {
            const Icon = (pillar.iconName && ICON_MAP[pillar.iconName]) || Sparkles;
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50/80 border border-slate-200/60 hover:border-[#008B47]/50 hover:bg-emerald-50/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-[#008B47] mb-4 group-hover:scale-110 group-hover:bg-[#008B47] group-hover:text-white transition-all shadow-xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
