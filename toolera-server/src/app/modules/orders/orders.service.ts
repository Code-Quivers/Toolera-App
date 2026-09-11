import { eq, desc, and, sql } from "drizzle-orm";
import httpStatus from "http-status";
import { db } from "../../../db";
import { tooleraOrders, tooleraOrderItems } from "../../../db/schema";
import ApiError from "../../../errors/ApiError";

const getAll = async (query: {
  page?: number;
  limit?: number;
  status?: string;
  sellerGoogleId?: string;
  search?: string;
}) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (query.status) conditions.push(eq(tooleraOrders.status, query.status as any));
  if (query.sellerGoogleId) conditions.push(eq(tooleraOrders.sellerGoogleId, query.sellerGoogleId));
  if (query.search) {
    conditions.push(
      sql`(${tooleraOrders.orderNumber} ILIKE ${`%${query.search}%`} OR ${tooleraOrders.customerName} ILIKE ${`%${query.search}%`})`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraOrders)
    .where(where);

  const orders = await db
    .select()
    .from(tooleraOrders)
    .where(where)
    .orderBy(desc(tooleraOrders.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    meta: {
      page,
      limit,
      total: countResult.count,
      totalPages: Math.ceil(countResult.count / limit),
    },
    data: orders,
  };
};

const getById = async (orderId: string) => {
  const [order] = await db.select().from(tooleraOrders).where(eq(tooleraOrders.orderId, orderId));
  if (!order) throw new ApiError(httpStatus.NOT_FOUND, "Order not found");
  return order;
};

const getItems = async (orderId: string) => {
  await getById(orderId);
  return db.select().from(tooleraOrderItems).where(eq(tooleraOrderItems.orderId, orderId));
};

const updateStatus = async (orderId: string, status: string) => {
  await getById(orderId);
  const [updated] = await db
    .update(tooleraOrders)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(tooleraOrders.orderId, orderId))
    .returning();
  return updated;
};

const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
  await getById(orderId);
  const [updated] = await db
    .update(tooleraOrders)
    .set({ paymentStatus: paymentStatus as any, updatedAt: new Date() })
    .where(eq(tooleraOrders.orderId, orderId))
    .returning();
  return updated;
};

const getStats = async () => {
  const [totalOrders] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraOrders);

  const [pendingOrders] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraOrders)
    .where(eq(tooleraOrders.status, "PENDING"));

  const [deliveredOrders] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraOrders)
    .where(eq(tooleraOrders.status, "DELIVERED"));

  const [totalRevenue] = await db
    .select({ sum: sql<number>`coalesce(sum(${tooleraOrders.grandTotal}), 0)::int` })
    .from(tooleraOrders);

  const [paidRevenue] = await db
    .select({ sum: sql<number>`coalesce(sum(${tooleraOrders.grandTotal}), 0)::int` })
    .from(tooleraOrders)
    .where(eq(tooleraOrders.paymentStatus, "PAID"));

  return {
    totalOrders: totalOrders.count,
    pendingOrders: pendingOrders.count,
    deliveredOrders: deliveredOrders.count,
    totalRevenue: totalRevenue.sum,
    paidRevenue: paidRevenue.sum,
  };
};

export const OrdersService = {
  getAll,
  getById,
  getItems,
  updateStatus,
  updatePaymentStatus,
  getStats,
};
