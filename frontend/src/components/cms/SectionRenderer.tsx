"use client";

import React from "react";
import { CMSSectionItem } from "@/lib/cms/types";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryStories } from "@/components/home/CategoryStories";
import { TrendingSection } from "@/components/home/TrendingSection";
import { ProductSpotlight } from "@/components/home/ProductSpotlight";
import { NewArrivals } from "@/components/home/NewArrivals";
import { BestSellers } from "@/components/home/BestSellers";
import { CustomerReviews } from "@/components/home/CustomerReviews";
import { TrustSection } from "@/components/home/TrustSection";
import { Newsletter } from "@/components/home/Newsletter";
import { PromoBanner } from "@/components/home/PromoBanner";
import { RichTextSection } from "@/components/home/RichTextSection";
import { FaqSection } from "@/components/home/FaqSection";
import { CountdownSection } from "@/components/home/CountdownSection";

// Modular Theme Sections
import {
  ElectronicsHeroBento,
  BrandLogosStrip,
  BestsellersCategoryTabs,
  AirpodsPromoBanner,
  GamingSpotlight,
} from "@/components/home/modular/ElectronicsSections";

import {
  ModernTechHeroBento,
  RoundCategoriesStrip,
  TheBestOffers,
  NothingPhoneSpotlight,
} from "@/components/home/modular/ModernTechSections";

import {
  SupermarketHeroSplit,
  GroceryDealOfTheDay,
  BeautyHeroFloral,
  BeautyIngredients3Step,
  BeautyBentoCollage,
  FurnitureHeroMountain,
  FurnitureBrandLogos,
  FurnitureRoomCategories,
  FashionHeroEditorial,
  FashionGenderTabs,
} from "@/components/home/modular/OtherThemeSections";

interface SectionRendererProps {
  sections: CMSSectionItem[];
  isPreview?: boolean;
}

export function SectionRenderer({ sections, isPreview = false }: SectionRendererProps) {
  // Sort sections by position and filter enabled
  const sortedSections = [...sections]
    .sort((a, b) => a.position - b.position)
    .filter((sec) => (isPreview ? true : sec.enabled));

  return (
    <div className="flex flex-col w-full space-y-2 pb-12">
      {sortedSections.map((section) => {
        if (!section.enabled && !isPreview) return null;

        const key = section.id;
        const settings = section.settings;

        return (
          <div
            key={key}
            className={`w-full relative transition-all duration-200 ${
              isPreview && !section.enabled ? "opacity-40 grayscale-75" : ""
            }`}
          >
            {isPreview && !section.enabled && (
              <div className="absolute top-2 right-2 z-30 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[10px] font-bold">
                Hidden on live site
              </div>
            )}

            {/* Core Default Sections */}
            {section.type === "hero-slider" && (
              <HeroSection customSlides={settings?.slides} />
            )}
            {section.type === "category-carousel" && <CategoryStories />}
            {section.type === "trending-products" && <TrendingSection settings={settings} />}
            {section.type === "spotlight" && <ProductSpotlight />}
            {section.type === "new-arrivals" && <NewArrivals settings={settings} />}
            {section.type === "best-sellers" && <BestSellers settings={settings} />}
            {section.type === "reviews" && <CustomerReviews settings={settings} />}
            {section.type === "trust-pillars" && <TrustSection settings={settings} />}
            {section.type === "newsletter" && <Newsletter />}
            {section.type === "promo-banner" && <PromoBanner settings={settings} />}
            {section.type === "rich-text" && <RichTextSection settings={settings} />}
            {section.type === "faq" && <FaqSection settings={settings} />}
            {section.type === "countdown" && <CountdownSection settings={settings} />}

            {/* Electronics Theme Sections */}
            {section.type === "electronics-hero-bento" && <ElectronicsHeroBento />}
            {section.type === "brand-logos-strip" && <BrandLogosStrip />}
            {section.type === "bestsellers-category-tabs" && <BestsellersCategoryTabs />}
            {section.type === "airpods-promo-banner" && <AirpodsPromoBanner />}
            {section.type === "gaming-spotlight" && <GamingSpotlight />}

            {/* Modern Tech Theme Sections */}
            {section.type === "modern-tech-hero-bento" && <ModernTechHeroBento />}
            {section.type === "round-categories-strip" && <RoundCategoriesStrip />}
            {section.type === "the-best-offers" && <TheBestOffers />}
            {section.type === "nothing-phone-spotlight" && <NothingPhoneSpotlight />}

            {/* Supermarket Mega Theme Sections */}
            {section.type === "supermarket-hero-split" && <SupermarketHeroSplit />}
            {section.type === "grocery-deal-of-the-day" && <GroceryDealOfTheDay />}

            {/* Beauty & Cosmetics Theme Sections */}
            {section.type === "beauty-hero-floral" && <BeautyHeroFloral />}
            {section.type === "beauty-ingredients-3step" && <BeautyIngredients3Step />}
            {section.type === "beauty-bento-collage" && <BeautyBentoCollage />}

            {/* Minimalist Furniture Theme Sections */}
            {section.type === "furniture-hero-mountain" && <FurnitureHeroMountain />}
            {section.type === "furniture-brand-logos" && <FurnitureBrandLogos />}
            {section.type === "furniture-room-categories" && <FurnitureRoomCategories />}

            {/* Fashion & Lifestyle Theme Sections */}
            {section.type === "fashion-hero-editorial" && <FashionHeroEditorial />}
            {section.type === "fashion-gender-tabs" && <FashionGenderTabs />}
          </div>
        );
      })}
    </div>
  );
}
