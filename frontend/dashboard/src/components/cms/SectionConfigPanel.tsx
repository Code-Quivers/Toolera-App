"use client";

import React from "react";
import Link from "next/link";
import {
  Plus, Trash2, ArrowRight, Sliders, LayoutGrid, GripVertical,
  Info, ChevronUp, ChevronDown,
} from "lucide-react";
import { CMSSectionItem } from "@/lib/cms/types";
import { useCategoryStore } from "@/store/useCategoryStore";

// ─── Shared field primitives ──────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">{children}</label>;
}

function TextInput({ value, onChange, placeholder, mono }: {
  value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean;
}) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 ${mono ? "font-mono" : ""}`}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 2 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 resize-none"
    />
  );
}

function NumberInput({ value, onChange, min, max, label }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; label?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
      />
      {label && <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">{label}</span>}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-bold transition w-full ${
        checked ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-500"
      }`}
    >
      <div className={`w-8 h-4.5 rounded-full relative transition-colors ${checked ? "bg-emerald-500" : "bg-slate-300"}`}>
        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${checked ? "left-4" : "left-0.5"}`} />
      </div>
      <span>{label}</span>
    </button>
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="pt-2 pb-1">
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex gap-2.5 text-xs text-blue-800">
      <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}

function ChipPresets({ options, value, onChange }: { options: number[]; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
            value === n ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >{n} items</button>
      ))}
    </div>
  );
}

// ─── THEME SECTIONS — auto-populated ─────────────────────────────────────────

const THEME_SECTION_META: Record<string, { name: string; icon: string; description: string; linkHref: string; linkLabel: string }> = {
  "modern-tech-hero-bento": {
    name: "Modern Tech Hero Bento",
    icon: "🖥️",
    description: "Auto-populates with your first two products from the catalog. Large bento grid with dark overlay.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "round-categories-strip": {
    name: "Round Categories Strip",
    icon: "⭕",
    description: "Displays your store categories as circular thumbnails. Managed from the Categories section.",
    linkHref: "/admin/categories",
    linkLabel: "Manage Categories",
  },
  "the-best-offers": {
    name: "The Best Offers",
    icon: "🏷️",
    description: "Highlights products with the biggest discounts or sale prices from your catalog.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "nothing-phone-spotlight": {
    name: "Nothing Phone Spotlight",
    icon: "📱",
    description: "Showcases a featured product in a large spotlight card. Auto-selects from catalog.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "electronics-hero-bento": {
    name: "Electronics Hero Bento",
    icon: "⚡",
    description: "Large electronics-style hero grid. Auto-populates from your product catalog.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "brand-logos-strip": {
    name: "Brand Logos Strip",
    icon: "🏷️",
    description: "Horizontal brand logo carousel. Configure brands under Store Settings.",
    linkHref: "/admin/settings",
    linkLabel: "Store Settings",
  },
  "bestsellers-category-tabs": {
    name: "Bestsellers Category Tabs",
    icon: "📊",
    description: "Tabbed bestseller product grid organized by category.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "airpods-promo-banner": {
    name: "Airpods Promo Banner",
    icon: "🎧",
    description: "Promotional product banner. Customize with a Promo Banner section instead.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "gaming-spotlight": {
    name: "Gaming Spotlight",
    icon: "🎮",
    description: "Gaming category spotlight auto-populated from products.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "supermarket-hero-split": {
    name: "Supermarket Hero Split",
    icon: "🛒",
    description: "Split-panel supermarket hero. Auto-populates from catalog.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "grocery-deal-of-the-day": {
    name: "Grocery Deal of the Day",
    icon: "🥦",
    description: "Daily deal highlight. Auto-selects from products on sale.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "beauty-hero-floral": {
    name: "Beauty Hero Floral",
    icon: "🌸",
    description: "Floral beauty hero banner. Auto-populates from products.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "beauty-ingredients-3step": {
    name: "Beauty Ingredients 3-Step",
    icon: "✨",
    description: "3-step ingredient showcase. Auto-populated from catalog.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "beauty-bento-collage": {
    name: "Beauty Bento Collage",
    icon: "🎨",
    description: "Multi-product beauty collage. Auto-populated from catalog.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "furniture-hero-mountain": {
    name: "Furniture Hero Mountain",
    icon: "🪑",
    description: "Minimalist furniture hero with mountain backdrop. Auto-populated.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "furniture-brand-logos": {
    name: "Furniture Brand Logos",
    icon: "🏷️",
    description: "Furniture brand strip. Configure brands under Store Settings.",
    linkHref: "/admin/settings",
    linkLabel: "Store Settings",
  },
  "furniture-room-categories": {
    name: "Furniture Room Categories",
    icon: "🛋️",
    description: "Room-type category grid. Managed from Categories section.",
    linkHref: "/admin/categories",
    linkLabel: "Manage Categories",
  },
  "fashion-hero-editorial": {
    name: "Fashion Hero Editorial",
    icon: "👗",
    description: "Editorial fashion hero. Auto-populated from products.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
  "fashion-gender-tabs": {
    name: "Fashion Gender Tabs",
    icon: "👔",
    description: "Men/Women tabbed fashion sections. Auto-populated from catalog.",
    linkHref: "/admin/products",
    linkLabel: "Manage Products",
  },
};

function ThemeSectionPanel({ type }: { type: string }) {
  const meta = THEME_SECTION_META[type];
  if (!meta) return (
    <InfoBox>
      <p className="font-bold">Unknown section type: <code>{type}</code></p>
      <p className="mt-1 text-blue-700">This section has no configurable settings.</p>
    </InfoBox>
  );
  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <div className="font-extrabold text-slate-900 text-sm">{meta.name}</div>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Theme Preset Section</div>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">{meta.description}</p>
        <Link
          href={meta.linkHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline"
        >
          {meta.linkLabel} <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <InfoBox>
        <p className="font-bold mb-1">Auto-populated section</p>
        <p>This section renders dynamically from your store data. To change its content, manage the underlying data (products, categories, etc.) rather than editing section settings here.</p>
        <p className="mt-2">To use a fully customizable version, remove this section and add a <strong>configurable equivalent</strong> from the Add Section Library.</p>
      </InfoBox>
    </div>
  );
}

// ─── HERO SLIDER ──────────────────────────────────────────────────────────────

function HeroSliderConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  const slides: any[] = settings.slides || [];

  const addSlide = () => update({
    ...settings,
    slides: [...slides, {
      id: `slide-${Date.now()}`,
      title: "New Slide Title",
      subtitle: "SUBTITLE",
      tagline: "",
      description: "",
      buttonText: "Shop Now",
      buttonLink: "/shop",
      secondaryButtonText: "",
      secondaryButtonLink: "",
      image: "",
      badge: "",
      themeColor: "#1e1b4b",
      active: true,
    }],
  });

  const updateSlide = (idx: number, key: string, val: any) => {
    const next = slides.map((sl, i) => i === idx ? { ...sl, [key]: val } : sl);
    update({ ...settings, slides: next });
  };

  const removeSlide = (idx: number) => {
    update({ ...settings, slides: slides.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-4">
      <InfoBox>Slides are managed in the <Link href="/admin/banners" className="font-bold underline">Banner Manager</Link>. Settings below control the slider behaviour.</InfoBox>

      <SectionDivider label="Slider Settings" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Autoplay</FieldLabel>
          <Toggle checked={!!settings.autoplay} onChange={v => update({ ...settings, autoplay: v })} label="Auto-advance slides" />
        </div>
        <div>
          <FieldLabel>Boxed layout</FieldLabel>
          <Toggle checked={!!settings.boxed} onChange={v => update({ ...settings, boxed: v })} label="Boxed / Full-width" />
        </div>
      </div>
      <div>
        <FieldLabel>Autoplay interval (ms)</FieldLabel>
        <NumberInput value={settings.interval || 5000} onChange={v => update({ ...settings, interval: v })} min={1000} max={15000} label="ms" />
      </div>

      <SectionDivider label={`Slides (${slides.length})`} />
      <div className="space-y-3">
        {slides.map((slide, idx) => (
          <details key={slide.id || idx} className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden group">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">{idx + 1}</span>
                <span className="font-bold text-slate-900 text-xs truncate max-w-[160px]">{slide.title || "Untitled Slide"}</span>
              </div>
              <button type="button" onClick={e => { e.preventDefault(); removeSlide(idx); }} className="text-rose-400 hover:text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </summary>
            <div className="px-4 pb-4 space-y-2.5 bg-white border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2 pt-3">
                <div><FieldLabel>Title</FieldLabel><TextInput value={slide.title} onChange={v => updateSlide(idx, "title", v)} placeholder="INNOVATIVE GADGETS" /></div>
                <div><FieldLabel>Subtitle</FieldLabel><TextInput value={slide.subtitle} onChange={v => updateSlide(idx, "subtitle", v)} placeholder="DIRECT FROM CHINA" /></div>
              </div>
              <div><FieldLabel>Tagline / Badge text</FieldLabel><TextInput value={slide.badge || ""} onChange={v => updateSlide(idx, "badge", v)} placeholder="🔥 FLASH SALE • UP TO 40% OFF" /></div>
              <div><FieldLabel>Description</FieldLabel><TextArea value={slide.description || ""} onChange={v => updateSlide(idx, "description", v)} placeholder="Short paragraph below the title..." /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><FieldLabel>Primary CTA text</FieldLabel><TextInput value={slide.buttonText} onChange={v => updateSlide(idx, "buttonText", v)} placeholder="Shop Now" /></div>
                <div><FieldLabel>Primary CTA link</FieldLabel><TextInput value={slide.buttonLink} onChange={v => updateSlide(idx, "buttonLink", v)} placeholder="/shop" mono /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><FieldLabel>Secondary CTA text</FieldLabel><TextInput value={slide.secondaryButtonText || ""} onChange={v => updateSlide(idx, "secondaryButtonText", v)} placeholder="Explore" /></div>
                <div><FieldLabel>Secondary CTA link</FieldLabel><TextInput value={slide.secondaryButtonLink || ""} onChange={v => updateSlide(idx, "secondaryButtonLink", v)} placeholder="/shop?filter=new" mono /></div>
              </div>
              <div><FieldLabel>Background image URL</FieldLabel><TextInput value={slide.image || ""} onChange={v => updateSlide(idx, "image", v)} placeholder="https://..." mono /></div>
              <div><FieldLabel>Theme / accent color</FieldLabel>
                <div className="flex items-center gap-2">
                  <input type="color" value={slide.themeColor || "#1e1b4b"} onChange={e => updateSlide(idx, "themeColor", e.target.value)} className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5" />
                  <TextInput value={slide.themeColor || "#1e1b4b"} onChange={v => updateSlide(idx, "themeColor", v)} mono />
                </div>
              </div>
              <Toggle checked={!!slide.active} onChange={v => updateSlide(idx, "active", v)} label="Slide active" />
            </div>
          </details>
        ))}
        <button
          type="button"
          onClick={addSlide}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 text-slate-500 hover:text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>
    </div>
  );
}

// ─── CATEGORY CAROUSEL ────────────────────────────────────────────────────────

function CategoryCarouselConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  return (
    <div className="space-y-3.5">
      <div><FieldLabel>Section Title</FieldLabel><TextInput value={settings.title || ""} onChange={v => update({ ...settings, title: v })} placeholder="Shop by Categories" /></div>
      <div><FieldLabel>Tagline / Subtitle</FieldLabel><TextInput value={settings.tagline || ""} onChange={v => update({ ...settings, tagline: v })} placeholder="Curated Collections" /></div>
      <div>
        <FieldLabel>Max categories shown</FieldLabel>
        <NumberInput value={settings.limit || 8} onChange={v => update({ ...settings, limit: v })} min={2} max={20} />
        <ChipPresets options={[4, 6, 8, 12, 16]} value={settings.limit || 8} onChange={v => update({ ...settings, limit: v })} />
      </div>
      <Toggle checked={settings.showCount !== false} onChange={v => update({ ...settings, showCount: v })} label="Show product count on each category" />
      <div className="pt-1">
        <Link href="/admin/categories" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline">
          Manage Categories <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

// ─── PRODUCT SECTION (shared for trending / new-arrivals / best-sellers) ──────

function ProductSectionConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  const { categories } = useCategoryStore();

  return (
    <div className="space-y-3.5">
      <div><FieldLabel>Section Title</FieldLabel><TextInput value={settings.title || ""} onChange={v => update({ ...settings, title: v })} placeholder="Trending Now" /></div>
      <div><FieldLabel>Subtitle / Tagline</FieldLabel><TextArea value={settings.subtitle || ""} onChange={v => update({ ...settings, subtitle: v })} placeholder="Short description..." /></div>

      <SectionDivider label="Products Source" />
      <div>
        <FieldLabel>Product source</FieldLabel>
        <SelectInput
          value={settings.source || "trending"}
          onChange={v => update({ ...settings, source: v })}
          options={[
            { value: "trending", label: "🔥 Trending Now" },
            { value: "best-sellers", label: "🏆 Best Sellers" },
            { value: "new-arrivals", label: "⚡ New Arrivals" },
            { value: "sale", label: "🏷️ Flash Deals / On Sale" },
            { value: "all", label: "📦 All Products" },
          ]}
        />
      </div>
      <div>
        <FieldLabel>Filter by category</FieldLabel>
        <SelectInput
          value={settings.category || "all"}
          onChange={v => update({ ...settings, category: v })}
          options={[
            { value: "all", label: "🌐 All Categories" },
            ...categories.map(c => ({ value: c.slug, label: `📁 ${c.name}` })),
          ]}
        />
      </div>

      <SectionDivider label="Display" />
      <div>
        <FieldLabel>Layout mode</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: "carousel", icon: <Sliders className="w-3.5 h-3.5" />, label: "Carousel" },
            { val: "grid", icon: <LayoutGrid className="w-3.5 h-3.5" />, label: "Grid" },
          ].map(opt => (
            <button
              key={opt.val}
              type="button"
              onClick={() => update({ ...settings, layout: opt.val })}
              className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border ${
                (settings.layout || "carousel") === opt.val
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>
      {(settings.layout || "carousel") === "grid" && (
        <div>
          <FieldLabel>Desktop grid columns</FieldLabel>
          <SelectInput
            value={String(settings.columnsCount || 4)}
            onChange={v => update({ ...settings, columnsCount: Number(v) })}
            options={[
              { value: "2", label: "2 columns (large cards)" },
              { value: "3", label: "3 columns (balanced)" },
              { value: "4", label: "4 columns (standard)" },
              { value: "6", label: "6 columns (compact)" },
            ]}
          />
        </div>
      )}
      <div>
        <FieldLabel>Items to show</FieldLabel>
        <NumberInput value={settings.limit || 8} onChange={v => update({ ...settings, limit: v })} min={1} max={40} />
        <div className="mt-1.5"><ChipPresets options={[4, 6, 8, 12, 16, 24]} value={settings.limit || 8} onChange={v => update({ ...settings, limit: v })} /></div>
      </div>

      <SectionDivider label="Card Features" />
      <div className="space-y-2">
        <Toggle checked={settings.showRating !== false} onChange={v => update({ ...settings, showRating: v })} label="Show star ratings" />
        <Toggle checked={!!settings.showUrgencyBar} onChange={v => update({ ...settings, showUrgencyBar: v })} label="Show urgency / stock bar" />
        <Toggle checked={settings.showQuickAdd !== false} onChange={v => update({ ...settings, showQuickAdd: v })} label="Show quick-add to cart" />
        <Toggle checked={settings.showBadge !== false} onChange={v => update({ ...settings, showBadge: v })} label="Show NEW / SALE badges" />
      </div>
    </div>
  );
}

// ─── SPOTLIGHT ────────────────────────────────────────────────────────────────

function SpotlightConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  return (
    <div className="space-y-3.5">
      <InfoBox>Product Spotlight auto-selects the featured product. Use the fields below to override display text.</InfoBox>
      <div><FieldLabel>Badge label</FieldLabel><TextInput value={settings.badgeText || ""} onChange={v => update({ ...settings, badgeText: v })} placeholder="TODAY'S FIND" /></div>
      <div><FieldLabel>Override title (leave blank to use product name)</FieldLabel><TextInput value={settings.customTitle || ""} onChange={v => update({ ...settings, customTitle: v })} placeholder="Product name..." /></div>
      <div><FieldLabel>Override description</FieldLabel><TextArea value={settings.customDescription || ""} onChange={v => update({ ...settings, customDescription: v })} placeholder="Short compelling description..." rows={3} /></div>
      <Toggle checked={settings.showSpecs !== false} onChange={v => update({ ...settings, showSpecs: v })} label="Show product specifications list" />
      <div className="pt-1"><Link href="/admin/products" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline">Manage Products <ArrowRight className="w-3 h-3" /></Link></div>
    </div>
  );
}

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

function ReviewsConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  const reviews: any[] = settings.customReviews || settings.reviews || [];

  const defaultReviews = [
    { id: "cr-1", authorName: "Tanvir Ahmed", authorLocation: "Dhanmondi, Dhaka", rating: 5, comment: "Fast delivery and great quality!", productTitle: "Trending Gadget", avatarUrl: "" },
  ];

  const currentList = reviews.length > 0 ? reviews : defaultReviews;

  const addReview = () => {
    const newRev = { id: `cr-${Date.now()}`, authorName: "Happy Customer", authorLocation: "Dhaka", rating: 5, comment: "Loved the product quality and fast delivery!", productTitle: "Store Item", avatarUrl: "" };
    const next = [...currentList, newRev];
    update({ ...settings, customReviews: next, reviews: next });
  };

  const updateRev = (idx: number, key: string, val: any) => {
    const next = currentList.map((r, i) => i === idx ? { ...r, [key]: val } : r);
    update({ ...settings, customReviews: next, reviews: next });
  };

  const removeRev = (idx: number) => {
    const next = currentList.filter((_, i) => i !== idx);
    update({ ...settings, customReviews: next, reviews: next });
  };

  return (
    <div className="space-y-3.5">
      <div><FieldLabel>Section Title</FieldLabel><TextInput value={settings.title || ""} onChange={v => update({ ...settings, title: v })} placeholder="Loved by Our Customers" /></div>
      <div><FieldLabel>Subtitle</FieldLabel><TextInput value={settings.subtitle || ""} onChange={v => update({ ...settings, subtitle: v })} placeholder="Real experiences from verified shoppers..." /></div>
      <div>
        <FieldLabel>Display limit</FieldLabel>
        <NumberInput value={settings.limit || 4} onChange={v => update({ ...settings, limit: v })} min={1} max={20} />
        <div className="mt-1.5"><ChipPresets options={[2, 3, 4, 6, 8]} value={settings.limit || 4} onChange={v => update({ ...settings, limit: v })} /></div>
      </div>

      <SectionDivider label={`Review Cards (${currentList.length})`} />
      <div className="space-y-2.5">
        {currentList.map((rev, idx) => (
          <details key={rev.id || idx} className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <summary className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer select-none hover:bg-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-black flex items-center justify-center">{idx + 1}</span>
                <span className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{rev.authorName || "Customer"}</span>
                <span className="text-[10px] text-slate-400">{"⭐".repeat(Math.floor(rev.rating || 5))}</span>
              </div>
              <button type="button" onClick={e => { e.preventDefault(); removeRev(idx); }} className="text-rose-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </summary>
            <div className="px-3.5 pb-3.5 space-y-2 bg-white border-t border-slate-100 pt-3">
              <div className="grid grid-cols-2 gap-2">
                <div><FieldLabel>Customer name</FieldLabel><TextInput value={rev.authorName || ""} onChange={v => updateRev(idx, "authorName", v)} placeholder="Tanvir Ahmed" /></div>
                <div><FieldLabel>City / Location</FieldLabel><TextInput value={rev.authorLocation || ""} onChange={v => updateRev(idx, "authorLocation", v)} placeholder="Dhaka" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <FieldLabel>Star rating</FieldLabel>
                  <SelectInput
                    value={String(rev.rating || 5)}
                    onChange={v => updateRev(idx, "rating", Number(v))}
                    options={[
                      { value: "5", label: "⭐⭐⭐⭐⭐ 5 Stars" },
                      { value: "4.5", label: "⭐⭐⭐⭐½ 4.5 Stars" },
                      { value: "4", label: "⭐⭐⭐⭐ 4 Stars" },
                      { value: "3", label: "⭐⭐⭐ 3 Stars" },
                    ]}
                  />
                </div>
                <div><FieldLabel>Product purchased</FieldLabel><TextInput value={rev.productTitle || ""} onChange={v => updateRev(idx, "productTitle", v)} placeholder="Gadget name" /></div>
              </div>
              <div><FieldLabel>Review comment</FieldLabel><TextArea value={rev.comment || ""} onChange={v => updateRev(idx, "comment", v)} placeholder="Customer testimonial..." rows={2} /></div>
              <div><FieldLabel>Avatar photo URL</FieldLabel><TextInput value={rev.avatarUrl || ""} onChange={v => updateRev(idx, "avatarUrl", v)} placeholder="https://..." mono /></div>
            </div>
          </details>
        ))}
        <button type="button" onClick={addReview} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 text-slate-500 hover:text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition">
          <Plus className="w-4 h-4" /> Add Review Card
        </button>
      </div>
    </div>
  );
}

// ─── TRUST PILLARS ────────────────────────────────────────────────────────────

const PILLAR_ICONS = [
  { value: "Sparkles", label: "✨ Sparkles" },
  { value: "ShieldCheck", label: "🛡️ Shield Check" },
  { value: "Banknote", label: "💵 Cash / COD" },
  { value: "RotateCcw", label: "🔄 7-Day Return" },
  { value: "Truck", label: "🚚 Fast Delivery" },
  { value: "Headphones", label: "🎧 24/7 Support" },
  { value: "PackageCheck", label: "📦 Package Check" },
  { value: "Award", label: "🏆 Award Quality" },
  { value: "HeartHandshake", label: "🤝 Handshake" },
  { value: "CheckCircle2", label: "✅ Verified Check" },
  { value: "Lock", label: "🔒 Secure Lock" },
  { value: "ThumbsUp", label: "👍 Thumbs Up" },
];

function TrustPillarsConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  const defaultPillars = [
    { iconName: "Sparkles", title: "Carefully Selected", description: "We curate only items that solve real problems." },
    { iconName: "ShieldCheck", title: "Quality Checked", description: "Every product is physically inspected before dispatch." },
    { iconName: "Banknote", title: "Cash on Delivery", description: "Pay conveniently at your doorstep anywhere in Bangladesh." },
    { iconName: "RotateCcw", title: "Easy 7-Day Returns", description: "Hassle-free replacement for defective units." },
  ];
  const pillars: any[] = settings.pillars?.length > 0 ? settings.pillars : defaultPillars;

  const addPillar = () => {
    update({ ...settings, pillars: [...pillars, { iconName: "CheckCircle2", title: "New Guarantee", description: "Explain your benefit or assurance guarantee." }] });
  };

  const updatePillar = (idx: number, key: string, val: string) => {
    const next = pillars.map((p, i) => i === idx ? { ...p, [key]: val } : p);
    update({ ...settings, pillars: next });
  };

  const removePillar = (idx: number) => {
    update({ ...settings, pillars: pillars.filter((_, i) => i !== idx) });
  };

  const movePillar = (idx: number, dir: -1 | 1) => {
    const next = [...pillars];
    const [item] = next.splice(idx, 1);
    next.splice(idx + dir, 0, item);
    update({ ...settings, pillars: next });
  };

  return (
    <div className="space-y-3.5">
      <div><FieldLabel>Section Title</FieldLabel><TextInput value={settings.title || ""} onChange={v => update({ ...settings, title: v })} placeholder="Why Shop With Us?" /></div>
      <div><FieldLabel>Subtitle</FieldLabel><TextInput value={settings.subtitle || ""} onChange={v => update({ ...settings, subtitle: v })} placeholder="Built on trust and reliability." /></div>

      <SectionDivider label={`Guarantee Cards (${pillars.length})`} />
      <div className="space-y-2.5">
        {pillars.map((p, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center">{idx + 1}</span>
                Pillar #{idx + 1}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => movePillar(idx, -1)} disabled={idx === 0} className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => movePillar(idx, 1)} disabled={idx === pillars.length - 1} className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                <button type="button" onClick={() => removePillar(idx)} className="p-1 rounded text-rose-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2"><FieldLabel>Card Title</FieldLabel><TextInput value={p.title || ""} onChange={v => updatePillar(idx, "title", v)} placeholder="Quality Checked" /></div>
              <div><FieldLabel>Icon</FieldLabel><SelectInput value={p.iconName || "Sparkles"} onChange={v => updatePillar(idx, "iconName", v)} options={PILLAR_ICONS} /></div>
            </div>
            <div><FieldLabel>Description</FieldLabel><TextArea value={p.description || ""} onChange={v => updatePillar(idx, "description", v)} placeholder="Explain the guarantee..." rows={2} /></div>
          </div>
        ))}
        <button type="button" onClick={addPillar} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 text-slate-500 hover:text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition">
          <Plus className="w-4 h-4" /> Add Pillar Card
        </button>
      </div>
    </div>
  );
}

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────

function NewsletterConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  return (
    <div className="space-y-3.5">
      <div><FieldLabel>Tag / Eyebrow text</FieldLabel><TextInput value={settings.tagline || ""} onChange={v => update({ ...settings, tagline: v })} placeholder="Stay in the Loop" /></div>
      <div><FieldLabel>Headline</FieldLabel><TextInput value={settings.title || ""} onChange={v => update({ ...settings, title: v })} placeholder="Get the Good Stuff First." /></div>
      <div><FieldLabel>Description</FieldLabel><TextArea value={settings.description || ""} onChange={v => update({ ...settings, description: v })} placeholder="Be the first to discover new trending finds..." rows={3} /></div>
      <div><FieldLabel>Subscribe button text</FieldLabel><TextInput value={settings.buttonText || ""} onChange={v => update({ ...settings, buttonText: v })} placeholder="Subscribe" /></div>
    </div>
  );
}

// ─── PROMO BANNER ─────────────────────────────────────────────────────────────

function PromoBannerConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  return (
    <div className="space-y-3.5">
      <div><FieldLabel>Headline</FieldLabel><TextInput value={settings.headline || ""} onChange={v => update({ ...settings, headline: v })} placeholder="Flash Deal — 40% Off" /></div>
      <div><FieldLabel>Subtext</FieldLabel><TextInput value={settings.subtext || ""} onChange={v => update({ ...settings, subtext: v })} placeholder="Limited stock available." /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><FieldLabel>Button text</FieldLabel><TextInput value={settings.buttonText || ""} onChange={v => update({ ...settings, buttonText: v })} placeholder="Claim Deal" /></div>
        <div><FieldLabel>Button link</FieldLabel><TextInput value={settings.buttonLink || ""} onChange={v => update({ ...settings, buttonLink: v })} placeholder="/shop" mono /></div>
      </div>
      <div><FieldLabel>Background image URL</FieldLabel><TextInput value={settings.imageUrl || ""} onChange={v => update({ ...settings, imageUrl: v })} placeholder="https://..." mono /></div>
      {settings.imageUrl && (
        <img src={settings.imageUrl} alt="Preview" className="w-full h-24 object-cover rounded-xl border border-slate-200" onError={e => (e.currentTarget.style.display = "none")} />
      )}
      <div>
        <FieldLabel>Banner height (px)</FieldLabel>
        <NumberInput value={settings.height || 220} onChange={v => update({ ...settings, height: v })} min={80} max={600} label="px" />
      </div>
    </div>
  );
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

function FaqConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  const items: any[] = settings.items || [];

  const addItem = () => update({ ...settings, items: [...items, { question: "New FAQ Question?", answer: "Answer goes here." }] });
  const updateItem = (idx: number, key: string, val: string) => {
    update({ ...settings, items: items.map((it, i) => i === idx ? { ...it, [key]: val } : it) });
  };
  const removeItem = (idx: number) => update({ ...settings, items: items.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-3.5">
      <div><FieldLabel>Section Title</FieldLabel><TextInput value={settings.title || ""} onChange={v => update({ ...settings, title: v })} placeholder="Frequently Asked Questions" /></div>
      <SectionDivider label={`Questions (${items.length})`} />
      <div className="space-y-2.5">
        {items.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 text-xs">Q{idx + 1}</span>
              <button type="button" onClick={() => removeItem(idx)} className="text-rose-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
            <div><FieldLabel>Question</FieldLabel><TextInput value={item.question || ""} onChange={v => updateItem(idx, "question", v)} placeholder="How long does delivery take?" /></div>
            <div><FieldLabel>Answer</FieldLabel><TextArea value={item.answer || ""} onChange={v => updateItem(idx, "answer", v)} placeholder="1–2 days inside Dhaka, 2–4 days elsewhere." rows={2} /></div>
          </div>
        ))}
        <button type="button" onClick={addItem} className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 text-slate-500 hover:text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition">
          <Plus className="w-4 h-4" /> Add Q&amp;A
        </button>
      </div>
    </div>
  );
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────

function CountdownConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  return (
    <div className="space-y-3.5">
      <div><FieldLabel>Flash sale headline</FieldLabel><TextInput value={settings.title || ""} onChange={v => update({ ...settings, title: v })} placeholder="Midnight Flash Deals End Soon!" /></div>
      <div><FieldLabel>Discount text</FieldLabel><TextInput value={settings.discountText || ""} onChange={v => update({ ...settings, discountText: v })} placeholder="Get 40% OFF with code" /></div>
      <div className="grid grid-cols-2 gap-2">
        <div><FieldLabel>Coupon code</FieldLabel><TextInput value={settings.couponCode || ""} onChange={v => update({ ...settings, couponCode: v })} placeholder="TRENDY40" mono /></div>
        <div>
          <FieldLabel>Timer duration (hours)</FieldLabel>
          <NumberInput value={settings.targetHours || 12} onChange={v => update({ ...settings, targetHours: v })} min={1} max={72} label="hr" />
        </div>
      </div>
      <div><FieldLabel>Shop link</FieldLabel><TextInput value={settings.linkUrl || ""} onChange={v => update({ ...settings, linkUrl: v })} placeholder="/shop?filter=trending" mono /></div>
      <div className="pt-1"><Link href="/admin/marketing/coupons" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:underline">Manage Coupons <ArrowRight className="w-3 h-3" /></Link></div>
    </div>
  );
}

// ─── Rich Text ────────────────────────────────────────────────────────────────

function RichTextConfig({ s, update }: { s: CMSSectionItem; update: (settings: any) => void }) {
  const settings = s.settings || {};
  return (
    <div className="space-y-3.5">
      <div><FieldLabel>Heading</FieldLabel><TextInput value={settings.heading || ""} onChange={v => update({ ...settings, heading: v })} placeholder="About Our Curated Collection" /></div>
      <div><FieldLabel>Content</FieldLabel><TextArea value={settings.content || ""} onChange={v => update({ ...settings, content: v })} placeholder="We test and hand-select..." rows={5} /></div>
      <div>
        <FieldLabel>Text alignment</FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: "left", label: "Left" },
            { val: "center", label: "Center" },
          ].map(opt => (
            <button
              key={opt.val}
              type="button"
              onClick={() => update({ ...settings, alignment: opt.val })}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                (settings.alignment || "center") === opt.val
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
              }`}
            >{opt.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

interface Props {
  section: CMSSectionItem;
  onChange: (updated: CMSSectionItem) => void;
}

export function SectionConfigPanel({ section, onChange }: Props) {
  const update = (newSettings: any) => onChange({ ...section, settings: newSettings });

  const type = section.type;

  // Registered, configurable section types
  if (type === "hero-slider") return <HeroSliderConfig s={section} update={update} />;
  if (type === "category-carousel") return <CategoryCarouselConfig s={section} update={update} />;
  if (type === "trending-products" || type === "new-arrivals" || type === "best-sellers") return <ProductSectionConfig s={section} update={update} />;
  if (type === "spotlight") return <SpotlightConfig s={section} update={update} />;
  if (type === "reviews") return <ReviewsConfig s={section} update={update} />;
  if (type === "trust-pillars") return <TrustPillarsConfig s={section} update={update} />;
  if (type === "newsletter") return <NewsletterConfig s={section} update={update} />;
  if (type === "promo-banner") return <PromoBannerConfig s={section} update={update} />;
  if (type === "faq") return <FaqConfig s={section} update={update} />;
  if (type === "countdown") return <CountdownConfig s={section} update={update} />;
  if (type === "rich-text") return <RichTextConfig s={section} update={update} />;

  // Theme preset sections (auto-populated, limited config)
  if (type in THEME_SECTION_META) return <ThemeSectionPanel type={type} />;

  // Fallback for truly unknown types
  return (
    <InfoBox>
      <p className="font-bold">Section type: <code>{type}</code></p>
      <p className="mt-1 text-blue-700">No configurable settings are available for this section type.</p>
    </InfoBox>
  );
}
