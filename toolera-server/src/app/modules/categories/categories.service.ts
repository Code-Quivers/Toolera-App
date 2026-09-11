import { eq, sql, ilike, or } from "drizzle-orm";
import httpStatus from "http-status";
import { db } from "../../../db";
import { tooleraCategories } from "../../../db/schema";
import ApiError from "../../../errors/ApiError";

function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const getAll = async (search?: string) => {
  const where = search
    ? or(ilike(tooleraCategories.name, `%${search}%`), ilike(tooleraCategories.description, `%${search}%`))
    : undefined;

  const rows = await db
    .select()
    .from(tooleraCategories)
    .where(where)
    .orderBy(tooleraCategories.sortOrder, tooleraCategories.name);

  const [totalCount] = await db.select({ count: sql<number>`count(*)::int` }).from(tooleraCategories);
  const [activeCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraCategories)
    .where(eq(tooleraCategories.isActive, true));

  return {
    stats: {
      total: totalCount.count,
      active: activeCount.count,
    },
    data: rows,
  };
};

const create = async (body: { name: string; icon?: string; description?: string; sortOrder?: number }) => {
  const slug = toSlug(body.name);

  const existing = await db
    .select({ categoryId: tooleraCategories.categoryId })
    .from(tooleraCategories)
    .where(eq(tooleraCategories.slug, slug));

  if (existing.length > 0) throw new ApiError(httpStatus.CONFLICT, "Category with this name already exists");

  const [created] = await db
    .insert(tooleraCategories)
    .values({
      name: body.name.trim(),
      slug,
      icon: body.icon ?? "more_horiz",
      description: body.description?.trim() ?? null,
      sortOrder: body.sortOrder ?? 0,
      isActive: true,
    })
    .returning();

  return created;
};

const toggleActive = async (categoryId: string) => {
  const [cat] = await db
    .select()
    .from(tooleraCategories)
    .where(eq(tooleraCategories.categoryId, categoryId));

  if (!cat) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");

  const [updated] = await db
    .update(tooleraCategories)
    .set({ isActive: !cat.isActive, updatedAt: new Date() })
    .where(eq(tooleraCategories.categoryId, categoryId))
    .returning();

  return updated;
};

const update = async (categoryId: string, body: { name?: string; icon?: string; description?: string; sortOrder?: number }) => {
  const [cat] = await db
    .select()
    .from(tooleraCategories)
    .where(eq(tooleraCategories.categoryId, categoryId));

  if (!cat) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");

  const patch: Record<string, unknown> = { updatedAt: new Date() };
  if (body.name !== undefined) {
    patch.name = body.name.trim();
    patch.slug = toSlug(body.name);
  }
  if (body.icon !== undefined) patch.icon = body.icon;
  if (body.description !== undefined) patch.description = body.description.trim() || null;
  if (body.sortOrder !== undefined) patch.sortOrder = body.sortOrder;

  const [updated] = await db
    .update(tooleraCategories)
    .set(patch as any)
    .where(eq(tooleraCategories.categoryId, categoryId))
    .returning();

  return updated;
};

const remove = async (categoryId: string) => {
  const [cat] = await db
    .select()
    .from(tooleraCategories)
    .where(eq(tooleraCategories.categoryId, categoryId));

  if (!cat) throw new ApiError(httpStatus.NOT_FOUND, "Category not found");

  await db.delete(tooleraCategories).where(eq(tooleraCategories.categoryId, categoryId));
  return cat;
};

export const CategoriesService = {
  getAll,
  create,
  toggleActive,
  update,
  remove,
};
