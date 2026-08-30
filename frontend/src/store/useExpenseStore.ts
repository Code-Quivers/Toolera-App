import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

export type ExpenseCategory =
  | "Shop Rent"
  | "Marketing & Ads"
  | "Packaging Materials"
  | "Staff Salary"
  | "Delivery & Courier Fee"
  | "Utilities & Internet"
  | "Office & Store Supplies"
  | "Maintenance & Repairs"
  | "Other";

export interface ExpenseItem {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: "CASH" | "BANK" | "BKASH" | "NAGAD" | "CARD";
  referenceNumber?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
}

interface ExpenseStoreState {
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, "id" | "createdAt">) => void;
  updateExpense: (id: string, updated: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;
  getTotalExpenses: (startDate?: string, endDate?: string) => number;
  getExpensesByCategory: (startDate?: string, endDate?: string) => Record<string, number>;
}

const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-1",
    title: "Facebook Ads Campaign - Eid Special",
    category: "Marketing & Ads",
    amount: 6500,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "CARD",
    referenceNumber: "TXN-FB-9821",
    notes: "Ad set target: Dhaka & Chittagong 18-35",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-2",
    title: "Poly Packaging Bags (500 pcs)",
    category: "Packaging Materials",
    amount: 1850,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "BKASH",
    referenceNumber: "TRX-PKG-3312",
    notes: "Printed customized poly bags",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-3",
    title: "High Speed Fiber Internet Bill",
    category: "Utilities & Internet",
    amount: 1200,
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "NAGAD",
    referenceNumber: "BILL-NET-4401",
    notes: "Monthly office fiber line",
    createdAt: new Date().toISOString(),
  },
  {
    id: "exp-4",
    title: "Delivery Dispatch Runner Allowance",
    category: "Delivery & Courier Fee",
    amount: 2500,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    paymentMethod: "CASH",
    notes: "Weekly runner transit allowance",
    createdAt: new Date().toISOString(),
  },
];

function getInitialExpenses(): ExpenseItem[] {
  if (typeof window === "undefined") return INITIAL_EXPENSES;
  try {
    const raw = localStorage.getItem("raifas_mart_expenses_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.expenses && Array.isArray(parsed.state.expenses)) {
        return parsed.state.expenses;
      }
    }
  } catch {}
  return INITIAL_EXPENSES;
}

export const useExpenseStore = create<ExpenseStoreState>()(
  persist(
    (set, get) => ({
      expenses: getInitialExpenses(),

      addExpense: (data) => {
        const newExpense: ExpenseItem = {
          ...data,
          id: `exp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));
      },

      updateExpense: (id, updated) => {
        set((state) => ({
          expenses: state.expenses.map((exp) => (exp.id === id ? { ...exp, ...updated } : exp)),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((exp) => exp.id !== id),
        }));
      },

      getTotalExpenses: (startDate, endDate) => {
        const { expenses } = get();
        return expenses
          .filter((e) => {
            if (startDate && e.date < startDate) return false;
            if (endDate && e.date > endDate) return false;
            return true;
          })
          .reduce((acc, curr) => acc + curr.amount, 0);
      },

      getExpensesByCategory: (startDate, endDate) => {
        const { expenses } = get();
        const filtered = expenses.filter((e) => {
          if (startDate && e.date < startDate) return false;
          if (endDate && e.date > endDate) return false;
          return true;
        });

        const categoryMap: Record<string, number> = {};
        filtered.forEach((exp) => {
          categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
        });
        return categoryMap;
      },
    }),
    {
      name: "raifas_mart_expenses_v1",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
