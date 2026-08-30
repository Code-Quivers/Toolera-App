"use client";

import React, { use } from "react";
import CustomerAccountPage from "@/app/(storefront)/account/page";

interface MyAccountTabProps {
  params: Promise<{ tab: string }>;
}

export default function MyAccountDynamicTab({ params }: MyAccountTabProps) {
  const { tab } = use(params);

  const validTab = (["orders", "addresses", "account", "profile", "wishlist"].includes(tab)
    ? tab === "profile"
      ? "account"
      : tab
    : "dashboard") as "dashboard" | "orders" | "addresses" | "account" | "wishlist";

  return <CustomerAccountPage initialTab={validTab} />;
}
