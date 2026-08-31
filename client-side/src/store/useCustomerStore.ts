import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { idbStorage } from "@/lib/idbStorage";

export interface CustomerLedgerEntry {
  id: string;
  date: string;
  type: "DUE_ADDED" | "PAYMENT_RECEIVED";
  amount: number;
  paymentMethod?: string;
  orderId?: string;
  note?: string;
}

export interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  address: string;
  ordersCount: number;
  totalSpent: number;
  dueBalance: number; // Customer unpaid due balance
  creditLimit?: number;
  status: "ACTIVE" | "INACTIVE";
  joinedDate: string;
  notes?: string;
  ledger?: CustomerLedgerEntry[];
}

interface CustomerStoreState {
  customers: CustomerItem[];
  addCustomer: (customer: CustomerItem) => void;
  updateCustomer: (id: string, updated: Partial<CustomerItem>) => void;
  deleteCustomer: (id: string) => void;
  recordDuePayment: (customerId: string, amount: number, paymentMethod: string, note?: string) => void;
  addCustomerDue: (customerId: string, amount: number, orderId?: string, note?: string) => void;
}

const DEFAULT_CUSTOMERS: CustomerItem[] = [
  {
    id: "cust-1",
    name: "Tanvir Ahmed",
    phone: "01711223344",
    email: "tanvir.ahmed@gmail.com",
    location: "Dhanmondi, Dhaka",
    address: "House 42, Road 9/A, Dhanmondi",
    ordersCount: 8,
    totalSpent: 18450,
    dueBalance: 2450,
    creditLimit: 5000,
    status: "ACTIVE",
    joinedDate: "2025-11-12",
    notes: "Regular wholesale client",
    ledger: [
      {
        id: "led-1",
        date: "2026-08-20",
        type: "DUE_ADDED",
        amount: 4450,
        orderId: "RM-8219",
        note: "Partial COD order delivered",
      },
      {
        id: "led-2",
        date: "2026-08-24",
        type: "PAYMENT_RECEIVED",
        amount: 2000,
        paymentMethod: "BKASH",
        note: "bKash Partial Payment received",
      },
    ],
  },
  {
    id: "cust-2",
    name: "Sumaiya Akhter",
    phone: "01822334455",
    email: "sumaiya.design@yahoo.com",
    location: "GEC Circle, Chittagong",
    address: "Flat 4B, Green Tower, GEC",
    ordersCount: 4,
    totalSpent: 8900,
    dueBalance: 0,
    creditLimit: 2000,
    status: "ACTIVE",
    joinedDate: "2026-01-15",
    notes: "Paid in full COD",
    ledger: [],
  },
  {
    id: "cust-3",
    name: "Mohammad Kamrul",
    phone: "01933445566",
    email: "kamrul.traders@outlook.com",
    location: "Zindabazar, Sylhet",
    address: "Shop 12, City Center, Zindabazar",
    ordersCount: 12,
    totalSpent: 36200,
    dueBalance: 5200,
    creditLimit: 10000,
    status: "ACTIVE",
    joinedDate: "2025-08-10",
    notes: "VIP customer - 30 days payment term",
    ledger: [
      {
        id: "led-3",
        date: "2026-08-15",
        type: "DUE_ADDED",
        amount: 8200,
        orderId: "RM-7930",
        note: "Invoice #7930 deferred",
      },
      {
        id: "led-4",
        date: "2026-08-22",
        type: "PAYMENT_RECEIVED",
        amount: 3000,
        paymentMethod: "NAGAD",
        note: "Nagad settlement",
      },
    ],
  },
];

function getInitialCustomers(): CustomerItem[] {
  if (typeof window === "undefined") return DEFAULT_CUSTOMERS;
  try {
    const raw = localStorage.getItem("raifas_mart_customers_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.state?.customers && Array.isArray(parsed.state.customers) && parsed.state.customers.length > 0) {
        return parsed.state.customers.map((c: any) => ({
          ...c,
          dueBalance: typeof c.dueBalance === "number" ? c.dueBalance : 0,
          ledger: Array.isArray(c.ledger) ? c.ledger : [],
        }));
      }
    }
  } catch {}
  return DEFAULT_CUSTOMERS;
}

export const useCustomerStore = create<CustomerStoreState>()(
  persist(
    (set, get) => ({
      customers: getInitialCustomers(),

      addCustomer: (customer) => {
        set({ customers: [customer, ...get().customers] });
      },

      updateCustomer: (id, updated) => {
        set({
          customers: get().customers.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        });
      },

      deleteCustomer: (id) => {
        set({
          customers: get().customers.filter((c) => c.id !== id),
        });
      },

      recordDuePayment: (customerId, amount, paymentMethod, note) => {
        const customer = get().customers.find((c) => c.id === customerId);
        if (!customer || amount <= 0) return;

        const newDue = Math.max(0, (customer.dueBalance || 0) - amount);
        const newEntry: CustomerLedgerEntry = {
          id: `led-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          type: "PAYMENT_RECEIVED",
          amount,
          paymentMethod,
          note: note || `Collected via ${paymentMethod}`,
        };

        set({
          customers: get().customers.map((c) =>
            c.id === customerId
              ? {
                  ...c,
                  dueBalance: newDue,
                  ledger: [newEntry, ...(c.ledger || [])],
                }
              : c
          ),
        });
      },

      addCustomerDue: (customerId, amount, orderId, note) => {
        const customer = get().customers.find((c) => c.id === customerId);
        if (!customer || amount <= 0) return;

        const newDue = (customer.dueBalance || 0) + amount;
        const newEntry: CustomerLedgerEntry = {
          id: `led-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          type: "DUE_ADDED",
          amount,
          orderId,
          note: note || "Unpaid balance added",
        };

        set({
          customers: get().customers.map((c) =>
            c.id === customerId
              ? {
                  ...c,
                  dueBalance: newDue,
                  ledger: [newEntry, ...(c.ledger || [])],
                }
              : c
          ),
        });
      },
    }),
    {
      name: "raifas_mart_customers_v1",
      storage: createJSONStorage(() => idbStorage),
    }
  )
);
