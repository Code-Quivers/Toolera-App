"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Smartphone,
  Laptop,
  Cpu,
  Gamepad2,
  Tv,
  Home,
  Camera,
  Headphones,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Flame,
  Layers,
  Zap,
  Tag,
} from "lucide-react";
import { useMenuStore, MenuItemData } from "@/store/useMenuStore";

interface SubGroup {
  title: string;
  items: { name: string; href: string }[];
}

interface CategoryMegaData {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  subGroups: SubGroup[];
  featuredPromo?: {
    tag: string;
    title: string;
    description: string;
    image: string;
    buttonText: string;
    href: string;
  };
}

const DEFAULT_MEGA_CATEGORIES: CategoryMegaData[] = [
  {
    id: "cat-m-1",
    name: "Smartphones & Mobile",
    slug: "smart-gadgets",
    icon: <Smartphone className="w-4 h-4" />,
    subGroups: [
      {
        title: "Smartphones",
        items: [
          { name: "Apple", href: "/category/smart-gadgets" },
          { name: "Samsung", href: "/category/smart-gadgets" },
          { name: "Google", href: "/category/smart-gadgets" },
          { name: "Nokia", href: "/category/smart-gadgets" },
          { name: "Motorola", href: "/category/smart-gadgets" },
          { name: "Refurbished phones", href: "/category/smart-gadgets" },
        ],
      },
      {
        title: "Accessories",
        items: [
          { name: "Memory cards", href: "/category/smart-gadgets" },
          { name: "Stand holders", href: "/category/smart-gadgets" },
          { name: "Car holders", href: "/category/car-accessories" },
          { name: "Selfie sticks", href: "/category/smart-gadgets" },
        ],
      },
      {
        title: "Power Banks",
        items: [
          { name: "Baseus", href: "/category/smart-gadgets" },
          { name: "Remax", href: "/category/smart-gadgets" },
          { name: "Hoco", href: "/category/smart-gadgets" },
        ],
      },
      {
        title: "Screen Protectors",
        items: [
          { name: "Tempered glass", href: "/category/smart-gadgets" },
          { name: "Polycarbonate protector", href: "/category/smart-gadgets" },
        ],
      },
      {
        title: "Covers For Phones",
        items: [
          { name: "Cavers-overlays", href: "/category/smart-gadgets" },
          { name: "Covers-cases", href: "/category/smart-gadgets" },
        ],
      },
      {
        title: "Headphones",
        items: [
          { name: "In-ear headphones", href: "/category/smart-gadgets" },
          { name: "Wired headphones", href: "/category/smart-gadgets" },
          { name: "Wireless headphones", href: "/category/smart-gadgets" },
          { name: "Bluetooth headsets", href: "/category/smart-gadgets" },
        ],
      },
      {
        title: "Power Devices",
        items: [
          { name: "Mains chargers", href: "/category/smart-gadgets" },
          { name: "Data cables", href: "/category/smart-gadgets" },
          { name: "Wireless chargers", href: "/category/smart-gadgets" },
        ],
      },
    ],
    featuredPromo: {
      tag: "Trending Find",
      title: "Magnetic LED Lamp",
      description: "Wireless touch controller with floating levitation switch.",
      image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
      buttonText: "Shop Deal",
      href: "/product/magnetic-desk-lamp",
    },
  },
  {
    id: "cat-m-2",
    name: "Desk Setup & Workspace",
    slug: "desk-setup",
    icon: <Laptop className="w-4 h-4" />,
    subGroups: [
      {
        title: "Desk Lighting",
        items: [
          { name: "Screenbar Monitor Lights", href: "/category/desk-setup" },
          { name: "RGB Ambient Backlights", href: "/category/desk-setup" },
          { name: "Magnetic Gooseneck Lamps", href: "/category/desk-setup" },
        ],
      },
      {
        title: "Stands & Risers",
        items: [
          { name: "Aluminum Laptop Risers", href: "/category/desk-setup" },
          { name: "Dual Monitor Arms", href: "/category/desk-setup" },
        ],
      },
      {
        title: "Desk Accessories",
        items: [
          { name: "Leather Desk Mats", href: "/category/desk-setup" },
          { name: "Cable Management Trays", href: "/category/desk-setup" },
          { name: "Memory Foam Wrist Rests", href: "/category/desk-setup" },
        ],
      },
    ],
    featuredPromo: {
      tag: "Best Seller",
      title: "Ergo Laptop Stand",
      description: "CNC Aluminum 360° rotation with active cooling slots.",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
      buttonText: "Explore Stand",
      href: "/category/desk-setup",
    },
  },
  {
    id: "cat-m-3",
    name: "Smart Home & Living",
    slug: "home-living",
    icon: <Home className="w-4 h-4" />,
    subGroups: [
      {
        title: "Aesthetic Living",
        items: [
          { name: "Flame LED Aroma Diffusers", href: "/category/home-living" },
          { name: "Anti-Gravity Humidifiers", href: "/category/home-living" },
        ],
      },
      {
        title: "Smart Sensors",
        items: [
          { name: "Motion Sensor Lights", href: "/category/home-living" },
          { name: "Digital Thermo-Hygrometers", href: "/category/home-living" },
        ],
      },
      {
        title: "Home Organization",
        items: [
          { name: "Magnetic Key Holders", href: "/category/home-living" },
          { name: "Space-saving Shelf Clips", href: "/category/home-living" },
        ],
      },
    ],
    featuredPromo: {
      tag: "Viral Find",
      title: "Flame LED Diffuser",
      description: "Ultrasonic mist with fireplace visual ambiance.",
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80",
      buttonText: "Get Yours",
      href: "/product/flame-diffuser-led",
    },
  },
  {
    id: "cat-m-4",
    name: "Lifestyle & Travel",
    slug: "lifestyle-travel",
    icon: <Sparkles className="w-4 h-4" />,
    subGroups: [
      {
        title: "Portable Cooling",
        items: [
          { name: "Turbo Handheld Mini Fans", href: "/category/lifestyle-travel" },
          { name: "Neck Band Fans", href: "/category/lifestyle-travel" },
        ],
      },
      {
        title: "Travel Gear",
        items: [
          { name: "Compressible Packing Cubes", href: "/category/lifestyle-travel" },
          { name: "Universal Travel Adapters", href: "/category/lifestyle-travel" },
        ],
      },
    ],
  },
  {
    id: "cat-m-5",
    name: "Car Accessories",
    slug: "car-accessories",
    icon: <Zap className="w-4 h-4" />,
    subGroups: [
      {
        title: "In-Car Gadgets",
        items: [
          { name: "MagSafe Auto Mounts", href: "/category/car-accessories" },
          { name: "Cordless Car Vacuums", href: "/category/car-accessories" },
        ],
      },
    ],
  },
  {
    id: "cat-m-6",
    name: "Kitchen Gadgets",
    slug: "kitchen-gadgets",
    icon: <Flame className="w-4 h-4" />,
    subGroups: [
      {
        title: "Smart Kitchen",
        items: [
          { name: "Portable USB Blenders", href: "/category/kitchen-gadgets" },
          { name: "Rechargeable Bag Sealers", href: "/category/kitchen-gadgets" },
        ],
      },
    ],
  },
];

interface CategoryMegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryMegaMenu({ isOpen, onClose }: CategoryMegaMenuProps) {
  const { getMenuByLocation } = useMenuStore();
  const categoryMenu = getMenuByLocation("categories");

  // Build mega category items from Menu store
  const megaList: CategoryMegaData[] = useMemo(() => {
    if (!categoryMenu || categoryMenu.items.length === 0) {
      return DEFAULT_MEGA_CATEGORIES;
    }

    const rootItems = categoryMenu.items.filter((it) => !it.parentId);
    if (rootItems.length === 0) return DEFAULT_MEGA_CATEGORIES;

    return rootItems.map((root, idx) => {
      // Find all Level 2 children of root
      const level2Items = categoryMenu.items.filter((it) => it.parentId === root.id);

      // Check if any Level 2 item has Level 3 children
      const subGroups: SubGroup[] = [];

      if (level2Items.length > 0) {
        level2Items.forEach((l2) => {
          const l3Items = categoryMenu.items.filter((it) => it.parentId === l2.id);
          if (l3Items.length > 0) {
            // Level 2 is a column heading!
            subGroups.push({
              title: l2.label,
              items: l3Items.map((l3) => ({ name: l3.label, href: l3.url })),
            });
          } else {
            // Direct link under root
            subGroups.push({
              title: l2.label,
              items: [{ name: l2.label, href: l2.url }],
            });
          }
        });
      }

      // Default icon mapping
      let icon = <Layers className="w-4 h-4" />;
      const l = root.label.toLowerCase();
      if (l.includes("phone") || l.includes("mobile")) icon = <Smartphone className="w-4 h-4" />;
      else if (l.includes("desk") || l.includes("setup")) icon = <Laptop className="w-4 h-4" />;
      else if (l.includes("home") || l.includes("living")) icon = <Home className="w-4 h-4" />;
      else if (l.includes("travel") || l.includes("life")) icon = <Sparkles className="w-4 h-4" />;
      else if (l.includes("car")) icon = <Zap className="w-4 h-4" />;
      else if (l.includes("kitchen")) icon = <Flame className="w-4 h-4" />;

      const matchingDefault = DEFAULT_MEGA_CATEGORIES[idx % DEFAULT_MEGA_CATEGORIES.length];

      const finalSubGroups = subGroups.length > 0 ? subGroups : matchingDefault?.subGroups || [];

      const customPromo = root.promoTitle
        ? {
            tag: root.promoTag || "Featured",
            title: root.promoTitle,
            description: root.promoDescription || "",
            image: root.promoImage || matchingDefault?.featuredPromo?.image || "",
            buttonText: root.promoButtonText || "Shop Deal",
            href: root.promoButtonLink || root.url,
          }
        : matchingDefault?.featuredPromo;

      return {
        id: root.id,
        name: root.label,
        slug: root.url.replace("/category/", ""),
        icon,
        subGroups: finalSubGroups,
        featuredPromo: customPromo,
      };
    });
  }, [categoryMenu]);

  const [activeCatId, setActiveCatId] = useState<string>(megaList[0]?.id || "cat-m-1");

  if (!isOpen) return null;

  const currentCategory =
    megaList.find((c) => c.id === activeCatId) || megaList[0] || DEFAULT_MEGA_CATEGORIES[0];

  // Organize sub-groups into up to 3 distinct multi-columns
  const columns: SubGroup[][] = [[], [], []];
  currentCategory?.subGroups?.forEach((group, idx) => {
    columns[idx % 3].push(group);
  });

  return (
    <div
      onMouseLeave={onClose}
      className="absolute top-full left-0 w-[1140px] max-w-[calc(100vw-2.5rem)] bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-98 slide-in-from-top-2 duration-200 text-left"
    >
      <div className="flex min-h-[460px]">
        {/* ============================================================== */}
        {/* LEFT SIDEBAR: Vertical Categories List (Boxed 250px)          */}
        {/* ============================================================== */}
        <div className="w-64 bg-slate-50/80 border-r border-slate-100 p-3 space-y-1 shrink-0">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            {categoryMenu?.name || "All Categories"}
          </div>

          <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
            {megaList.map((cat) => {
              const isActive = cat.id === activeCatId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onMouseEnter={() => setActiveCatId(cat.id)}
                  onClick={() => setActiveCatId(cat.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left group ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-700 hover:bg-white hover:text-slate-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-700"}>
                      {cat.icon}
                    </span>
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive ? "text-white translate-x-0.5" : "text-slate-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200/60 mt-2 px-2">
            <Link
              href="/shop"
              onClick={onClose}
              className="flex items-center justify-between text-[11px] font-bold text-emerald-700 hover:underline py-1"
            >
              <span>Browse Full Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT CONTENT: 3-Column Sub-Categories + Featured Promo Card   */}
        {/* ============================================================== */}
        <div className="flex-1 p-6 sm:p-7 flex justify-between gap-6 bg-white overflow-x-auto">
          {/* 3 Columns Sub-groups Grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {columns.map((colGroups, colIdx) => (
              <div key={colIdx} className="space-y-6">
                {colGroups.map((group, gIdx) => (
                  <div key={gIdx} className="space-y-2.5">
                    {/* Blue / Purple Category Group Heading (Matching Screenshot) */}
                    <div className="font-extrabold text-blue-600 text-xs tracking-tight hover:underline cursor-pointer">
                      <Link href={`/category/${currentCategory.slug}`}>{group.title}</Link>
                    </div>

                    {/* Sub-links under heading */}
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {group.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className="text-slate-600 hover:text-slate-950 hover:font-medium hover:translate-x-1 transition-all inline-block"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Featured Promo Card on the Right */}
          {currentCategory?.featuredPromo && (
            <div className="w-64 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between space-y-3 shrink-0">
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {currentCategory.featuredPromo.tag}
                </span>

                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-200 border border-slate-200/60 shadow-xs">
                  <img
                    src={currentCategory.featuredPromo.image}
                    alt={currentCategory.featuredPromo.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>

                <div className="font-extrabold text-slate-900 text-xs">
                  {currentCategory.featuredPromo.title}
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                  {currentCategory.featuredPromo.description}
                </p>
              </div>

              <Link
                href={currentCategory.featuredPromo.href}
                onClick={onClose}
                className="w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
              >
                <span>{currentCategory.featuredPromo.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
