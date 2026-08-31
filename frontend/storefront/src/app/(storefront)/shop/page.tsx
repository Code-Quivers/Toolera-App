import type { Metadata } from "next";
import ShopContentWrapper from "./ShopContent";

export const metadata: Metadata = {
  title: "Shop — Explore All Products",
  description:
    "Browse our full collection of China trendy products, lifestyle gadgets, beauty essentials, and more. Filter by category, price, and rating.",
  openGraph: {
    title: "Shop — Explore All Products",
    description:
      "Browse our full collection of China trendy products, lifestyle gadgets, beauty essentials, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop — Explore All Products",
    description: "Browse curated China products with filters for category, price, and rating.",
  },
};

export default function ShopPage() {
  return <ShopContentWrapper />;
}
