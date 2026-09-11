import { eq, desc } from "drizzle-orm";
import httpStatus from "http-status";
import { db } from "../../../db";
import { tooleraPlatformSettings } from "../../../db/schema";
import ApiError from "../../../errors/ApiError";

const getAll = async () => {
  return db.select().from(tooleraPlatformSettings).orderBy(desc(tooleraPlatformSettings.createdAt));
};

const getByKey = async (key: string) => {
  const [setting] = await db.select().from(tooleraPlatformSettings).where(eq(tooleraPlatformSettings.key, key));
  return setting ?? null;
};

const upsert = async (key: string, value: any, description?: string, updatedBy?: string) => {
  const existing = await getByKey(key);

  if (existing) {
    const [updated] = await db
      .update(tooleraPlatformSettings)
      .set({ value, description: description ?? existing.description, updatedBy: updatedBy ?? existing.updatedBy, updatedAt: new Date() })
      .where(eq(tooleraPlatformSettings.key, key))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(tooleraPlatformSettings)
    .values({ key, value, description, updatedBy })
    .returning();
  return created;
};

const remove = async (key: string) => {
  const existing = await getByKey(key);
  if (!existing) throw new ApiError(httpStatus.NOT_FOUND, "Setting not found");

  await db.delete(tooleraPlatformSettings).where(eq(tooleraPlatformSettings.key, key));
  return { message: "Setting deleted successfully" };
};

export const SettingsService = {
  getAll,
  getByKey,
  upsert,
  remove,
};
