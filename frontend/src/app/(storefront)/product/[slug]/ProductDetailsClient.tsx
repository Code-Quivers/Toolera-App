"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, ProductVariant } from "@/types";
import { ExtendedProduct } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { formatPrice, calculateDiscount } from "@/lib/formatters";
import { RatingStars } from "@/components/ui/RatingStars";
import { Badge } from "@/components/ui/Badge";
import { ProductGallery } from "@/components/product/ProductGallery";
import { VariantSelector } from "@/components/product/VariantSelector";
import { ProductCard } from "@/components/product/ProductCard";
import {
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Phone,
  Star,
  ThumbsUp,
  Image as ImageIcon,
  Send,
  Lock,
  AlertCircle,
  Check,
  X,
  Clock,
  MessageCircle,
  Tag,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useReviewStore, ReviewItem } from "@/store/useReviewStore";
import { useCustomerAuthStore } from "@/store/useCustomerAuthStore";
import { PixelEvents } from "@/lib/pixels";
import { useOrderStore } from "@/store/useOrderStore";
import { formatDateTime, formatRelativeTime } from "@/lib/formatters";
import { useShippingSettingsStore } from "@/store/useShippingSettingsStore";

interface ProductDetailsClientProps {
  product: ExtendedProduct;
  relatedProducts: (ExtendedProduct | Product)[];
}

export function ProductDetailsClient({ product, relatedProducts }: ProductDetailsClientProps) {
  const router = useRouter();
  const { addItem, openDrawer } = useCartStore();
  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const { reviews, getProductApprovedReviews, addReview, toggleHelpful, canCustomerReview } = useReviewStore();
  const { customer, orders: customerOrders, isLoggedIn, openAuthModal } = useCustomerAuthStore();
  const { orders } = useOrderStore();
  const {
    showFlashSaleCountdown,
    showBundleDiscounts,
    bundle2Qty = 2,
    bundle2DiscountPercent = 10,
    bundle3Qty = 3,
    bundle3DiscountPercent = 18,
    bundle3FreeDelivery = true,
    flashSaleBannerTitle = "Flash Sale Offer Ending Soon:",
    flashSaleScarcityText = "84% Sold — Limited China Import Stock",
    flashSaleProgressPercent = 84,
    flashSaleSavingsBadge = "AUTO",
    showDeliveryTimeline = true,
    deliveryTimelineTemplate = "TIMELINE_3STEP",
    deliveryTimelineTitle = "Estimated Delivery Timeline",
    deliveryCourierBadgeText = "Steadfast & Pathao Express",
    showSteadfastBadge = true,
    showPathaoBadge = true,
    deliveryDhakaTime = "1–2 Days",
    deliveryOutsideDhakaTime = "2–4 Days",
    showCodTrustBadge = true,
    showReturnTrustBadge = true,
    insideDhakaCost = 70,
    outsideDhakaCost = 130,
  } = useShippingSettingsStore();

  const enableFlashTimer = product.showFlashSaleCountdown !== undefined ? product.showFlashSaleCountdown : (showFlashSaleCountdown ?? true);
  const enableBundles = product.showBundleDiscounts !== undefined ? product.showBundleDiscounts : (showBundleDiscounts ?? true);

  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );

  // Review Form & Verification State
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAuthorName, setReviewAuthorName] = useState(customer?.name || "");
  const [reviewAuthorLocation, setReviewAuthorLocation] = useState(
    customer?.shippingAddress?.city || customer?.billingAddress?.city || "Dhaka"
  );
  const [reviewPhotos, setReviewPhotos] = useState<string[]>([]);
  const [reviewPhotoInput, setReviewPhotoInput] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Manual Order Verification State
  const [manualOrderId, setManualOrderId] = useState("");
  const [manualPhone, setManualPhone] = useState(customer?.phone || "");
  const [manualVerifyChecked, setManualVerifyChecked] = useState(false);
  const [manualVerifySuccess, setManualVerifySuccess] = useState(false);
  const [manualVerifyError, setManualVerifyError] = useState<string | null>(null);

  // Dynamic Approved Reviews Calculation
  const approvedReviews = getProductApprovedReviews(product.slug || product.title);
  const myPendingReviews = React.useMemo(() => {
    return reviews.filter((r) => {
      if (r.status !== "PENDING") return false;
      const matchSlug = r.productSlug && r.productSlug.toLowerCase() === (product.slug || "").toLowerCase();
      const matchTitle = r.productTitle && r.productTitle.toLowerCase() === (product.title || "").toLowerCase();
      const matchId = r.productId && r.productId.toLowerCase() === (product.id || "").toLowerCase();
      return matchSlug || matchTitle || matchId;
    });
  }, [reviews, product]);
  const dynamicRating =
    approvedReviews.length > 0
      ? (approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length).toFixed(1)
      : product.rating.toString();
  const dynamicReviewCount =
    approvedReviews.length > 0 ? approvedReviews.length : product.reviewCount;

  // Auto-fill user info when logged in
  // Dynamic Document Title for SEO & Browser Tab
  React.useEffect(() => {
    if (product?.title) {
      document.title = product.metaTitle || `${product.title} | Raifa's Mart`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          product.metaDescription ||
            product.shortDescription ||
            `Buy ${product.title} online at best price in Bangladesh from Raifa's Mart.`
        );
      }
    }
  }, [product]);

  // Flash Deal Ticking Countdown
  const [countdown, setCountdown] = useState({ hours: 4, minutes: 42, seconds: 18 });
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    if (customer?.name) setReviewAuthorName(customer.name);
    if (customer?.phone) setManualPhone(customer.phone);
    const city = customer?.shippingAddress?.city || customer?.billingAddress?.city;
    if (city) setReviewAuthorLocation(city);
  }, [customer]);

  // Check if customer has purchased this product
  const hasPurchasedFromAccount = React.useMemo(() => {
    return canCustomerReview(product.title, customer?.phone, customerOrders);
  }, [canCustomerReview, product.title, customer?.phone, customerOrders]);

  const isVerifiedPurchaser = hasPurchasedFromAccount || manualVerifySuccess;

  const handleVerifyOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setManualVerifyError(null);
    const cleanPhone = manualPhone.replace(/[^0-9]/g, "");
    const cleanOrder = manualOrderId.trim().toLowerCase();

    if (!cleanPhone && !cleanOrder) {
      setManualVerifyError("Please enter your Phone number or Order ID.");
      return;
    }

    const found = orders.find((o) => {
      const oPhone = (o.phone || "").replace(/[^0-9]/g, "");
      const oId = (o.id || "").toLowerCase();
      const phoneMatch = cleanPhone ? oPhone.includes(cleanPhone) || cleanPhone.includes(oPhone) : true;
      const idMatch = cleanOrder ? oId.includes(cleanOrder) : true;
      const itemMatch = o.items?.some(
        (it) => it.title.toLowerCase().trim() === product.title.toLowerCase().trim()
      );
      return phoneMatch && idMatch && itemMatch;
    });

    setManualVerifyChecked(true);
    if (found) {
      setManualVerifySuccess(true);
      if (found.customer && !reviewAuthorName) setReviewAuthorName(found.customer);
      if (found.district) setReviewAuthorLocation(found.district);
    } else {
      setManualVerifySuccess(false);
      setManualVerifyError(
        "No completed order for this item was found matching those details. Only verified buyers can submit reviews."
      );
    }
  };

  const handleAddPhoto = () => {
    if (reviewPhotoInput.trim()) {
      setReviewPhotos([...reviewPhotos, reviewPhotoInput.trim()]);
      setReviewPhotoInput("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setReviewPhotos((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const now = new Date();
    const formattedNow = formatDateTime(now);

    const newRev: ReviewItem = {
      id: `rev-${Date.now()}`,
      productId: product.id,
      productSlug: product.slug,
      productTitle: product.title,
      productImage: dynamicImages[0] || product.images[0],
      authorName: reviewAuthorName.trim() || customer?.name || "Verified Customer",
      authorPhone: customer?.phone || manualPhone,
      authorLocation: reviewAuthorLocation.trim() || "Dhaka, Bangladesh",
      orderId: manualOrderId.trim() || customerOrders?.[0]?.id || "RM-ONLINE",
      verifiedPurchase: true,
      rating: reviewRating,
      title: reviewTitle.trim() || undefined,
      comment: reviewComment.trim(),
      photos: reviewPhotos.length > 0 ? reviewPhotos : undefined,
      date: formattedNow,
      createdAt: now.toISOString(),
      status: "PENDING", // Strictly pending until admin approves from dashboard
      helpfulCount: 0,
    };

    addReview(newRev);
    setReviewSubmitted(true);
    setIsWritingReview(false);
    setReviewComment("");
    setReviewTitle("");
    setReviewPhotos([]);
  };

  // Initial selected attributes setup
  const initialAttributes = React.useMemo(() => {
    const map: Record<string, string> = {};
    if (product.productAttributes && product.productAttributes.length > 0) {
      if (product.defaultVariationId && product.productVariations) {
        const defaultVar = product.productVariations.find((v) => v.id === product.defaultVariationId);
        if (defaultVar) {
          defaultVar.attributes.forEach((a) => {
            map[a.attributeName] = a.valueName;
          });
          return map;
        }
      }
      product.productAttributes.forEach((attr) => {
        if (attr.usedForVariations && attr.values.length > 0) {
          map[attr.name] = attr.values[0].name;
        }
      });
    }
    return map;
  }, [product]);

  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(initialAttributes);

  // Find active variation matching currently selected attributes
  const activeVariation = React.useMemo(() => {
    if (!product.productVariations || product.productVariations.length === 0) return undefined;
    return product.productVariations.find((v) => {
      if (v.status !== "ACTIVE") return false;
      return v.attributes.every((a) => selectedAttributes[a.attributeName] === a.valueName);
    });
  }, [product.productVariations, selectedAttributes]);

  const handleSelectAttribute = (attrName: string, valueName: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: valueName,
    }));
  };

  // Dynamic gallery images (prepend active variation photo if present)
  const dynamicImages = React.useMemo(() => {
    if (activeVariation?.image) {
      return [activeVariation.image, ...product.images.filter((img) => img !== activeVariation.image)];
    }
    return product.images;
  }, [product.images, activeVariation?.image]);

  const [activeTab, setActiveTab] = useState<"features" | "specs" | "shipping" | "reviews">(
    "features"
  );
  const [added, setAdded] = useState(false);

  const currentPrice = activeVariation
    ? activeVariation.price
    : selectedVariant
    ? selectedVariant.price
    : product.price;

  const comparePrice = activeVariation
    ? activeVariation.compareAtPrice || activeVariation.price
    : selectedVariant?.compareAtPrice || product.compareAtPrice;

  const discount = calculateDiscount(currentPrice, comparePrice);

  const currentStock = activeVariation
    ? activeVariation.stock
    : selectedVariant
    ? selectedVariant.stock
    : product.stock;

  const currentSku = activeVariation
    ? activeVariation.sku || product.sku
    : selectedVariant
    ? selectedVariant.sku
    : product.sku;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    const variantPayload: ProductVariant | undefined = activeVariation
      ? {
          id: activeVariation.id,
          name: activeVariation.attributes.map((a) => a.valueName).join(" / "),
          sku: activeVariation.sku || product.sku,
          price: activeVariation.price,
          compareAtPrice: activeVariation.compareAtPrice,
          stock: activeVariation.stock,
          image: activeVariation.image,
        }
      : selectedVariant;

    addItem(product, quantity, variantPayload);
    setAdded(true);
    PixelEvents.addToCart({
      id: product.id,
      title: product.title,
      price: currentPrice,
      quantity,
      category: product.category,
    });
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    const variantPayload: ProductVariant | undefined = activeVariation
      ? {
          id: activeVariation.id,
          name: activeVariation.attributes.map((a) => a.valueName).join(" / "),
          sku: activeVariation.sku || product.sku,
          price: activeVariation.price,
          compareAtPrice: activeVariation.compareAtPrice,
          stock: activeVariation.stock,
          image: activeVariation.image,
        }
      : selectedVariant;

    addItem(product, quantity, variantPayload);
    PixelEvents.addToCart({
      id: product.id,
      title: product.title,
      price: currentPrice,
      quantity,
      category: product.category,
    });
    router.push("/checkout");
  };

  // Dispatch ViewContent on product load
  React.useEffect(() => {
    if (product && product.id) {
      PixelEvents.viewContent({
        id: product.id,
        title: product.title,
        price: currentPrice,
        category: product.category,
      });
    }
  }, [product.id, currentPrice]);

  return (
    <div className="bg-white min-h-screen py-4 sm:py-10 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-4 sm:mb-6 overflow-x-auto no-scrollbar py-1">
          <Link href="/" className="hover:text-teal-600 shrink-0">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href="/shop" className="hover:text-teal-600 shrink-0">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href={`/category/${product.categorySlug}`} className="hover:text-teal-600 shrink-0">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-slate-900 font-semibold truncate">{product.title}</span>
        </nav>

        {/* Top Product Showcase (Gallery on Left, Info on Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mb-12 sm:mb-16">
          
          {/* Left Column: Image Gallery & Video */}
          <div className="lg:col-span-7">
            <ProductGallery
              images={dynamicImages}
              videoUrl={product.videoUrl}
              videoThumbnail={product.videoThumbnail}
              title={product.title}
            />
          </div>

          {/* Right Column: Product Title, Pricing, Actions */}
          <div className="lg:col-span-5 space-y-5 sm:space-y-6">
            <div>
              {/* Category & Single Primary Badge (Clean & Elegant) */}
              <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                <Link
                  href={`/category/${product.categorySlug}`}
                  className="text-xs font-black text-[#008B47] uppercase tracking-wider hover:underline"
                >
                  {product.category}
                </Link>
                {product.badge ? (
                  <Badge variant="trending">{product.badge}</Badge>
                ) : product.isTrending ? (
                  <Badge variant="trending">🔥 Trending</Badge>
                ) : product.isNewArrival ? (
                  <Badge variant="new">✨ New Arrival</Badge>
                ) : product.isBestSeller ? (
                  <Badge variant="default">⭐ Best Seller</Badge>
                ) : product.isFeatured ? (
                  <Badge variant="hot">⚡ Hot</Badge>
                ) : null}
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.title}
              </h1>

              {/* Rating & In-stock badge */}
              <div className="mt-2.5 flex items-center gap-3">
                <RatingStars rating={Number(dynamicRating)} reviewCount={dynamicReviewCount} size="md" />
                <span className="text-slate-300">|</span>
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {currentStock > 0 ? `In Stock (${currentStock} available)` : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-baseline justify-between">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  {formatPrice(currentPrice)}
                </span>
                {comparePrice > currentPrice && (
                  <span className="text-base text-slate-400 line-through">
                    {formatPrice(comparePrice)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Save {discount}% OFF
                </span>
              )}
            </div>

            {/* Short Narrative */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Variant / Attributes Selector */}
            <VariantSelector
              product={product}
              selectedAttributes={selectedAttributes}
              onSelectAttribute={handleSelectAttribute}
              variants={product.variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />

            {/* Flash Deals Urgency Countdown Banner */}
            {(() => {
              const b2Qty = bundle2Qty || 2;
              const b2Disc = (bundle2DiscountPercent || 10) / 100;
              const buy2Total = Math.round(currentPrice * b2Qty * (1 - b2Disc));
              const buy2Savings = currentPrice * b2Qty - buy2Total;

              const b3Qty = bundle3Qty || 3;
              const b3Disc = (bundle3DiscountPercent || 18) / 100;
              const buy3Total = Math.round(currentPrice * b3Qty * (1 - b3Disc));
              const buy3Savings = currentPrice * b3Qty - buy3Total;
              const maxSavings = Math.max(buy2Savings, buy3Savings);

              return (
                <>
                  {enableFlashTimer && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-300/80 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-slate-900">
                        <span className="flex items-center gap-1.5 text-amber-800">
                          <span className="text-sm">⚡</span>
                          <span>{flashSaleBannerTitle || "Flash Sale Offer Ending Soon:"}</span>
                        </span>
                        <div className="flex items-center gap-1 font-mono text-[11px] font-black text-white">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900">{String(countdown.hours).padStart(2, "0")}h</span>
                          <span className="text-slate-900 font-bold">:</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-900">{String(countdown.minutes).padStart(2, "0")}m</span>
                          <span className="text-slate-900 font-bold">:</span>
                          <span className="px-1.5 py-0.5 rounded bg-rose-600 animate-pulse">{String(countdown.seconds).padStart(2, "0")}s</span>
                        </div>
                      </div>
                      <div className="w-full bg-amber-200/60 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, flashSaleProgressPercent || 84))}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-slate-600">
                        <span>🔥 {flashSaleScarcityText || "84% Sold — Limited China Import Stock"}</span>
                        <span className="text-rose-700 font-black">
                          {flashSaleSavingsBadge && flashSaleSavingsBadge !== "AUTO"
                            ? flashSaleSavingsBadge
                            : maxSavings > 0
                            ? `Save Up to ${formatPrice(maxSavings)} Extra`
                            : "Limited Time Offer"}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Tiered Quantity Bundle Discounts ('Buy More Save More') */}
                  {enableBundles && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Bundle Offers &amp; Multi-Buy Discounts:</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">1-Click Auto Apply</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        {/* 1 Item */}
                        <button
                          type="button"
                          onClick={() => setQuantity(1)}
                          className={`p-2.5 rounded-2xl border text-left transition relative ${
                            quantity === 1
                              ? "bg-emerald-50/70 border-[#008B47] ring-1 ring-[#008B47]"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-[11px] font-black text-slate-900 block">Buy 1 Unit</span>
                          <span className="text-xs font-extrabold text-slate-700 block mt-0.5">{formatPrice(currentPrice)}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">Standard Price</span>
                        </button>

                        {/* Tier 2 Items */}
                        <button
                          type="button"
                          onClick={() => setQuantity(b2Qty)}
                          className={`p-2.5 rounded-2xl border text-left transition relative overflow-hidden ${
                            quantity === b2Qty
                              ? "bg-emerald-50/70 border-[#008B47] ring-1 ring-[#008B47]"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="absolute top-0 right-0 bg-[#008B47] text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase">
                            Save {formatPrice(buy2Savings)}
                          </span>
                          <span className="text-[11px] font-black text-slate-900 block">Buy {b2Qty} Units</span>
                          <span className="text-xs font-extrabold text-[#008B47] block mt-0.5">{formatPrice(buy2Total)}</span>
                          <span className="text-[9px] text-slate-500 line-through block mt-0.5">{formatPrice(currentPrice * b2Qty)}</span>
                        </button>

                        {/* Tier 3 Items */}
                        <button
                          type="button"
                          onClick={() => setQuantity(b3Qty)}
                          className={`p-2.5 rounded-2xl border text-left transition relative overflow-hidden ${
                            quantity === b3Qty
                              ? "bg-emerald-50/70 border-[#008B47] ring-1 ring-[#008B47]"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <span className="absolute top-0 right-0 bg-amber-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase">
                            Save {formatPrice(buy3Savings)}
                          </span>
                          <span className="text-[11px] font-black text-slate-900 block">Buy {b3Qty} Units</span>
                          <span className="text-xs font-extrabold text-amber-700 block mt-0.5">{formatPrice(buy3Total)}</span>
                          <span className="text-[9px] text-emerald-800 font-bold block mt-0.5">
                            {bundle3FreeDelivery ? "+ Free Delivery" : `Save ${bundle3DiscountPercent}%`}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

            {/* Quantity and Wishlist */}
            <div className="flex items-center gap-4 pt-1">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Quantity
                </span>
                <div className="inline-flex items-center border border-slate-200 rounded-xl bg-white shadow-xs">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2.5 text-slate-600 hover:text-slate-900 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-sm text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    className="p-2.5 text-slate-600 hover:text-slate-900 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1 flex-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Save Item
                </span>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    inWishlist
                      ? "bg-rose-50 border-rose-200 text-rose-600"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? "fill-rose-600" : ""}`} />
                  <span>{inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}</span>
                </button>
              </div>
            </div>

            {/* Low-Stock Warning Alert */}
            {currentStock > 0 && currentStock <= 5 && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2 animate-pulse">
                <span className="text-base">🔥</span>
                <span>Hurry! Only {currentStock} items left in stock — selling fast!</span>
              </div>
            )}

            {currentStock <= 0 && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Currently Out of Stock. New shipment arriving soon!</span>
              </div>
            )}

            {/* CTAs (1-Click Express Buy Now + Add to Cart + WhatsApp Order) */}
            <div className="space-y-2.5 pt-2">
              <button
                disabled={currentStock <= 0}
                onClick={handleBuyNow}
                className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20 transition transform active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-5 h-5 text-amber-300" />
                <span>{currentStock > 0 ? "Buy Now — 1-Click Express Checkout" : "Out of Stock"}</span>
              </button>

              <button
                disabled={currentStock <= 0}
                onClick={handleAddToCart}
                className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{currentStock <= 0 ? "Out of Stock" : added ? "Added to Cart!" : "Add to Cart"}</span>
              </button>

              {/* Order via WhatsApp Quick CTA */}
              <button
                type="button"
                onClick={() => {
                  const varText = activeVariation ? ` (${activeVariation.attributes.map((a) => a.valueName).join(", ")})` : "";
                  const msg = `Hi Raifa's Mart, I want to order "${product.title}"${varText} (Qty: ${quantity}, Total: ${formatPrice(currentPrice * quantity)}). Please confirm delivery details.`;
                  window.open(`https://wa.me/8801712345678?text=${encodeURIComponent(msg)}`, "_blank");
                }}
                className="w-full py-3 px-6 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp (Quick Chat)</span>
              </button>
            </div>



            {/* Direct Phone Order Assistance */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Need help placing an order?</span>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s+/g, "")}`}
                className="font-bold text-teal-700 hover:underline flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" /> Call: 01712-345678
              </a>
            </div>

            {/* Product Meta & Tags Footer */}
            <div className="pt-4 mt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-500">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <div>
                  <span className="font-semibold text-slate-700">Category: </span>
                  <Link href={`/category/${product.categorySlug}`} className="text-[#008B47] hover:underline font-bold">
                    {product.category}
                  </Link>
                </div>
                {product.sku && (
                  <div>
                    <span className="font-semibold text-slate-700">SKU: </span>
                    <span className="font-mono text-slate-900 font-bold">{product.sku}</span>
                  </div>
                )}
              </div>

              {/* Clickable Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="font-semibold text-slate-700 mr-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-[#008B47]" /> Tags:
                  </span>
                  {product.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/shop?search=${encodeURIComponent(tag)}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-[#008B47] text-slate-600 text-[11px] font-medium transition cursor-pointer"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Tabbed Content (Features, Specs, Shipping, Reviews) */}
        <div className="mt-12 border-t border-slate-200/80 pt-10">
          
          {/* Tab buttons */}
          <div className="flex gap-2 sm:gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar pb-px">
            {[
              { id: "features", label: "Key Features" },
              { id: "specs", label: "Specifications" },
              { id: "shipping", label: "Delivery & Warranty" },
              { id: "reviews", label: `Reviews (${dynamicReviewCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 transition -mb-px shrink-0 ${
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-900"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="py-8">
            {activeTab === "features" && (
              <div className="space-y-6 max-w-3xl">
                <h3 className="text-lg font-bold text-slate-900">Why You&apos;ll Love This</h3>
                
                {/* Rich HTML / Stylized Narrative */}
                <div
                  className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed [&_h2]:text-base [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-800 [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-slate-900 [&_strong]:font-bold [&_.highlight]:bg-emerald-50 [&_.highlight]:text-[#008B47] [&_.highlight]:px-1.5 [&_.highlight]:py-0.5 [&_.highlight]:rounded"
                  dangerouslySetInnerHTML={{
                    __html: (product.description || product.shortDescription || "Carefully curated for quality, performance, and everyday convenience.")
                      .includes("<")
                      ? product.description
                      : (product.description || product.shortDescription || "")
                          .replace(/\n\n/g, "<br/><br/>")
                          .replace(/\n/g, "<br/>"),
                  }}
                />

                {/* Key Bullet Features */}
                {product.features && product.features.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {product.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs sm:text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-[#008B47] shrink-0 mt-0.5" />
                        <span className="font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "specs" && (
              <div className="max-w-2xl">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Technical Details</h3>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="flex justify-between p-3.5 bg-slate-50 text-xs sm:text-sm">
                    <span className="text-slate-500">SKU</span>
                    <span className="font-semibold text-slate-900">{currentSku}</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-white text-xs sm:text-sm">
                    <span className="text-slate-500">Category</span>
                    <span className="font-semibold text-slate-900">{product.category}</span>
                  </div>
                  {/* Non-variation / Visible Attributes */}
                  {product.productAttributes &&
                    product.productAttributes
                      .filter((attr) => attr.visible && attr.values.length > 0)
                      .map((attr) => (
                        <div key={attr.id || attr.name} className="flex justify-between p-3.5 bg-white text-xs sm:text-sm">
                          <span className="text-slate-500 font-medium">{attr.name}</span>
                          <span className="font-semibold text-slate-900">
                            {attr.values.map((v) => v.name).join(", ")}
                          </span>
                        </div>
                      ))}
                  {product.specifications &&
                    product.specifications.map((spec, i) => (
                      <div key={i} className="flex justify-between p-3.5 bg-slate-50/50 text-xs sm:text-sm">
                        <span className="text-slate-500">{spec.label}</span>
                        <span className="font-semibold text-slate-900">{spec.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="max-w-2xl space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <h3 className="text-lg font-bold text-slate-900">Delivery &amp; Warranty Information</h3>
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="font-bold text-slate-700">Delivery Service:</span>
                    <span className="font-semibold text-slate-900">{product.deliveryType || "Standard Express Delivery"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="font-bold text-slate-700">Inside Dhaka Metro:</span>
                    <span className="font-semibold text-slate-900">{product.customDeliveryInsideDhaka || "৳70 (1–2 Days)"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="font-bold text-slate-700">Outside Dhaka:</span>
                    <span className="font-semibold text-slate-900">{product.customDeliveryOutsideDhaka || "৳130 (2–4 Days)"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="font-bold text-slate-700">Warranty:</span>
                    <span className="font-semibold text-emerald-700">{product.warranty || "7-Day Replacement Warranty"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="font-bold text-slate-700">Return Policy:</span>
                    <span className="font-semibold text-slate-900">{product.returnPolicy || "7-Day Easy Return Guarantee"}</span>
                  </div>
                </div>

                <ul className="space-y-2 list-disc pl-5 text-slate-500">
                  <li>Dispatched from Dhaka Hub with thorough quality testing.</li>
                  <li><strong>Free Delivery:</strong> Applied automatically on any order over ৳2,000.</li>
                  <li><strong>Cash on Delivery (COD):</strong> Open and check parcel upon doorstep arrival.</li>
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-4xl space-y-8">
                {/* 1. Rating Breakdown & Top Summary */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 sm:p-8 bg-slate-50/80 rounded-3xl border border-slate-200/80 items-center">
                  {/* Left: Score & Stars */}
                  <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6 space-y-2">
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                      {dynamicRating}
                    </div>
                    <div className="flex justify-center md:justify-start">
                      <RatingStars rating={Number(dynamicRating)} showValue={false} size="lg" />
                    </div>
                    <div className="text-xs text-slate-500 font-semibold">
                      Based on {dynamicReviewCount} customer review{dynamicReviewCount !== 1 ? "s" : ""}
                    </div>
                    <div className="pt-2 text-[11px] text-emerald-700 font-bold flex items-center justify-center md:justify-start gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>100% Verified Buyer Reviews</span>
                    </div>
                  </div>

                  {/* Middle: Star Distribution Bars */}
                  <div className="md:col-span-5 space-y-1.5 text-xs">
                    {[5, 4, 3, 2, 1].map((starCount) => {
                      const count = approvedReviews.filter((r) => r.rating === starCount).length;
                      const pct =
                        approvedReviews.length > 0 ? (count / approvedReviews.length) * 100 : starCount === 5 ? 85 : starCount === 4 ? 12 : 3;
                      return (
                        <div key={starCount} className="flex items-center gap-2 text-slate-600">
                          <span className="w-12 font-bold flex items-center gap-1 text-[11px]">
                            <span>{starCount}</span>
                            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                          </span>
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${pct}%` }}
                              className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            />
                          </div>
                          <span className="w-8 text-right text-[11px] text-slate-400 font-mono">
                            {approvedReviews.length > 0 ? count : `${Math.round(pct)}%`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Right: Write Review Trigger */}
                  <div className="md:col-span-3 text-center md:text-right space-y-2 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-6">
                    <div className="text-xs font-bold text-slate-900">Have you bought this?</div>
                    <p className="text-[11px] text-slate-500">
                      Share your experience with other shoppers.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsWritingReview(!isWritingReview);
                        setReviewSubmitted(false);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white text-xs font-extrabold transition shadow-sm"
                    >
                      {isWritingReview ? "Cancel Review" : "Write a Review"}
                    </button>
                  </div>
                </div>

                {/* Submission Success Alert */}
                {reviewSubmitted && (
                  <div className="p-5 rounded-3xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 text-xs sm:text-sm font-semibold flex items-start gap-3 shadow-xs animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-extrabold text-emerald-900">
                        Thank You! Your Verified Review Has Been Submitted.
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        To maintain 100% genuine reviews for all shoppers, our team moderates submissions. Once approved by admin, your review will appear live on this product page!
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Review Form / Verification Gate */}
                {isWritingReview && (
                  <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-emerald-500/40 shadow-lg space-y-6 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>Write a Customer Review</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Reviewing &quot;{product.title}&quot;
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsWritingReview(false)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Check if Verified Purchaser */}
                    {!isVerifiedPurchaser ? (
                      <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-4 text-xs">
                        <div className="flex items-start gap-3">
                          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-extrabold text-amber-900 text-sm">
                              Verified Purchase Required
                            </div>
                            <p className="text-amber-800 leading-relaxed">
                              Only customers who have ordered this item can leave a review. Please verify your order below or log in to your account.
                            </p>
                          </div>
                        </div>

                        {/* Order Verification Input Form */}
                        <form onSubmit={handleVerifyOrder} className="space-y-3 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">
                                Phone Number used in Order
                              </label>
                              <input
                                type="tel"
                                placeholder="01XXXXXXXXX"
                                value={manualPhone}
                                onChange={(e) => setManualPhone(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">
                                Order ID (Optional)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. RM-183397-5905"
                                value={manualOrderId}
                                onChange={(e) => setManualOrderId(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                              />
                            </div>
                          </div>

                          {manualVerifyError && (
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-[11px] flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{manualVerifyError}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="submit"
                              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition shadow-2xs"
                            >
                              Verify Purchase &amp; Unlock Form
                            </button>

                            {!isLoggedIn && (
                              <button
                                type="button"
                                onClick={() => openAuthModal("LOGIN")}
                                className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs transition"
                              >
                                Log in with Customer Account
                              </button>
                            )}
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* Verified Purchaser Review Form */
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        {/* Verified Banner */}
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Verified Buyer: Order confirmed for this product!</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 uppercase font-mono">
                            {manualOrderId || customerOrders?.[0]?.id || "VERIFIED"}
                          </span>
                        </div>

                        {/* Interactive Star Rating Selection */}
                        <div className="space-y-1.5">
                          <label className="font-bold text-xs text-slate-700 block">
                            Overall Rating *
                          </label>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => setReviewRating(star)}
                                  className="p-1 text-slate-300 hover:scale-115 transition transform"
                                >
                                  <Star
                                    className={`w-6 h-6 ${
                                      star <= (hoverRating || reviewRating)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-200"
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-700 ml-2">
                              {reviewRating === 5
                                ? "5 - Excellent"
                                : reviewRating === 4
                                ? "4 - Very Good"
                                : reviewRating === 3
                                ? "3 - Good"
                                : reviewRating === 2
                                ? "2 - Fair"
                                : "1 - Poor"}
                            </span>
                          </div>
                        </div>

                        {/* Author Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-xs text-slate-700 block mb-1">
                              Your Name *
                            </label>
                            <input
                              required
                              type="text"
                              placeholder="e.g. Tanvir Ahmed"
                              value={reviewAuthorName}
                              onChange={(e) => setReviewAuthorName(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-xs text-slate-700 block mb-1">
                              Your City / Location
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Dhanmondi, Dhaka"
                              value={reviewAuthorLocation}
                              onChange={(e) => setReviewAuthorLocation(e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>
                        </div>

                        {/* Review Headline & Detailed Comment */}
                        <div className="space-y-1">
                          <label className="font-bold text-xs text-slate-700 block">
                            Review Headline (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Exceeded my expectations!"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-xs text-slate-700 block">
                            Detailed Review *
                          </label>
                          <textarea
                            required
                            rows={3}
                            placeholder="Tell other shoppers what you liked or how you use this product..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>

                        {/* Optional Photos */}
                        <div className="space-y-2">
                          <label className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
                            <span>Add Photos (Optional)</span>
                          </label>

                          <div className="flex items-center gap-2">
                            <label className="cursor-pointer px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 inline-flex items-center gap-1.5 transition">
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>Upload Photo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>

                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="url"
                                placeholder="Or paste image URL..."
                                value={reviewPhotoInput}
                                onChange={(e) => setReviewPhotoInput(e.target.value)}
                                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                              />
                              <button
                                type="button"
                                onClick={handleAddPhoto}
                                className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
                              >
                                Add
                              </button>
                            </div>
                          </div>

                          {/* Photos Preview */}
                          {reviewPhotos.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              {reviewPhotos.map((p, idx) => (
                                <div key={idx} className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 group">
                                  <img src={p} alt="Review upload" className="w-full h-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setReviewPhotos(reviewPhotos.filter((_, i) => i !== idx))}
                                    className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400">
                            Submissions are reviewed by admin for authenticity.
                          </span>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition shadow-sm flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Review for Approval</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* 3. Approved Verified Customer Reviews List */}
                <div className="space-y-4">
                  {/* Pending Reviews Notice (If user has submitted one that is in moderation) */}
                  {myPendingReviews.length > 0 && (
                    <div className="space-y-3">
                      {myPendingReviews.map((pRev) => (
                        <div
                          key={pRev.id}
                          className="p-5 sm:p-6 rounded-3xl bg-amber-50/50 border-2 border-dashed border-amber-300 shadow-xs space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] uppercase flex items-center gap-1.5">
                                <Clock className="w-3 h-3 text-amber-700 animate-spin" style={{ animationDuration: "3s" }} />
                                <span>Pending Admin Moderation</span>
                              </span>
                              <span className="text-[11px] text-amber-800 font-medium">
                                (Visible on your device — will appear live to everyone once approved)
                              </span>
                            </div>
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= pRev.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="text-xs sm:text-sm font-bold text-slate-800">
                            {pRev.title && <div className="text-sm font-extrabold text-slate-900 mb-1">{pRev.title}</div>}
                            <p className="text-slate-700 font-normal">{pRev.comment}</p>
                          </div>

                          {pRev.photos && pRev.photos.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                              {pRev.photos.map((photo, pIdx) => (
                                <div key={pIdx} className="w-14 h-14 rounded-xl overflow-hidden border border-amber-200 shadow-2xs">
                                  <img src={photo} alt="Uploaded review photo" className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <span>Verified Customer Reviews</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        {approvedReviews.length}
                      </span>
                    </h3>
                  </div>

                  {approvedReviews.length > 0 ? (
                    approvedReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3 transition-all hover:border-slate-300"
                      >
                        {/* Top: Customer name, Verified Badge & Stars */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                              {rev.authorName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                                {rev.authorName}
                              </div>
                              {rev.authorLocation && (
                                <div className="text-[11px] text-slate-400">
                                  {rev.authorLocation}
                                </div>
                              )}
                            </div>

                            {rev.verifiedPurchase && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                <span>Verified Purchase</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3.5 h-3.5 ${
                                    star <= rev.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-200"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400 font-medium">{rev.date}</span>
                          </div>
                        </div>

                        {/* Title & Comment */}
                        {rev.title && (
                          <div className="font-extrabold text-sm text-slate-900">{rev.title}</div>
                        )}
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          {rev.comment}
                        </p>

                        {/* Customer Photos */}
                        {rev.photos && rev.photos.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap pt-1">
                            {rev.photos.map((photo, pIdx) => (
                              <a
                                key={pIdx}
                                href={photo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 transition shadow-2xs"
                              >
                                <img src={photo} alt="Customer review photo" className="w-full h-full object-cover hover:scale-105 transition" />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Official Store Response */}
                        {rev.adminReply && (
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-black text-slate-900 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{rev.adminReply.repliedBy || "Raifa's Mart Response"}</span>
                              </span>
                              <span className="text-[10px] text-slate-400">{rev.adminReply.date}</span>
                            </div>
                            <p className="text-slate-600 italic leading-relaxed">{rev.adminReply.comment}</p>
                          </div>
                        )}

                        {/* Helpful Button */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                          <span>Verified Bangladeshi Buyer</span>
                          <button
                            type="button"
                            onClick={() => toggleHelpful(rev.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 font-bold transition"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            <span>Helpful ({rev.helpfulCount || 0})</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center bg-slate-50 rounded-3xl border border-slate-200 space-y-2">
                      <Heart className="w-8 h-8 text-slate-300 mx-auto" />
                      <div className="font-extrabold text-slate-700 text-sm">
                        No approved reviews for this product yet.
                      </div>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Be the first verified customer to share your experience with this item!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Related / Recommended Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                  You May Also Like
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  Related Trending Finds
                </h2>
              </div>
              <Link href="/shop" className="text-xs font-bold text-teal-700 hover:underline">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
