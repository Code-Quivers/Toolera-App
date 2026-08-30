"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Flame } from "lucide-react";
import { HeroBannerSlide } from "@/types/banners";

export function HeroSection({ customSlides }: { customSlides?: HeroBannerSlide[] }) {
  const slides = customSlides || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  }, [slides.length]);

  // Autoplay slider every 5 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, slides.length]);

  // Handle touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current || slides.length <= 1) return;
    const diffX = touchStartX.current - touchEndX.current;
    if (diffX > 40) {
      nextSlide();
    } else if (diffX < -40) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (slides.length === 0) {
    return (
      <section className="py-2.5 sm:py-5 bg-slate-50 border-b border-slate-200/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6">
          <div className="relative w-full h-[200px] xs:h-[240px] sm:h-[300px] md:h-[360px] rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-emerald-950 shadow-md border border-slate-800 p-6 sm:p-12 flex flex-col justify-center text-white">
            <div className="max-w-xl space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-bold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>RAIFA&apos;S MART STOREFRONT</span>
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Discover What&apos;s <span className="text-emerald-400">Trending</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Curated unique gadgets, aesthetic lifestyle accessories, and viral finds.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <Link
                  href="/shop"
                  className="px-5 py-2.5 rounded-full bg-[#008B47] hover:bg-[#007a3e] text-white text-xs font-bold transition shadow-md"
                >
                  Explore Catalog →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-2 sm:py-5 bg-slate-50 border-b border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6">
        {/* Responsive Slider Container: Generous 200px-240px height on mobile, 1600x514 ratio on desktop */}
        <div
          className="relative w-full h-[210px] xs:h-[240px] sm:h-auto sm:aspect-[1600/514] min-h-[200px] sm:min-h-[260px] md:min-h-[320px] lg:min-h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 shadow-md sm:shadow-lg border border-slate-200/80 select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Banner Images Carousel */}
          {slides.map((slide, idx) => {
            const isImageOnly =
              slide.slideType === "image-only" ||
              (!slide.title?.trim() && !slide.subtitle?.trim());
            const slideLink = slide.buttonLink || "/shop";

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  currentIndex === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {isImageOnly ? (
                  // Pure Clickable Picture (Full Graphic Banner with High-Definition Cover Fit)
                  <Link
                    href={slideLink}
                    className="absolute inset-0 block w-full h-full cursor-pointer group"
                  >
                    <img
                      src={slide.image}
                      alt={slide.title || "Hero Banner"}
                      className="w-full h-full object-cover object-center group-hover:scale-[1.008] transition-transform duration-700 ease-out"
                    />
                  </Link>
                ) : (
                  // Editorial Slide with Headings, Badges, and Buttons
                  <>
                    <Image
                      src={slide.image}
                      alt={slide.title || "Hero Banner"}
                      fill
                      priority={idx === 0}
                      sizes="(max-width: 1600px) 100vw, 1600px"
                      className="object-cover object-center"
                    />

                    {/* Gradient Overlays for Editorial Readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/70 to-slate-950/20 sm:to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/30" />

                    {/* Content Container */}
                    <div className="h-full px-4 py-4 sm:px-12 lg:px-16 flex flex-col justify-center relative z-20">
                      <div className="max-w-2xl space-y-1.5 sm:space-y-3">
                        {/* Badge / Tag */}
                        {slide.badge && (
                          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] sm:text-xs font-bold backdrop-blur-md shadow-xs">
                            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                            <span>{slide.badge}</span>
                          </div>
                        )}

                        {/* Script / Tagline */}
                        {slide.tagline && (
                          <div className="text-emerald-400 font-serif italic text-xs sm:text-xl tracking-wide">
                            {slide.tagline}
                          </div>
                        )}

                        {/* Big Bold Headline */}
                        <h1 className="text-lg xs:text-xl sm:text-3xl lg:text-5xl font-black tracking-tight uppercase text-white leading-tight font-sans drop-shadow-md">
                          {slide.title}
                          {slide.subtitle && (
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200 text-xs xs:text-sm sm:text-2xl lg:text-3xl mt-0.5 sm:mt-1">
                              {slide.subtitle}
                            </span>
                          )}
                        </h1>

                        {/* Description (Visible on xs+ screens) */}
                        {slide.description && (
                          <p className="hidden xs:block text-[11px] sm:text-sm text-slate-300 max-w-lg font-normal leading-relaxed line-clamp-2 sm:line-clamp-3">
                            {slide.description}
                          </p>
                        )}

                        {/* CTAs */}
                        <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                          {slide.buttonText && (
                            <Link
                              href={slide.buttonLink || "/shop"}
                              className="px-3.5 py-1.5 xs:px-4 xs:py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl bg-[#008B47] hover:bg-[#007a3e] text-white font-black text-[11px] xs:text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                            >
                              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                              <span>{slide.buttonText}</span>
                              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </Link>
                          )}

                          {slide.secondaryButtonText && slide.secondaryButtonLink && (
                            <Link
                              href={slide.secondaryButtonLink}
                              className="px-3 py-1.5 xs:px-3.5 xs:py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-[11px] xs:text-xs sm:text-sm backdrop-blur-md flex items-center justify-center gap-1.5 transition"
                            >
                              <span>{slide.secondaryButtonText}</span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Circular Prev & Next Arrow Buttons (Visible on tablet & desktop) */}
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="hidden sm:flex absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900/70 hover:bg-[#008B47] text-white border border-slate-700/60 backdrop-blur-md items-center justify-center transition-all duration-200 z-30 shadow-lg group active:scale-90"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="hidden sm:flex absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900/70 hover:bg-[#008B47] text-white border border-slate-700/60 backdrop-blur-md items-center justify-center transition-all duration-200 z-30 shadow-lg group active:scale-90"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Dots Indicator */}
          {slides.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30 bg-slate-950/50 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-slate-800/80">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                    currentIndex === i
                      ? "w-5 sm:w-8 bg-[#008B47]"
                      : "w-1.5 sm:w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
