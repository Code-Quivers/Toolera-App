import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailsClient } from "./ProductDetailsClient";
import { fetchProduct, fetchProducts, storeQs } from "@/lib/api/ssr";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product) return { title: "Product Not Found" };

  const image = product.images?.[0] ?? "";
  const title = product.seoTitle || product.title || product.name;
  const description = product.seoDescription || product.shortDescription || `Buy ${title} online.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProduct(slug);

  if (!product || product.status === "DRAFT") notFound();

  const relatedProducts = await fetchProducts(`categorySlug=${product.categorySlug}&limit=4`)
    .then(list => list.filter((p: any) => p.id !== product.id).slice(0, 4));

  return <ProductDetailsClient product={product} relatedProducts={relatedProducts} />;
}
