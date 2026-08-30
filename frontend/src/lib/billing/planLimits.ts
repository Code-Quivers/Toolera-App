import { internalFetch } from '@/lib/api/internal';

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
  const res = await internalFetch<StoreUsageMetrics>(`/internal/store/${storeId}/usage`);
  if (!res.success || !res.data) {
    return {
      productsCount: 0, productsLimit: 100,
      ordersThisMonth: 0, ordersLimit: 200,
      staffCount: 1, staffLimit: 2,
      storageMb: 0, storageLimitMb: 5000,
      planName: 'Growth', planSlug: 'growth',
      canCustomDomain: true, canAdvancedSeo: true,
      canCoupons: true, canAnalytics: true,
    };
  }
  return res.data;
}

export async function checkPlanLimit(
  storeId: string,
  feature: 'products' | 'orders' | 'staff'
): Promise<{ allowed: boolean; current: number; max: number; upgradePrompt?: string }> {
  const usage = await getStoreUsage(storeId);

  if (feature === 'products') {
    if (usage.productsLimit === -1) return { allowed: true, current: usage.productsCount, max: -1 };
    const allowed = usage.productsCount < usage.productsLimit;
    return {
      allowed,
      current: usage.productsCount,
      max: usage.productsLimit,
      upgradePrompt: allowed
        ? undefined
        : `You have reached your ${usage.planName} product limit (${usage.productsLimit} products). Upgrade to add more.`,
    };
  }

  if (feature === 'staff') {
    const allowed = usage.staffCount < usage.staffLimit;
    return {
      allowed,
      current: usage.staffCount,
      max: usage.staffLimit,
      upgradePrompt: allowed
        ? undefined
        : `Your current plan allows up to ${usage.staffLimit} team members. Upgrade for higher team capacity.`,
    };
  }

  return { allowed: true, current: 0, max: -1 };
}

export async function canUseFeature(
  storeId: string,
  feature: 'custom_domain' | 'advanced_seo' | 'analytics' | 'courier'
): Promise<boolean> {
  const usage = await getStoreUsage(storeId);
  if (feature === 'custom_domain') return usage.canCustomDomain;
  if (feature === 'advanced_seo') return usage.canAdvancedSeo;
  if (feature === 'analytics') return usage.canAnalytics;
  return true;
}
