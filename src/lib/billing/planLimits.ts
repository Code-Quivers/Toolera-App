import { prisma } from "@/lib/db/prisma";

export interface StoreUsageMetrics {
  productsCount: number;
  productsLimit: number;
  ordersThisMonth: number;
  ordersLimit: number;
  staffCount: number;
  staffLimit: number;
  storageMb: number;
  storageLimitMb: number;
  planName: string;
  planSlug: string;
  canCustomDomain: boolean;
  canAdvancedSeo: boolean;
  canCoupons: boolean;
  canAnalytics: boolean;
}

export async function getStoreUsage(storeId: string): Promise<StoreUsageMetrics> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      subscription: {
        include: { plan: true },
      },
      members: true,
    },
  });

  const plan = store?.subscription?.plan;
  const maxProducts = plan?.maxProducts ?? 100;
  const maxOrders = plan?.maxOrdersPerMonth ?? 200;
  const maxStaff = plan?.maxStaffMembers ?? 2;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [productsCount, ordersThisMonth, staffCount] = await Promise.all([
    prisma.product.count({ where: { storeId } }),
    prisma.order.count({ where: { storeId, createdAt: { gte: startOfMonth } } }),
    prisma.storeMember.count({ where: { storeId, status: "ACTIVE" } }),
  ]);

  return {
    productsCount,
    productsLimit: maxProducts,
    ordersThisMonth,
    ordersLimit: maxOrders,
    staffCount: staffCount + 1, // include owner
    staffLimit: maxStaff,
    storageMb: 120,
    storageLimitMb: 5000,
    planName: plan?.name || "Growth",
    planSlug: plan?.slug || "growth",
    canCustomDomain: plan?.allowCustomDomain ?? true,
    canAdvancedSeo: plan?.slug === "growth" || plan?.slug === "pro",
    canCoupons: true,
    canAnalytics: plan?.allowAnalytics ?? true,
  };
}

export async function checkPlanLimit(storeId: string, feature: "products" | "orders" | "staff"): Promise<{ allowed: boolean; current: number; max: number; upgradePrompt?: string }> {
  const usage = await getStoreUsage(storeId);

  if (feature === "products") {
    if (usage.productsLimit === -1) return { allowed: true, current: usage.productsCount, max: -1 };
    const allowed = usage.productsCount < usage.productsLimit;
    return {
      allowed,
      current: usage.productsCount,
      max: usage.productsLimit,
      upgradePrompt: allowed ? undefined : "You have reached your " + usage.planName + " product limit (" + usage.productsLimit + " products). Upgrade to add more.",
    };
  }

  if (feature === "staff") {
    const allowed = usage.staffCount < usage.staffLimit;
    return {
      allowed,
      current: usage.staffCount,
      max: usage.staffLimit,
      upgradePrompt: allowed ? undefined : "Your current plan allows up to " + usage.staffLimit + " team members. Upgrade for higher team capacity.",
    };
  }

  return { allowed: true, current: 0, max: -1 };
}

export async function canUseFeature(storeId: string, feature: "custom_domain" | "advanced_seo" | "analytics" | "courier"): Promise<boolean> {
  const usage = await getStoreUsage(storeId);
  if (feature === "custom_domain") return usage.canCustomDomain;
  if (feature === "advanced_seo") return usage.canAdvancedSeo;
  if (feature === "analytics") return usage.canAnalytics;
  return true;
}
