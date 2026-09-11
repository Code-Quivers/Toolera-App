import { eq, desc, and, sql } from "drizzle-orm";
import httpStatus from "http-status";
import { db } from "../../../db";
import { tooleraTools, tooleraToolVariants } from "../../../db/schema";
import ApiError from "../../../errors/ApiError";

const getAll = async (query: { page?: number; limit?: number; status?: string; search?: string }) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (query.status) conditions.push(eq(tooleraTools.status, query.status as any));
  if (query.search) conditions.push(sql`${tooleraTools.name} ILIKE ${`%${query.search}%`}`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraTools)
    .where(where);

  const tools = await db
    .select()
    .from(tooleraTools)
    .where(where)
    .orderBy(desc(tooleraTools.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    meta: {
      page,
      limit,
      total: countResult.count,
      totalPages: Math.ceil(countResult.count / limit),
    },
    data: tools,
  };
};

const getById = async (toolId: string) => {
  const [tool] = await db.select().from(tooleraTools).where(eq(tooleraTools.toolId, toolId));
  if (!tool) throw new ApiError(httpStatus.NOT_FOUND, "Tool not found");
  return tool;
};

const create = async (payload: typeof tooleraTools.$inferInsert) => {
  const [tool] = await db.insert(tooleraTools).values(payload).returning();
  return tool;
};

const update = async (toolId: string, payload: Partial<typeof tooleraTools.$inferInsert>) => {
  await getById(toolId);
  const [updated] = await db
    .update(tooleraTools)
    .set({ ...payload, updatedAt: new Date() })
    .where(eq(tooleraTools.toolId, toolId))
    .returning();
  return updated;
};

const remove = async (toolId: string) => {
  await getById(toolId);
  await db.delete(tooleraTools).where(eq(tooleraTools.toolId, toolId));
  return { message: "Tool deleted successfully" };
};

// ── Variants ──────────────────────────────────────────────────────────────────

const getVariants = async (toolId: string) => {
  await getById(toolId);
  return db.select().from(tooleraToolVariants).where(eq(tooleraToolVariants.toolId, toolId));
};

const createVariant = async (toolId: string, payload: typeof tooleraToolVariants.$inferInsert) => {
  await getById(toolId);
  const [variant] = await db
    .insert(tooleraToolVariants)
    .values({ ...payload, toolId })
    .returning();
  return variant;
};

const updateVariant = async (variantId: string, payload: Partial<typeof tooleraToolVariants.$inferInsert>) => {
  const [existing] = await db.select().from(tooleraToolVariants).where(eq(tooleraToolVariants.variantId, variantId));
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "Variant not found");

  const [updated] = await db
    .update(tooleraToolVariants)
    .set({ ...payload, updatedAt: new Date() })
    .where(eq(tooleraToolVariants.variantId, variantId))
    .returning();
  return updated;
};

const removeVariant = async (variantId: string) => {
  const [existing] = await db.select().from(tooleraToolVariants).where(eq(tooleraToolVariants.variantId, variantId));
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "Variant not found");
  await db.delete(tooleraToolVariants).where(eq(tooleraToolVariants.variantId, variantId));
  return { message: "Variant deleted successfully" };
};

export const ToolsService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getVariants,
  createVariant,
  updateVariant,
  removeVariant,
};
