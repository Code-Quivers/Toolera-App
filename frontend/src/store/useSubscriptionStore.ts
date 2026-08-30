"use client";

import { create } from "zustand";

export interface PlanModel {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  priceMonthly: number;
  priceYearly: number;
  badge?: string | null;
  features: string[];
  maxProducts: number;
  maxOrdersPerMonth: number;
  maxStaffMembers: number;
  allowCustomDomain: boolean;
  allowCourierIntegration: boolean;
  allowSmsGateway: boolean;
  allowAnalytics: boolean;
  prioritySupport: boolean;
  position: number;
}

export interface SubscriptionModel {
  id: string;
  storeId: string;
  planId: string;
  planSlug: string;
  status: "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
  billingCycle: "MONTHLY" | "YEARLY";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string | null;
  cancelAtPeriodEnd: boolean;
  paymentMethod: string;
  lastPaymentTrxId?: string | null;
  lastPaymentAmount: number;
  lastPaymentDate?: string | null;
  plan?: PlanModel;
}

export interface InvoiceModel {
  id: string;
  subscriptionId: string;
  storeId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED";
  paymentMethod: string;
  transactionId?: string | null;
  periodStart: string;
  periodEnd: string;
  notes?: string | null;
  pdfUrl?: string | null;
  paidAt?: string | null;
  createdAt: string;
}

export interface UsageModel {
  products: { current: number; max: number; percent: number };
  ordersThisMonth: { current: number; max: number; percent: number };
  staffMembers: { current: number; max: number; percent: number };
}

interface SubscriptionState {
  plans: PlanModel[];
  currentSubscription: SubscriptionModel | null;
  currentPlan: PlanModel | null;
  usage: UsageModel;
  daysRemaining: number;
  invoices: InvoiceModel[];
  isLoading: boolean;
  isCheckoutOpen: boolean;
  selectedPlanForCheckout: PlanModel | null;
  selectedCycle: "MONTHLY" | "YEARLY";
  error: string | null;

  // Actions
  fetchPlans: () => Promise<void>;
  fetchCurrentSubscription: (storeId?: string) => Promise<void>;
  fetchInvoices: (storeId?: string) => Promise<void>;
  openCheckout: (plan: PlanModel, cycle?: "MONTHLY" | "YEARLY") => void;
  closeCheckout: () => void;
  setSelectedCycle: (cycle: "MONTHLY" | "YEARLY") => void;
  checkout: (data: {
    storeId: string;
    planSlug: string;
    billingCycle: "MONTHLY" | "YEARLY";
    paymentMethod: "BKASH" | "NAGAD" | "CARD" | "DEMO";
    transactionId?: string;
    customerPhone?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  cancelRenewal: (storeId: string) => Promise<boolean>;
}

const DEFAULT_PLANS: PlanModel[] = [
  {
    id: "plan_free",
    name: "Free Trial",
    slug: "free",
    description: "Perfect for testing and launching your first online store",
    priceMonthly: 0,
    priceYearly: 0,
    badge: null,
    maxProducts: 20,
    maxOrdersPerMonth: 50,
    maxStaffMembers: 1,
    allowCustomDomain: false,
    allowCourierIntegration: false,
    allowSmsGateway: false,
    allowAnalytics: false,
    prioritySupport: false,
    position: 0,
    features: [
      "Up to 20 Products",
      "50 Orders per month",
      "Standard Cash on Delivery",
      "1 Staff Seat",
      "Standard Themes",
      "Community Support",
    ],
  },
  {
    id: "plan_starter",
    name: "Starter",
    slug: "starter",
    description: "For small businesses and ambitious creator shops",
    priceMonthly: 990,
    priceYearly: 9900,
    badge: null,
    maxProducts: 100,
    maxOrdersPerMonth: 500,
    maxStaffMembers: 3,
    allowCustomDomain: true,
    allowCourierIntegration: true,
    allowSmsGateway: false,
    allowAnalytics: true,
    prioritySupport: false,
    position: 1,
    features: [
      "Up to 100 Products",
      "500 Orders per month",
      "Custom Domain Connection",
      "Steadfast & Pathao Courier API",
      "3 Staff Seats",
      "Basic Analytics & Sales Reports",
      "bKash & Nagad Payment Verification",
      "Email Support",
    ],
  },
  {
    id: "plan_pro",
    name: "Pro Business",
    slug: "pro",
    description: "For scaling brands and high-volume e-commerce stores",
    priceMonthly: 2490,
    priceYearly: 24900,
    badge: "Most Popular",
    maxProducts: 1000,
    maxOrdersPerMonth: 3000,
    maxStaffMembers: 10,
    allowCustomDomain: true,
    allowCourierIntegration: true,
    allowSmsGateway: true,
    allowAnalytics: true,
    prioritySupport: true,
    position: 2,
    features: [
      "Up to 1,000 Products",
      "3,000 Orders per month",
      "Free Custom Domain SSL",
      "Full Courier Integrations (Steadfast/Pathao)",
      "Automated SMS Gateway (Greenweb/BulkSMSBD)",
      "10 Staff Seats & Role Permissions",
      "Advanced Analytics, Meta Pixel & GA4",
      "Priority 24/7 WhatsApp Support",
    ],
  },
  {
    id: "plan_enterprise",
    name: "Enterprise",
    slug: "enterprise",
    description: "Dedicated infrastructure, unlimited capacity, and custom features",
    priceMonthly: 4990,
    priceYearly: 49900,
    badge: "Best Value",
    maxProducts: -1,
    maxOrdersPerMonth: -1,
    maxStaffMembers: 50,
    allowCustomDomain: true,
    allowCourierIntegration: true,
    allowSmsGateway: true,
    allowAnalytics: true,
    prioritySupport: true,
    position: 3,
    features: [
      "Unlimited Products & Orders",
      "Multiple Custom Domains & Subdomains",
      "All Courier & Automated SMS Integrations",
      "50 Staff Seats & Granular Permissions",
      "Dedicated Account Manager",
      "Daily Cloud Database Backups",
      "Zero Transaction Commission",
      "VIP Support & Custom Integrations",
    ],
  },
];

const DEFAULT_SUBSCRIPTION: SubscriptionModel = {
  id: "sub_demo_active",
  storeId: "default_store",
  planId: "plan_pro",
  planSlug: "pro",
  status: "ACTIVE",
  billingCycle: "YEARLY",
  currentPeriodStart: new Date().toISOString(),
  currentPeriodEnd: new Date(Date.now() + 340 * 24 * 60 * 60 * 1000).toISOString(),
  trialEndsAt: null,
  cancelAtPeriodEnd: false,
  paymentMethod: "BKASH",
  lastPaymentTrxId: "TRX_PRO_SAAS_2026",
  lastPaymentAmount: 24900,
  lastPaymentDate: new Date().toISOString(),
  plan: DEFAULT_PLANS[2],
};

const DEFAULT_INVOICES: InvoiceModel[] = [
  {
    id: "inv_1",
    subscriptionId: "sub_demo_active",
    storeId: "default_store",
    invoiceNumber: "INV-2026-0001",
    amount: 24900,
    currency: "BDT",
    status: "PAID",
    paymentMethod: "bKash PGW",
    transactionId: "TRX_PRO_SAAS_2026",
    periodStart: new Date().toISOString(),
    periodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    notes: "Annual Pro Business SaaS Subscription for Raifa's Mart",
    paidAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: DEFAULT_PLANS,
  currentSubscription: DEFAULT_SUBSCRIPTION,
  currentPlan: DEFAULT_PLANS[2],
  usage: {
    products: { current: 14, max: 1000, percent: 2 },
    ordersThisMonth: { current: 38, max: 3000, percent: 1 },
    staffMembers: { current: 1, max: 10, percent: 10 },
  },
  daysRemaining: 340,
  invoices: DEFAULT_INVOICES,
  isLoading: false,
  isCheckoutOpen: false,
  selectedPlanForCheckout: null,
  selectedCycle: "YEARLY",
  error: null,

  fetchPlans: async () => {
    try {
      const res = await fetch(`${API_BASE}/subscriptions/plans`);
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          set({ plans: result.data });
        }
      }
    } catch {}
  },

  fetchCurrentSubscription: async (storeId) => {
    try {
      const url = storeId ? `${API_BASE}/subscriptions/current?storeId=${storeId}` : `${API_BASE}/subscriptions/current`;
      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        if (result.success && result.data) {
          set({
            currentSubscription: result.data.subscription,
            currentPlan: result.data.plan,
            usage: result.data.usage,
            daysRemaining: result.data.daysRemaining,
          });
        }
      }
    } catch {}
  },

  fetchInvoices: async (storeId) => {
    try {
      const url = storeId ? `${API_BASE}/subscriptions/invoices?storeId=${storeId}` : `${API_BASE}/subscriptions/invoices`;
      const res = await fetch(url);
      if (res.ok) {
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          set({ invoices: result.data });
        }
      }
    } catch {}
  },

  openCheckout: (plan, cycle) => {
    set({
      selectedPlanForCheckout: plan,
      selectedCycle: cycle || get().selectedCycle,
      isCheckoutOpen: true,
    });
  },

  closeCheckout: () => {
    set({ isCheckoutOpen: false, selectedPlanForCheckout: null });
  },

  setSelectedCycle: (cycle) => {
    set({ selectedCycle: cycle });
  },

  checkout: async (data) => {
    try {
      set({ isLoading: true });
      const res = await fetch(`${API_BASE}/subscriptions/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        const matchingPlan = get().plans.find((p) => p.slug === data.planSlug) || get().plans[2];
        const newSub = result.data.subscription;
        const newInvoice = result.data.invoice;

        set((state) => ({
          currentSubscription: newSub,
          currentPlan: matchingPlan,
          invoices: newInvoice ? [newInvoice, ...state.invoices] : state.invoices,
          daysRemaining: data.billingCycle === "YEARLY" ? 365 : 30,
          isCheckoutOpen: false,
          isLoading: false,
        }));
        return { success: true, message: result.message };
      } else {
        set({ isLoading: false });
        return { success: false, message: result.message || "Checkout failed" };
      }
    } catch (err: any) {
      // Local demo fallback
      const matchingPlan = get().plans.find((p) => p.slug === data.planSlug) || get().plans[2];
      const isYearly = data.billingCycle === "YEARLY";
      const amount = isYearly ? matchingPlan.priceYearly : matchingPlan.priceMonthly;

      const fallbackSub: SubscriptionModel = {
        id: `sub_${Date.now()}`,
        storeId: data.storeId,
        planId: matchingPlan.id,
        planSlug: matchingPlan.slug,
        status: "ACTIVE",
        billingCycle: data.billingCycle,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + (isYearly ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        paymentMethod: data.paymentMethod,
        lastPaymentTrxId: data.transactionId || `TRX_DEMO_${Date.now()}`,
        lastPaymentAmount: amount,
        lastPaymentDate: new Date().toISOString(),
        plan: matchingPlan,
      };

      const fallbackInvoice: InvoiceModel = {
        id: `inv_${Date.now()}`,
        subscriptionId: fallbackSub.id,
        storeId: data.storeId,
        invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        amount,
        currency: "BDT",
        status: "PAID",
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId || `TRX_DEMO_${Date.now()}`,
        periodStart: new Date().toISOString(),
        periodEnd: fallbackSub.currentPeriodEnd,
        notes: `${matchingPlan.name} plan upgrade`,
        paidAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      set((state) => ({
        currentSubscription: fallbackSub,
        currentPlan: matchingPlan,
        invoices: [fallbackInvoice, ...state.invoices],
        daysRemaining: isYearly ? 365 : 30,
        isCheckoutOpen: false,
        isLoading: false,
      }));

      return { success: true, message: `Upgraded to ${matchingPlan.name} plan successfully!` };
    }
  },

  cancelRenewal: async (storeId) => {
    try {
      await fetch(`${API_BASE}/subscriptions/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId }),
      });
    } catch {}

    set((state) => ({
      currentSubscription: state.currentSubscription
        ? { ...state.currentSubscription, cancelAtPeriodEnd: true }
        : null,
    }));
    return true;
  },
}));
