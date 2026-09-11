import { eq, desc, and, sql, asc } from "drizzle-orm";
import httpStatus from "http-status";
import { db } from "../../../db";
import { tooleraPackages, tooleraPlatforms, tooleraSellerPackageSubscriptions, tooleraSellers } from "../../../db/schema";
import ApiError from "../../../errors/ApiError";

// ── Platforms ────────────────────────────────────────────────────────────────

const getAllPlatforms = async () => {
  return db.select().from(tooleraPlatforms).orderBy(desc(tooleraPlatforms.createdAt));
};

const getPlatformById = async (platformNameId: string) => {
  const [platform] = await db.select().from(tooleraPlatforms).where(eq(tooleraPlatforms.platformNameId, platformNameId));
  if (!platform) throw new ApiError(httpStatus.NOT_FOUND, "Platform not found");
  return platform;
};

const createPlatform = async (payload: typeof tooleraPlatforms.$inferInsert) => {
  const [existing] = await db.select().from(tooleraPlatforms).where(eq(tooleraPlatforms.platformName, payload.platformName!));
  if (existing) throw new ApiError(httpStatus.CONFLICT, "Platform name already exists");
  const [platform] = await db.insert(tooleraPlatforms).values(payload).returning();
  return platform;
};

const updatePlatform = async (platformNameId: string, payload: Partial<typeof tooleraPlatforms.$inferInsert>) => {
  await getPlatformById(platformNameId);
  const [updated] = await db
    .update(tooleraPlatforms)
    .set({ ...payload, updatedAt: new Date() })
    .where(eq(tooleraPlatforms.platformNameId, platformNameId))
    .returning();
  return updated;
};

const removePlatform = async (platformNameId: string) => {
  await getPlatformById(platformNameId);
  await db.delete(tooleraPlatforms).where(eq(tooleraPlatforms.platformNameId, platformNameId));
  return { message: "Platform deleted successfully" };
};

// ── Packages ─────────────────────────────────────────────────────────────────

const getAllPackages = async (query: {
  page?: number;
  limit?: number;
  platformNameId?: string;
  isActive?: string;
  search?: string;
}) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 50;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (query.platformNameId) conditions.push(eq(tooleraPackages.platformNameId, query.platformNameId));
  if (query.isActive !== undefined) conditions.push(eq(tooleraPackages.isActive, query.isActive === "true"));
  if (query.search) conditions.push(sql`${tooleraPackages.name} ILIKE ${`%${query.search}%`}`);

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraPackages)
    .where(where);

  const packages = await db
    .select({
      package: tooleraPackages,
      platform: {
        platformNameId: tooleraPlatforms.platformNameId,
        platformName: tooleraPlatforms.platformName,
      },
    })
    .from(tooleraPackages)
    .leftJoin(tooleraPlatforms, eq(tooleraPackages.platformNameId, tooleraPlatforms.platformNameId))
    .where(where)
    .orderBy(desc(tooleraPackages.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    meta: {
      page,
      limit,
      total: countResult.count,
      totalPages: Math.ceil(countResult.count / limit),
    },
    data: packages,
  };
};

const getPackageById = async (packageId: string) => {
  const [result] = await db
    .select({
      package: tooleraPackages,
      platform: {
        platformNameId: tooleraPlatforms.platformNameId,
        platformName: tooleraPlatforms.platformName,
      },
    })
    .from(tooleraPackages)
    .leftJoin(tooleraPlatforms, eq(tooleraPackages.platformNameId, tooleraPlatforms.platformNameId))
    .where(eq(tooleraPackages.packageId, packageId));
  if (!result) throw new ApiError(httpStatus.NOT_FOUND, "Package not found");
  return result;
};

const getPackagesByPlatformName = async (platformName: string) => {
  const [platform] = await db.select().from(tooleraPlatforms).where(eq(tooleraPlatforms.platformName, platformName));
  if (!platform) throw new ApiError(httpStatus.NOT_FOUND, "Platform not found");

  return db
    .select()
    .from(tooleraPackages)
    .where(and(eq(tooleraPackages.platformNameId, platform.platformNameId), eq(tooleraPackages.isActive, true)))
    .orderBy(tooleraPackages.sortOrder, tooleraPackages.price);
};

const createPackage = async (payload: typeof tooleraPackages.$inferInsert) => {
  const [existing] = await db.select().from(tooleraPackages).where(eq(tooleraPackages.slug, payload.slug!));
  if (existing) throw new ApiError(httpStatus.CONFLICT, `A package with slug "${payload.slug}" already exists`);
  const [pkg] = await db.insert(tooleraPackages).values(payload).returning();
  return pkg;
};

const updatePackage = async (packageId: string, payload: Partial<typeof tooleraPackages.$inferInsert>) => {
  await getPackageById(packageId);
  const [updated] = await db
    .update(tooleraPackages)
    .set({ ...payload, updatedAt: new Date() })
    .where(eq(tooleraPackages.packageId, packageId))
    .returning();
  return updated;
};

const removePackage = async (packageId: string) => {
  await getPackageById(packageId);
  await db.delete(tooleraPackages).where(eq(tooleraPackages.packageId, packageId));
  return { message: "Package deleted successfully" };
};

// ── Subscriptions ────────────────────────────────────────────────────────────

const getSubscriptions = async (query: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (query.status) conditions.push(eq(tooleraSellerPackageSubscriptions.status, query.status as any));
  if (query.search) {
    conditions.push(
      sql`${tooleraSellerPackageSubscriptions.sellerGoogleId} ILIKE ${`%${query.search}%`}`
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSellerPackageSubscriptions)
    .where(where);

  const sortColumn =
    query.sortBy === "startDate"
      ? tooleraSellerPackageSubscriptions.startDate
      : query.sortBy === "endDate"
        ? tooleraSellerPackageSubscriptions.endDate
        : tooleraSellerPackageSubscriptions.createdAt;

  const orderFn = query.sortOrder === "asc" ? asc : desc;

  const rows = await db
    .select({
      subscription: tooleraSellerPackageSubscriptions,
      package: {
        packageId: tooleraPackages.packageId,
        name: tooleraPackages.name,
        price: tooleraPackages.price,
      },
      platform: {
        platformNameId: tooleraPlatforms.platformNameId,
        platformName: tooleraPlatforms.platformName,
      },
    })
    .from(tooleraSellerPackageSubscriptions)
    .leftJoin(tooleraPackages, eq(tooleraSellerPackageSubscriptions.packageId, tooleraPackages.packageId))
    .leftJoin(tooleraPlatforms, eq(tooleraPackages.platformNameId, tooleraPlatforms.platformNameId))
    .where(where)
    .orderBy(orderFn(sortColumn))
    .limit(limit)
    .offset(offset);

  return {
    meta: {
      page,
      limit,
      total: countResult.count,
      totalPages: Math.ceil(countResult.count / limit),
    },
    data: rows,
  };
};

const getRecentSubscriptions = async (limit = 10) => {
  return db
    .select({
      subscription: tooleraSellerPackageSubscriptions,
      package: {
        packageId: tooleraPackages.packageId,
        name: tooleraPackages.name,
        price: tooleraPackages.price,
      },
    })
    .from(tooleraSellerPackageSubscriptions)
    .leftJoin(tooleraPackages, eq(tooleraSellerPackageSubscriptions.packageId, tooleraPackages.packageId))
    .orderBy(desc(tooleraSellerPackageSubscriptions.createdAt))
    .limit(limit);
};

export const PackagesService = {
  getAllPlatforms,
  getPlatformById,
  createPlatform,
  updatePlatform,
  removePlatform,
  getAllPackages,
  getPackageById,
  getPackagesByPlatformName,
  createPackage,
  updatePackage,
  removePackage,
  getSubscriptions,
  getRecentSubscriptions,
};
