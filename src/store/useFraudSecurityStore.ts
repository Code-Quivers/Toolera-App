"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { OrderItem } from "./useOrderStore";

export interface BlacklistedCustomer {
  phone: string;
  name?: string;
  reason: string;
  addedAt: string;
  ordersCount: number;
}

export interface FraudSecuritySettings {
  autoFlagDuplicates: boolean;
  duplicateWindowMinutes: number;
  flagInvalidPhone: boolean;
  highRiskCodAmount: number;
  requireAdvanceForHighRisk: boolean;
  blacklistedNumbers: BlacklistedCustomer[];
}

interface FraudSecurityStore extends FraudSecuritySettings {
  updateSettings: (partial: Partial<FraudSecuritySettings>) => void;
  addToBlacklist: (phone: string, name?: string, reason?: string) => void;
  removeFromBlacklist: (phone: string) => void;
  isBlacklisted: (phone: string) => boolean;
  evaluateOrderRisk: (order: OrderItem, allOrders: OrderItem[]) => {
    isFake: boolean;
    isHighRisk: boolean;
    riskScore: number;
    riskLevel: "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "FAKE_BLOCKED";
    reasons: string[];
  };
}

const DEFAULT_BLACKLIST: BlacklistedCustomer[] = [
  {
    phone: "01700000000",
    name: "Suspicious User",
    reason: "Repeated fake COD order and phone unreachable",
    addedAt: "2025-05-10T12:00:00Z",
    ordersCount: 3,
  },
  {
    phone: "01811111111",
    name: "Fake COD Buyer",
    reason: "Refused parcel delivery twice with Steadfast courier",
    addedAt: "2025-05-12T14:30:00Z",
    ordersCount: 2,
  },
];

export const useFraudSecurityStore = create<FraudSecurityStore>()(
  persist(
    (set, get) => ({
      autoFlagDuplicates: true,
      duplicateWindowMinutes: 15,
      flagInvalidPhone: true,
      highRiskCodAmount: 4000,
      requireAdvanceForHighRisk: true,
      blacklistedNumbers: DEFAULT_BLACKLIST,

      updateSettings: (partial) => set((state) => ({ ...state, ...partial })),

      addToBlacklist: (phone, name = "Unknown", reason = "Flagged by Admin as Fake Order") => {
        const clean = phone.replace(/[^0-9]/g, "");
        if (!clean) return;
        set((state) => {
          if (state.blacklistedNumbers.some((b) => b.phone === clean)) return state;
          return {
            blacklistedNumbers: [
              {
                phone: clean,
                name,
                reason,
                addedAt: new Date().toISOString(),
                ordersCount: 1,
              },
              ...state.blacklistedNumbers,
            ],
          };
        });
      },

      removeFromBlacklist: (phone) => {
        const clean = phone.replace(/[^0-9]/g, "");
        set((state) => ({
          blacklistedNumbers: state.blacklistedNumbers.filter((b) => b.phone !== clean),
        }));
      },

      isBlacklisted: (phone) => {
        if (!phone) return false;
        const clean = phone.replace(/[^0-9]/g, "");
        return get().blacklistedNumbers.some(
          (b) => b.phone === clean || (clean.length >= 8 && b.phone.endsWith(clean.slice(-8)))
        );
      },

      evaluateOrderRisk: (order, allOrders) => {
        const reasons: string[] = [];
        let score = 0;
        const phone = order.phone ? order.phone.replace(/[^0-9]/g, "") : "";

        // 1. Blacklist check
        if (get().isBlacklisted(phone)) {
          return {
            isFake: true,
            isHighRisk: true,
            riskScore: 100,
            riskLevel: "FAKE_BLOCKED",
            reasons: ["Customer phone number is on the Store Blacklist"],
          };
        }

        // 2. Phone format validation
        if (get().flagInvalidPhone) {
          if (!phone || phone.length !== 11 || !phone.startsWith("01")) {
            reasons.push("Invalid Bangladesh mobile number format (Must be 11 digits starting with 01)");
            score += 45;
          }
        }

        // 3. Duplicate order detection
        if (get().autoFlagDuplicates && phone) {
          const matchingRecent = allOrders.filter((o) => {
            if (o.id === order.id) return false;
            const otherPhone = o.phone ? o.phone.replace(/[^0-9]/g, "") : "";
            return otherPhone === phone;
          });

          if (matchingRecent.length >= 2) {
            reasons.push("Multiple orders (" + (matchingRecent.length + 1) + ") placed from this phone number");
            score += 30;
          }
        }

        // 4. High-value COD order
        const isCOD =
          !order.payment ||
          order.payment.toLowerCase().includes("cash") ||
          order.payment.toLowerCase().includes("cod");
        if (isCOD && Number(order.total) >= get().highRiskCodAmount) {
          reasons.push("High-value Cash on Delivery (৳" + order.total + ") without advance payment");
          score += 25;
        }

        // 5. Courier cancellation history
        const previousCancelled = allOrders.filter(
          (o) => o.id !== order.id && (o.phone ? o.phone.replace(/[^0-9]/g, "") : "") === phone && o.status === "CANCELLED"
        ).length;

        if (previousCancelled > 0) {
          reasons.push("Customer has " + previousCancelled + " previously cancelled/returned consignments");
          score += previousCancelled * 25;
        }

        let riskLevel: "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "FAKE_BLOCKED" = "SAFE";
        if (score >= 70) riskLevel = "HIGH";
        else if (score >= 40) riskLevel = "MEDIUM";
        else if (score >= 20) riskLevel = "LOW";

        return {
          isFake: score >= 75,
          isHighRisk: score >= 40,
          riskScore: Math.min(100, score),
          riskLevel,
          reasons,
        };
      },
    }),
    {
      name: "raifas_mart_fraud_security_v1",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
