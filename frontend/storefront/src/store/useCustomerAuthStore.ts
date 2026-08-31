"use client";
// Re-export useCustomerAuth under old store name for backward compatibility
export { useCustomerAuth as useCustomerAuthStore } from "@/hooks/useCustomerAuth";
export type { CustomerUser } from "@/lib/auth";
// CustomerAddress is managed by useCustomerStore
export type { CustomerAddress } from "@/store/useCustomerStore";
