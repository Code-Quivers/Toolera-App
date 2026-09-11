import { eq, sql, and, desc, gte, lt } from "drizzle-orm";
import { db } from "../../../db";
import {
  tooleraSellers,
  tooleraSellerPackageSubscriptions,
  tooleraPackages,
  tooleraPlatforms,
  tooleraSupportTickets,
} from "../../../db/schema";

const getStats = async () => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Sellers
  const [totalSellers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellers)
    .where(sql`${tooleraSellers.status} != 'DELETED'`);

  const [activeSellers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellers)
    .where(eq(tooleraSellers.status, "ACTIVE"));

  // Revenue
  const [totalRevenue] = await db
    .select({ sum: sql<number>`coalesce(sum(${tooleraSellers.totalRevenue}), 0)::int` })
    .from(tooleraSellers);

  // Subscriptions
  const [totalSubscriptions] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellerPackageSubscriptions);

  const [activeSubscriptions] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellerPackageSubscriptions)
    .where(eq(tooleraSellerPackageSubscriptions.status, "ACTIVE"));

  const [newThisWeek] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellerPackageSubscriptions)
    .where(gte(tooleraSellerPackageSubscriptions.createdAt, weekAgo));

  const [expiringThisWeek] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellerPackageSubscriptions)
    .where(
      and(
        eq(tooleraSellerPackageSubscriptions.status, "ACTIVE"),
        gte(tooleraSellerPackageSubscriptions.endDate, now),
        lt(tooleraSellerPackageSubscriptions.endDate, weekFromNow),
      )
    );

  const [cancelledThisMonth] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellerPackageSubscriptions)
    .where(
      and(
        eq(tooleraSellerPackageSubscriptions.status, "CANCELED"),
        gte(tooleraSellerPackageSubscriptions.updatedAt, monthStart),
      )
    );

  // Open support tickets
  const [openTickets] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSupportTickets)
    .where(eq(tooleraSupportTickets.status, "OPEN"));

  return {
    sellers: {
      total: totalSellers.count,
      active: activeSellers.count,
    },
    revenue: {
      total: totalRevenue.sum,
    },
    subscriptions: {
      total: totalSubscriptions.count,
      active: activeSubscriptions.count,
      newThisWeek: newThisWeek.count,
      expiringThisWeek: expiringThisWeek.count,
      cancelledThisMonth: cancelledThisMonth.count,
    },
    support: {
      openTickets: openTickets.count,
    },
  };
};

const getRecentSubscriptions = async (limit = 10) => {
  const rows = await db
    .select({
      subscriptionId: tooleraSellerPackageSubscriptions.subscriptionId,
      sellerGoogleId: tooleraSellerPackageSubscriptions.sellerGoogleId,
      packageId: tooleraSellerPackageSubscriptions.packageId,
      status: tooleraSellerPackageSubscriptions.status,
      startDate: tooleraSellerPackageSubscriptions.startDate,
      endDate: tooleraSellerPackageSubscriptions.endDate,
      autoRenew: tooleraSellerPackageSubscriptions.autoRenew,
      createdAt: tooleraSellerPackageSubscriptions.createdAt,
      packageName: tooleraPackages.name,
      packagePrice: tooleraPackages.price,
      currency: tooleraPackages.currency,
      platformName: tooleraPlatforms.platformName,
      sellerName: tooleraSellers.name,
      storeName: tooleraSellers.storeName,
      sellerEmail: tooleraSellers.email,
    })
    .from(tooleraSellerPackageSubscriptions)
    .leftJoin(tooleraPackages, eq(tooleraSellerPackageSubscriptions.packageId, tooleraPackages.packageId))
    .leftJoin(tooleraPlatforms, eq(tooleraPackages.platformNameId, tooleraPlatforms.platformNameId))
    .leftJoin(tooleraSellers, eq(tooleraSellerPackageSubscriptions.sellerGoogleId, tooleraSellers.sellerGoogleId))
    .orderBy(desc(tooleraSellerPackageSubscriptions.createdAt))
    .limit(limit);

  return rows;
};

export const DashboardService = {
  getStats,
  getRecentSubscriptions,
};
