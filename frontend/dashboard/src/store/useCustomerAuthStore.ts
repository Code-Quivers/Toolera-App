"use client";
// Customer auth not available in dashboard — stub for storefront layout component imports
import { useState } from "react";

export interface CustomerAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  city: string;
  isDefault?: boolean;
}

export function useCustomerAuthStore() {
  return {
    isAuthenticated: false,
    user: null as any,
    login: async (_e: string, _p: string) => ({ success: false, message: "Not available in dashboard" }),
    logout: () => {},
    register: async () => ({ success: false, message: "Not available in dashboard" }),
  };
}
