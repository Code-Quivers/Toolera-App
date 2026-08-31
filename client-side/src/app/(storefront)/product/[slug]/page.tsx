"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useProductStore } from "@/store/useProductStore";
import { ProductDetailsClient } from "./ProductDetailsClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const { getProductBySlug, products } = useProductStore();

  const product = getProductBySlug(slug) || products.find((p) => p.slug === slug);

  if (!product || product.status === "DRAFT") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-slate-50">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Product Unavailable</h2>
        <p className="text-xs text-slate-500 mb-4">
          This product is currently in draft or has been temporarily unlisted from the store.
        </p>
        <Link
          href="/shop"
          className="px-5 py-2.5 bg-[#008B47] hover:bg-[#007a3e] text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          Browse Active Catalog
        </Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
