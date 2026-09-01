"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useProductStore, ExtendedProduct } from "@/store/useProductStore";
import { ProductVariant, ProductType, ProductAttributeConfig, ProductVariationItem } from "@/types";
import { slugify } from "@/lib/utils";
import { formatPrice } from "@/lib/formatters";
import { useCategoryStore } from "@/store/useCategoryStore";
import { MediaLibraryModal } from "@/components/admin/MediaLibraryModal";
import { ProductAttributesVariationsEditor } from "@/components/admin/ProductAttributesVariationsEditor";
import {
  Upload,
  UploadCloud,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  X,
  Tag as TagIcon,
  Check,
  Calendar,
  Truck,
  ShieldCheck,
  Eye,
  Sliders,
  HelpCircle,
} from "lucide-react";

export default function AdminNewProductPage() {
  const router = useRouter();
  const { addProduct } = useProductStore();
  const { categories } = useCategoryStore();

  // Basic Info
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [price, setPrice] = useState<number | string>("");
  const [comparePrice, setComparePrice] = useState<number | string>("");
  const [costPrice, setCostPrice] = useState<number | string>("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState<number | string>("");
  const [shortDesc, setShortDesc] = useState("");
  const [fullDesc, setFullDesc] = useState("");

  // Media
  const [images, setImages] = useState<string[]>([]);
  const [imageInputUrl, setImageInputUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const videoFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDirectVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith("video/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        if (url) setVideoUrl(url);
      };
      reader.readAsDataURL(file);
    }
    if (videoFileInputRef.current) videoFileInputRef.current.value = "";
  };

  // Features & Specs
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureText, setNewFeatureText] = useState("");

  const [specifications, setSpecifications] = useState<{ label: string; value: string }[]>([]);
  const [specLabel, setSpecLabel] = useState("");
  const [specValue, setSpecValue] = useState("");

  // Description Tab
  const [descTab, setDescTab] = useState<"write" | "preview">("write");

  // Attributes & Variations Engine
  const [productType, setProductType] = useState<ProductType>("SIMPLE");
  const [productAttributes, setProductAttributes] = useState<ProductAttributeConfig[]>([]);
  const [productVariations, setProductVariations] = useState<ProductVariationItem[]>([]);
  const [defaultVariationId, setDefaultVariationId] = useState<string | undefined>(undefined);

  // Gallery Multi-File Upload Ref
  const galleryFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDirectGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const url = ev.target?.result as string;
          if (url) setImages((prev) => [...prev, url]);
        };
        reader.readAsDataURL(file);
      }
    });
    if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
  };

  // Sidebar Controls
  const [status, setStatus] = useState<"PUBLISHED" | "DRAFT" | "SCHEDULED">("PUBLISHED");
  const [publishDate, setPublishDate] = useState("");
  const [badgeNew, setBadgeNew] = useState(false);
  const [badgeTrending, setBadgeTrending] = useState(false);
  const [badgeBestSeller, setBadgeBestSeller] = useState(false);
  const [badgeFeatured, setBadgeFeatured] = useState(false);
  const [badgeOnSale, setBadgeOnSale] = useState(false);
  const [showFlashSaleCountdown, setShowFlashSaleCountdown] = useState(true);
  const [showBundleDiscounts, setShowBundleDiscounts] = useState(true);

  // SEO & Delivery
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [deliveryType, setDeliveryType] = useState("Standard Delivery");
  const [deliveryChargeInside, setDeliveryChargeInside] = useState("70");
  const [deliveryChargeOutside, setDeliveryChargeOutside] = useState("130");
  const [warranty, setWarranty] = useState("7-Day Replacement Warranty");
  const [returnPolicy, setReturnPolicy] = useState("7-Day Easy Return");
  const [notification, setNotification] = useState<string | null>(null);

  // Auto-slug generator
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(val));
    }
  };

  // Tags
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Images
  const handleAddImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageInputUrl.trim()) return;
    setImages([...images, imageInputUrl.trim()]);
    setImageInputUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Features
  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFeatures([...features, newFeatureText.trim()]);
    setNewFeatureText("");
  };

  // Specs
  const handleAddSpec = () => {
    if (!specLabel.trim() || !specValue.trim()) return;
    setSpecifications([...specifications, { label: specLabel.trim(), value: specValue.trim() }]);
    setSpecLabel("");
    setSpecValue("");
  };

  const [isSaving, setIsSaving] = useState(false);

  // Upload any local device images (base64) to MinIO, return array of CDN URLs
  const uploadLocalImages = async (imgs: string[]): Promise<string[]> => {
    const results: string[] = [];
    for (const img of imgs) {
      if (!img.startsWith("data:")) {
        results.push(img); // already a URL
        continue;
      }
      try {
        const blob = await fetch(img).then(r => r.blob());
        const form = new FormData();
        form.append("image", blob, `product-${Date.now()}.jpg`);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/upload/single`, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("rm_admin_token") || ""}` },
          body: form,
        }).then(r => r.json());
        if (res?.data?.url) results.push(res.data.url);
      } catch { /* skip failed uploads */ }
    }
    return results;
  };

  // Save / Publish
  const handleSave = async (publishStatus: "PUBLISHED" | "DRAFT") => {
    if (!title.trim()) {
      alert("Please enter a product title");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);

    try {
      const finalSlug = slug || slugify(title);
      const primaryBadge = badgeNew
        ? "NEW"
        : badgeTrending
        ? "TRENDING"
        : badgeBestSeller
        ? "BEST SELLER"
        : badgeFeatured
        ? "HOT"
        : badgeOnSale
        ? "SALE"
        : undefined;

      const selectedCat = category || (categories[0]?.name ?? "General");
      const catObj = categories.find((c) => c.name.toLowerCase() === selectedCat.toLowerCase());
      const catSlug = catObj?.slug || slugify(selectedCat);

      // Upload local device images to MinIO before saving
      const resolvedImages = await uploadLocalImages(
        images.length > 0 ? images : []
      );

      const newProduct: ExtendedProduct = {
        id: `prod-${Date.now()}`,
        title,
        slug: finalSlug,
        category: selectedCat,
        categorySlug: catSlug,
        price: Number(price) || 0,
        compareAtPrice: Number(comparePrice) || Number(price) || 0,
        costPrice: Number(costPrice) || 0,
        sku: sku || `RM-${Math.floor(1000 + Math.random() * 9000)}`,
        stock: Number(stock) || 0,
        shortDescription: shortDesc,
        description: fullDesc,
        images: resolvedImages,
        videoUrl: videoUrl.trim() || undefined,
        videoThumbnail: videoThumbnail.trim() || undefined,
        badge: primaryBadge as any,
        tags,
        rating: 5.0,
        reviewCount: 0,
        isTrending: badgeTrending,
        isNewArrival: badgeNew,
        isBestSeller: badgeBestSeller,
        isFeatured: badgeFeatured,
        isOnSale: badgeOnSale,
        status: publishStatus,
        publishDate,
        features,
        specifications,
        productType,
        productAttributes: productType === "VARIABLE" ? productAttributes : undefined,
        productVariations: productType === "VARIABLE" ? productVariations : undefined,
        defaultVariationId: productType === "VARIABLE" ? defaultVariationId : undefined,
        deliveryType,
        customDeliveryInsideDhaka: `৳${deliveryChargeInside} (1–2 Days)`,
        customDeliveryOutsideDhaka: `৳${deliveryChargeOutside} (2–4 Days)`,
        warranty,
        returnPolicy,
        showFlashSaleCountdown,
        showBundleDiscounts,
        seoTitle: seoTitle || `${title} | Toolera`,
        seoDescription: seoDescription || shortDesc,
      };

      await addProduct(newProduct);
      setNotification(publishStatus === "PUBLISHED" ? "Product published successfully to live store!" : "Product draft saved!");

      setTimeout(() => {
        router.push("/admin/products");
      }, 1200);
    } catch (err: any) {
      alert(`Failed to save product: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Price discount calculator
  const savingsPct =
    Number(comparePrice) > Number(price)
      ? Math.round(((Number(comparePrice) - Number(price)) / Number(comparePrice)) * 100)
      : 0;

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/admin/products" className="hover:text-emerald-700 font-medium">
              Products
            </Link>
            <span>›</span>
            <span className="text-slate-700 font-semibold">Add New Product</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Add New Product
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create a new product and add all the details below.
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleSave("DRAFT")}
            disabled={isSaving}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSave("PUBLISHED")}
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>{isSaving ? "Saving..." : "Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Two Column Layout (70% Main Form / 30% Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================== */}
        {/* MAIN COLUMN (70% - 8 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Basic Information Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Product Title */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wireless RGB Magnetic Desk Lamp"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Category *</label>
                  <Link
                    href="/admin/categories"
                    className="text-[11px] font-bold text-emerald-700 hover:underline"
                  >
                    + Manage Categories
                  </Link>
                </div>
                {categories.length === 0 ? (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs">
                    <p className="font-bold">No categories created yet.</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Please{" "}
                      <Link href="/admin/categories" className="underline font-bold text-emerald-800">
                        create a category in Category Manager
                      </Link>{" "}
                      first.
                    </p>
                  </div>
                ) : (
                  <select
                    value={category || (categories[0]?.name ?? "")}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium cursor-pointer"
                  >
                    <option value="" disabled>
                      Select a Category
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Product Slug */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Product Slug *</label>
                <input
                  type="text"
                  placeholder="e.g. wireless-rgb-magnetic-desk-lamp"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                />
                <span className="text-[11px] text-slate-400 block">
                  Live URL: <code className="text-emerald-700 font-mono">/product/{slug || "your-product-slug"}</code>
                </span>
              </div>

              {/* Tags Chip Input */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Tags</label>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center gap-1.5 min-h-[42px]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-100/70 text-emerald-800 text-[11px] font-bold"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-rose-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="Type tag & press Enter..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    className="flex-1 bg-transparent border-0 text-slate-900 text-xs focus:outline-none min-w-[120px]"
                  />
                </div>
              </div>
            </div>

            {/* Pricing & SKU Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-2">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Sale Price (BDT) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Buying / COGS (BDT)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    placeholder="Wholesale/Import"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Compare Price (BDT)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">৳</span>
                  <input
                    type="number"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">SKU</label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {Number(price) > 0 && Number(costPrice) > 0 && (
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-semibold flex items-center justify-between border border-emerald-200">
                <span>Estimated Net Margin Per Unit: <strong>{formatPrice(Number(price) - Number(costPrice))}</strong></span>
                <span className="px-2 py-0.5 rounded bg-emerald-700 text-white text-[10px] font-bold">
                  {Math.round(((Number(price) - Number(costPrice)) / Number(price)) * 100)}% Margin
                </span>
              </div>
            )}

            {savingsPct > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-between border border-slate-200">
                <span>Customer Price Preview: <strong>{formatPrice(Number(price))}</strong> (Original: <span className="line-through">{formatPrice(Number(comparePrice))}</span>)</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-white text-[10px] font-bold">Save {savingsPct}%</span>
              </div>
            )}

            {/* Short Summary Description */}
            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between font-bold text-slate-700">
                <label>Short Summary Description</label>
                <span className="text-[11px] text-slate-400 font-normal">{shortDesc.length}/160</span>
              </div>
              <input
                type="text"
                maxLength={160}
                placeholder="1-2 sentences highlighting the main benefit for customers..."
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Full Description Rich Text Box with Live Preview */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-700">
                <label>Full Product Description &amp; Highlights</label>
                <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDescTab("write")}
                    className={`px-2.5 py-1 rounded-md transition font-bold ${
                      descTab === "write" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    ✏️ Edit / Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setDescTab("preview")}
                    className={`px-2.5 py-1 rounded-md transition font-bold ${
                      descTab === "preview" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    👁️ Live Preview
                  </button>
                </div>
              </div>

              {descTab === "write" ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 focus-within:bg-white focus-within:border-emerald-600 transition">
                  {/* Rich Styling Toolbar */}
                  <div className="p-2 border-b border-slate-200 bg-slate-100/80 flex flex-wrap items-center gap-1.5 text-slate-600 text-xs">
                    <button
                      type="button"
                      onClick={() => setFullDesc((prev) => prev + "\n## Heading 2\n")}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-bold"
                    >
                      H2 Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => setFullDesc((prev) => prev + "\n### Subheading 3\n")}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-bold"
                    >
                      H3 Subheading
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setFullDesc((prev) => prev + " **bold text** ")}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-200 font-black text-[11px]"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => setFullDesc((prev) => prev + " *italic text* ")}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-200 italic font-serif text-[11px]"
                    >
                      I
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setFullDesc((prev) => prev + "\n- Fast 30W charging output\n- Smart temperature control\n- Ultra-compact portable build\n")}
                      className="px-2 py-1 rounded bg-white hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-medium"
                    >
                      • Bullet List
                    </button>
                    <button
                      type="button"
                      onClick={() => setFullDesc((prev) => prev + ' <span class="highlight">🔥 Highlight</span> ')}
                      className="px-2 py-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300 text-[11px] font-bold"
                    >
                      ✨ Green Badge
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Write or paste your product description. You can use Headings, bullet lists, bold text, or HTML formatting..."
                    value={fullDesc}
                    onChange={(e) => setFullDesc(e.target.value)}
                    className="w-full p-3.5 bg-transparent border-0 text-slate-900 text-xs focus:outline-none leading-relaxed font-sans"
                  />
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-slate-200 bg-white min-h-[140px] text-xs">
                  <div
                    className="prose prose-slate max-w-none leading-relaxed text-slate-700 space-y-2 [&_h2]:text-sm [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-slate-800 [&_ul]:list-disc [&_ul]:pl-4 [&_strong]:text-slate-900 [&_strong]:font-bold [&_.highlight]:bg-emerald-50 [&_.highlight]:text-[#008B47] [&_.highlight]:px-1.5 [&_.highlight]:py-0.5 [&_.highlight]:rounded"
                    dangerouslySetInnerHTML={{
                      __html: fullDesc
                        ? fullDesc.includes("<")
                          ? fullDesc
                          : fullDesc.replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>")
                        : "<span class='text-slate-400 italic'>No description entered yet. Switch to Edit tab to write.</span>",
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 2. Product Images Card with Media Library */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Product Images</h2>
                <p className="text-xs text-slate-500">Upload multiple high-quality photos or select from Media Library</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>+ Open Media Library</span>
                </button>
                <span className="text-xs text-slate-400 font-semibold">{images.length} added</span>
              </div>
            </div>

            {/* Hidden Direct Multi-File Input */}
            <input
              type="file"
              multiple
              accept="image/*"
              ref={galleryFileInputRef}
              onChange={handleDirectGalleryUpload}
              className="hidden"
            />

            {/* Direct Multi-File Dropzone Opening File Picker */}
            <div
              onClick={() => galleryFileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#008B47] bg-slate-50/50 hover:bg-emerald-50/20 transition cursor-pointer flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-[#008B47] group-hover:scale-110 transition transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="text-center">
                <div className="font-bold text-slate-800 text-xs group-hover:text-[#008B47] transition">
                  Click to select multiple photos from device or drop files here
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Hold Ctrl / Shift to select multiple images simultaneously
                </div>
              </div>
            </div>

            {/* Or Paste Image URL */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                placeholder="Or paste direct image URL (Unsplash or CDN link)..."
                value={imageInputUrl}
                onChange={(e) => setImageInputUrl(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={(e) => handleAddImage(e)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add URL</span>
              </button>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group shadow-2xs"
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#008B47] text-white text-[9px] font-bold shadow-xs">
                      PRIMARY
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Media Modal */}
            <MediaLibraryModal
              isOpen={isMediaModalOpen}
              multiple={true}
              onClose={() => setIsMediaModalOpen(false)}
              onSelect={(selectedUrl) => {
                setImages((prev) => [...prev, selectedUrl]);
              }}
              onSelectMultiple={(selectedUrls) => {
                setImages((prev) => [...prev, ...selectedUrls]);
              }}
              title="Select or Upload Product Photo(s)"
              buttonLabel="Insert into Product"
              recommendedDimensions="1024x1024 px Square Photo"
            />
          </div>

          {/* 2.5 Product Video (MP4 / WebM / YouTube / Vimeo) Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Product Video</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#008B47] text-[10px] font-bold">
                    Gallery Feature
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Upload an MP4/WebM video or paste a YouTube / Vimeo link to display alongside product photos
                </p>
              </div>
              {videoUrl && (
                <button
                  type="button"
                  onClick={() => setVideoUrl("")}
                  className="text-xs text-rose-600 hover:underline font-bold"
                >
                  Remove Video
                </button>
              )}
            </div>

            {/* Hidden Video File Input */}
            <input
              type="file"
              accept="video/mp4,video/webm,video/ogg"
              ref={videoFileInputRef}
              onChange={handleDirectVideoUpload}
              className="hidden"
            />

            {!videoUrl ? (
              <div className="space-y-3">
                {/* Dropzone / Upload Button */}
                <div
                  onClick={() => videoFileInputRef.current?.click()}
                  className="p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#008B47] bg-slate-50/50 hover:bg-emerald-50/20 transition cursor-pointer flex flex-col items-center justify-center gap-1.5 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-[#008B47] group-hover:scale-110 transition transform">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-slate-800 text-xs group-hover:text-[#008B47] transition">
                      Click to upload MP4 / WebM video from device
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Recommended: High quality 1080p clip under 30MB
                    </div>
                  </div>
                </div>

                {/* Or Paste Video URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Or paste YouTube, Vimeo, or direct MP4 link (e.g. https://www.youtube.com/watch?v=...)"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Video thumbnail image URL (optional)"
                    value={videoThumbnail}
                    onChange={(e) => setVideoThumbnail(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:bg-white focus:outline-none focus:border-[#008B47]"
                  />
                </div>
              </div>
            ) : (
              /* Video Preview Box */
              <div className="p-4 rounded-2xl bg-slate-900/5 border border-slate-200 space-y-3">
                <div className="relative aspect-video max-w-md mx-auto rounded-xl overflow-hidden bg-black shadow-md">
                  {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
                    <iframe
                      src={
                        videoUrl.includes("embed")
                          ? videoUrl
                          : `https://www.youtube.com/embed/${
                              videoUrl.includes("youtu.be/")
                                ? videoUrl.split("youtu.be/")[1]?.split("?")[0]
                                : videoUrl.split("v=")[1]?.split("&")[0]
                            }`
                      }
                      title="Product Video Preview"
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-600 font-mono text-[11px] truncate max-w-sm">
                    {videoUrl.startsWith("data:") ? "Local Uploaded Video (Ready to save)" : videoUrl}
                  </span>
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className="text-[#008B47] hover:underline font-bold cursor-pointer"
                  >
                    Replace Video
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Product Attributes & Variations Engine */}
          <ProductAttributesVariationsEditor
            productType={productType}
            setProductType={setProductType}
            basePrice={Number(price) || 0}
            baseComparePrice={Number(comparePrice) || Number(price) || 0}
            baseStock={Number(stock) || 0}
            baseSku={sku || `RM-${Math.floor(1000 + Math.random() * 9000)}`}
            attributes={productAttributes}
            setAttributes={setProductAttributes}
            variations={productVariations}
            setVariations={setProductVariations}
            defaultVariationId={defaultVariationId}
            setDefaultVariationId={setDefaultVariationId}
          />


          {/* 4. Key Features Builder */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Key Features List
            </h2>

            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 text-xs pt-1">
              <input
                type="text"
                placeholder="Add another key feature benefit..."
                value={newFeatureText}
                onChange={(e) => setNewFeatureText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition"
              >
                + Add Feature
              </button>
            </div>
          </div>

          {/* 5. Product Specifications Table */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Technical Specifications Table
            </h2>

            <div className="divide-y divide-slate-100 text-xs">
              {specifications.map((spec, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between gap-4">
                  <div className="w-1/3 font-bold text-slate-700">{spec.label}</div>
                  <div className="w-2/3 text-slate-900">{spec.value}</div>
                  <button
                    type="button"
                    onClick={() => setSpecifications(specifications.filter((_, i) => i !== idx))}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs pt-2">
              <input
                type="text"
                placeholder="Spec Name (e.g. Battery)"
                value={specLabel}
                onChange={(e) => setSpecLabel(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
              <input
                type="text"
                placeholder="Spec Value (e.g. 2000 mAh)"
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                className="sm:col-span-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
              />
              <button
                type="button"
                onClick={handleAddSpec}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl"
              >
                + Add Row
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SIDEBAR COLUMN (30% - 4 cols) */}
        {/* ============================================================== */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Product Status */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Product Status
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="PUBLISHED"
                  checked={status === "PUBLISHED"}
                  onChange={() => setStatus("PUBLISHED")}
                  className="w-4 h-4 text-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-800">Publish</span>
                  <div className="text-[11px] text-slate-400">Make this product visible to everyone</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="DRAFT"
                  checked={status === "DRAFT"}
                  onChange={() => setStatus("DRAFT")}
                  className="w-4 h-4 text-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-800">Draft</span>
                  <div className="text-[11px] text-slate-400">Save as draft, not visible to customers</div>
                </div>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="SCHEDULED"
                  checked={status === "SCHEDULED"}
                  onChange={() => setStatus("SCHEDULED")}
                  className="w-4 h-4 text-emerald-600"
                />
                <div>
                  <span className="font-bold text-slate-800">Schedule</span>
                  <div className="text-[11px] text-slate-400">Publish at a specific date and time</div>
                </div>
              </label>

              {status === "SCHEDULED" && (
                <div className="mt-2 space-y-1">
                  <label className="font-bold text-slate-700 text-xs">Publish Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Product Badges */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Product Badges
            </h3>

            <div className="space-y-2.5 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={badgeNew}
                  onChange={(e) => setBadgeNew(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="font-semibold">New Arrival</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={badgeTrending}
                  onChange={(e) => setBadgeTrending(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="font-semibold text-emerald-700">Trending</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={badgeBestSeller}
                  onChange={(e) => setBadgeBestSeller(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="font-semibold">Best Seller</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={badgeFeatured}
                  onChange={(e) => setBadgeFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="font-semibold">Featured</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={badgeOnSale}
                  onChange={(e) => setBadgeOnSale(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <span className="font-semibold">On Sale</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-400">Select badges to highlight this product on the storefront.</p>
          </div>

          {/* Card 3: Conversion & Marketing Widgets */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Conversion &amp; Marketing Widgets
            </h3>

            <div className="space-y-3 text-xs text-slate-700">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFlashSaleCountdown}
                  onChange={(e) => setShowFlashSaleCountdown(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900">Flash Sale Urgency Timer</span>
                  <div className="text-[11px] text-slate-400">Show countdown bar above Buy Now</div>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showBundleDiscounts}
                  onChange={(e) => setShowBundleDiscounts(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 mt-0.5"
                />
                <div>
                  <span className="font-bold text-slate-900">Tiered Multi-Buy Bundles</span>
                  <div className="text-[11px] text-slate-400">Show Buy 2 / Buy 3 discount cards</div>
                </div>
              </label>
            </div>
          </div>

          {/* Card 4: Delivery & Fulfillment */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              Delivery &amp; Fulfillment
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Delivery Type</label>
                <select
                  value={deliveryType}
                  onChange={(e) => setDeliveryType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium cursor-pointer"
                >
                  <option value="Standard Delivery">Standard Delivery</option>
                  <option value="Express Next-Day">Express Next-Day</option>
                  <option value="Free Delivery">Free Delivery</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Inside Dhaka (৳)</label>
                  <input
                    type="number"
                    value={deliveryChargeInside}
                    onChange={(e) => setDeliveryChargeInside(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Outside Dhaka (৳)</label>
                  <input
                    type="number"
                    value={deliveryChargeOutside}
                    onChange={(e) => setDeliveryChargeOutside(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Warranty Policy</label>
                <input
                  type="text"
                  placeholder="e.g. 7-Day Replacement Warranty"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Return Policy</label>
                <input
                  type="text"
                  placeholder="e.g. 7-Day Easy Return"
                  value={returnPolicy}
                  onChange={(e) => setReturnPolicy(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Card 4: SEO Settings */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
              SEO Settings
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <label>Meta Title</label>
                  <span className="text-[10px] text-slate-400 font-normal">{seoTitle.length}/60</span>
                </div>
                <input
                  type="text"
                  placeholder="SEO title for search engines"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-slate-700">
                  <label>Meta Description</label>
                  <span className="text-[10px] text-slate-400 font-normal">{seoDescription.length}/160</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Brief description for search engine snippets"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
