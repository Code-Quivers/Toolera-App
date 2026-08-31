import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailsClient } from "./ProductDetailsClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Props {
  params: Promise<{ slug: string }>;
}

async function fetchProduct(slug: string) {
  try {
    const res = await fetch(`${API}/api/v1/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? json ?? null;
  } catch {
    return null;
  }
}

async function fetchRelated(categorySlug: string, excludeId: string) {
  try {
    const res = await fetch(
      `${API}/api/v1/products?categorySlug=${categorySlug}&limit=4`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    const items = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
    return items.filter((p: any) => p.id !== excludeId).slice(0, 4);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  const image = product.images?.[0] ?? product.thumbnail ?? "";
  const title = product.seoTitle || product.name;
  const description = product.seoDescription || product.description || `Buy ${product.name} online.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: product.name }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product || product.status === "DRAFT") {
    notFound();
  }

  const relatedProducts = await fetchRelated(product.categorySlug ?? "", product.id);

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
