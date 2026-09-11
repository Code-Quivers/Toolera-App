import { eq, desc, and, sql } from "drizzle-orm";
import httpStatus from "http-status";
import { db } from "../../../db";
import { tooleraSellers, tooleraSellerSubscriptions } from "../../../db/schema";
import ApiError from "../../../errors/ApiError";

const getAll = async (query: { page?: number; limit?: number; status?: string; search?: string }) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (query.status) conditions.push(eq(tooleraSellers.status, query.status as any));
  if (query.search) {
    conditions.push(
      sql`(${tooleraSellers.name} ILIKE ${`%${query.search}%`} OR ${tooleraSellers.email} ILIKE ${`%${query.search}%`} OR ${tooleraSellers.storeName} ILIKE ${`%${query.search}%`})`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellers)
    .where(where);

  const sellers = await db
    .select()
    .from(tooleraSellers)
    .where(where)
    .orderBy(desc(tooleraSellers.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    meta: {
      page,
      limit,
      total: countResult.count,
      totalPages: Math.ceil(countResult.count / limit),
    },
    data: sellers,
  };
};

const getById = async (id: string) => {
  const [seller] = await db.select().from(tooleraSellers).where(eq(tooleraSellers.id, id));
  if (!seller) throw new ApiError(httpStatus.NOT_FOUND, "Seller not found");
  return seller;
};

const getByGoogleId = async (sellerGoogleId: string) => {
  const [seller] = await db.select().from(tooleraSellers).where(eq(tooleraSellers.sellerGoogleId, sellerGoogleId));
  return seller ?? null;
};

const syncFromCore = async (sellerGoogleId: string) => {
  const coreUrl = process.env.CORE_SERVICE_URL || "http://localhost:7300/backend/api/v1";

  try {
    const response = await fetch(`${coreUrl}/store/seller/${sellerGoogleId}`);
    if (!response.ok) throw new ApiError(httpStatus.BAD_GATEWAY, "Failed to fetch seller from core server");

    const coreData = await response.json() as any;
    const storeData = coreData?.data;

    const existing = await getByGoogleId(sellerGoogleId);

    const sellerPayload = {
      sellerGoogleId,
      email: storeData?.email || "",
      name: storeData?.name || null,
      avatarUrl: storeData?.avatarUrl || null,
      storeName: storeData?.name || null,
      storeSlug: storeData?.slug || null,
      phone: storeData?.phone || null,
      city: storeData?.city || null,
      status: storeData?.status || "ACTIVE",
      syncedAt: new Date(),
    };

    if (existing) {
      const [updated] = await db
        .update(tooleraSellers)
        .set({ ...sellerPayload, updatedAt: new Date() })
        .where(eq(tooleraSellers.sellerGoogleId, sellerGoogleId))
        .returning();
      return updated;
    }

    const [created] = await db.insert(tooleraSellers).values(sellerPayload).returning();
    return created;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to sync seller data");
  }
};

const updateStatus = async (id: string, status: string) => {
  await getById(id);
  const [updated] = await db
    .update(tooleraSellers)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(tooleraSellers.id, id))
    .returning();
  return updated;
};

const markDeleted = async (sellerGoogleId: string) => {
  const [updated] = await db
    .update(tooleraSellers)
    .set({ status: "DELETED", deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(tooleraSellers.sellerGoogleId, sellerGoogleId))
    .returning();
  return updated;
};

// ── Subscriptions ─────────────────────────────────────────────────────────────

const getSubscriptions = async (sellerGoogleId: string) => {
  return db
    .select()
    .from(tooleraSellerSubscriptions)
    .where(eq(tooleraSellerSubscriptions.sellerGoogleId, sellerGoogleId))
    .orderBy(desc(tooleraSellerSubscriptions.createdAt));
};

const getStats = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [totalSellers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellers);

  const [activeSellers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellers)
    .where(eq(tooleraSellers.status, "ACTIVE"));

  const [suspendedSellers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellers)
    .where(eq(tooleraSellers.status, "SUSPENDED"));

  const [deletedSellers] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellers)
    .where(eq(tooleraSellers.status, "DELETED"));

  const [newToday] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellers)
    .where(sql`${tooleraSellers.createdAt} >= ${todayStart}`);

  const [totalRevenue] = await db
    .select({ sum: sql<number>`coalesce(sum(${tooleraSellers.totalRevenue}), 0)::int` })
    .from(tooleraSellers);

  return {
    totalSellers: totalSellers.count,
    activeSellers: activeSellers.count,
    suspendedSellers: suspendedSellers.count,
    deletedSellers: deletedSellers.count,
    newToday: newToday.count,
    totalRevenue: totalRevenue.sum,
  };
};

export const SellersService = {
  getAll,
  getById,
  getByGoogleId,
  syncFromCore,
  updateStatus,
  markDeleted,
  getSubscriptions,
  getStats,
};
