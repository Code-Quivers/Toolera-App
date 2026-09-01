import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { ChevronRight, Sparkles } from "lucide-react";
import { fetchCategory, fetchProducts } from "@/lib/api/ssr";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await fetchCategory(slug);

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} — Shop All`,
    description: category.description || `Shop all ${category.name} products.`,
    openGraph: {
      title: category.name,
      description: category.description || `Browse ${category.name} products.`,
      images: category.image ? [{ url: category.image }] : [],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, categoryProducts] = await Promise.all([
    fetchCategory(slug),
    fetchProducts(`categorySlug=${slug}&status=PUBLISHED`),
  ]);

  if (!category) notFound();

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-teal-600">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold">{category.name}</span>
        </div>

        {/* Category Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 text-white p-8 sm:p-12 mb-10 border border-slate-800 shadow-xl">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-teal-400 text-xs font-semibold border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Category Spotlight</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm text-slate-300 leading-relaxed">{category.description}</p>
            )}
            <div className="text-xs text-teal-300 font-medium pt-2">
              Showing {categoryProducts.length} curated products
            </div>
          </div>

          {category.image && (
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-30 lg:opacity-50 pointer-events-none">
              <Image src={category.image} alt={category.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            </div>
          )}
        </div>

        {/* Products Grid */}
        {categoryProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">No products in this category yet</h3>
            <p className="text-xs text-slate-500 mt-1">We are constantly adding new products.</p>
            <Link href="/shop" className="mt-4 inline-block px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold">
              Explore All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {categoryProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
