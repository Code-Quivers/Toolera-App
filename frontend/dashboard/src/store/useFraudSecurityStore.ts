"use client";
import { useState, useCallback } from "react";

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

const DEFAULTS: FraudSecuritySettings = {
  autoFlagDuplicates: true,
  duplicateWindowMinutes: 60,
  flagInvalidPhone: true,
  highRiskCodAmount: 5000,
  requireAdvanceForHighRisk: false,
  blacklistedNumbers: [],
};

function load(): FraudSecuritySettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem("rm_fraud_settings");
    return raw ? JSON.parse(raw) : DEFAULTS;
  } catch { return DEFAULTS; }
}

function persist(s: FraudSecuritySettings) {
  if (typeof window !== "undefined") localStorage.setItem("rm_fraud_settings", JSON.stringify(s));
}

export function useFraudSecurityStore() {
  const [state, setState] = useState<FraudSecuritySettings>(load);

  const updateSettings = useCallback((partial: Partial<FraudSecuritySettings>) => {
    setState(prev => { const next = { ...prev, ...partial }; persist(next); return next; });
  }, []);

  const addToBlacklist = useCallback((phone: string, name?: string, reason = "Manual block") => {
    setState(prev => {
      const next = {
        ...prev,
        blacklistedNumbers: [
          ...prev.blacklistedNumbers.filter(b => b.phone !== phone),
          { phone, name, reason, addedAt: new Date().toISOString(), ordersCount: 0 },
        ],
      };
      persist(next);
      return next;
    });
  }, []);

  const removeFromBlacklist = useCallback((phone: string) => {
    setState(prev => {
      const next = { ...prev, blacklistedNumbers: prev.blacklistedNumbers.filter(b => b.phone !== phone) };
      persist(next);
      return next;
    });
  }, []);

  const isBlacklisted = useCallback((phone: string) => state.blacklistedNumbers.some(b => b.phone === phone), [state]);

  return { ...state, updateSettings, addToBlacklist, removeFromBlacklist, isBlacklisted };
}
