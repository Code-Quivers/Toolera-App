"use client";

import React, { use } from "react";
import CustomerAccountPage from "@/app/(storefront)/account/page";

interface AccountTabProps {
  params: Promise<{ tab: string }>;
}

export default function AccountDynamicTab({ params }: AccountTabProps) {
  const { tab } = use(params);

  const validTab = (["orders", "addresses", "account", "profile", "wishlist"].includes(tab)
    ? tab === "profile"
      ? "account"
      : tab
    : "dashboard") as "dashboard" | "orders" | "addresses" | "account" | "wishlist";

  return <CustomerAccountPage initialTab={validTab} />;
}
