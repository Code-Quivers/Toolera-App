import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

export type StockLogType = "RESTOCK" | "SALE" | "RETURN" | "DAMAGE" | "MANUAL";

export interface StockLogItem {
  id: string;
  productId: string;
  productTitle: string;
  sku?: string;
  previousStock: number;
  newStock: number;
  delta: number; // e.g. +50 or -5
  type: StockLogType;
  costLoss?: number; // monetary loss for DAMAGE/WASTAGE
  note?: string;
  actor: string; // e.g. "Rafiqul Islam (Admin)"
  timestamp: string; // ISO string
}

interface StockLogStoreState {
  logs: StockLogItem[];
  addLog: (log: Omit<StockLogItem, "id" | "timestamp">) => void;
  clearLogs: () => void;
}

const INITIAL_LOGS: StockLogItem[] = [
  {
    id: "log-1",
    productId: "p1",
    productTitle: "Premium Cotton Formal Shirt",
    sku: "RM-SHIRT-01",
    previousStock: 25,
    newStock: 75,
    delta: 50,
    type: "RESTOCK",
    note: "Batch shipment restock from supplier",
    actor: "Rafiqul Islam (Admin)",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log-2",
    productId: "p2",
    productTitle: "Smart Wireless Bluetooth Earbuds",
    sku: "RM-EAR-02",
    previousStock: 40,
    newStock: 38,
    delta: -2,
    type: "SALE",
    note: "Order #RM-8492 dispatch",
    actor: "System Automated",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "log-3",
    productId: "p3",
    productTitle: "Leather Wallet with RFID Blocking",
    sku: "RM-WLT-03",
    previousStock: 20,
    newStock: 19,
    delta: -1,
    type: "DAMAGE",
    costLoss: 650,
    note: "Zipper defect during warehouse inspection",
    actor: "Rafiqul Islam (Admin)",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

function getInitialLogs(): StockLogItem[] {
  if (typeof window === "undefined") return INITIAL_LOGS;
  try {
    const raw = localStorage.getItem("raifas_mart_stock_logs_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.logs && Array.isArray(parsed.state.logs)) {
        return parsed.state.logs;
      }
    }
  } catch {}
  return INITIAL_LOGS;
}

export const useStockLogStore = create<StockLogStoreState>()(
  persist(
    (set) => ({
      logs: getInitialLogs(),

      addLog: (data) => {
        const newEntry: StockLogItem = {
          ...data,
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          logs: [newEntry, ...state.logs],
        }));
      },

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: "raifas_mart_stock_logs_v1",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
