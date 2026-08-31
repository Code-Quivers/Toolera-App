"use client";
import { useState } from "react";

export function useWishlistStore() {
  const [wishlist] = useState<string[]>([]);
  return { wishlist, toggle: (_: string) => {}, isWishlisted: (_: string) => false };
}
