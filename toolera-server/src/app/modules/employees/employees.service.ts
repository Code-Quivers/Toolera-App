import { eq, sql, desc, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../../../db";
import { tooleraAdminUsers, AdminRoleType, AdminStatusType } from "../../../db/schema";
import ApiError from "../../../errors/ApiError";

export const EmployeesService = {
  async getStats() {
    const [total] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tooleraAdminUsers);

    const [active] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tooleraAdminUsers)
      .where(eq(tooleraAdminUsers.status, "ACTIVE"));

    const [admins] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tooleraAdminUsers)
      .where(
        sql`${tooleraAdminUsers.role} IN ('SUPER_ADMIN', 'ADMIN') AND ${tooleraAdminUsers.status} = 'ACTIVE'`
      );

    const [moderators] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tooleraAdminUsers)
      .where(eq(tooleraAdminUsers.role, "MODERATOR"));

    return {
      total: total.count,
      active: active.count,
      activeAdmins: admins.count,
      moderators: moderators.count,
    };
  },

  async getAll(query: { search?: string; role?: string; status?: string; page?: number; limit?: number }) {
    const { search, role, status, page = 1, limit = 20 } = query;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      conditions.push(
        sql`(${tooleraAdminUsers.name} ILIKE ${`%${search}%`} OR ${tooleraAdminUsers.email} ILIKE ${`%${search}%`})`
      );
    }
    if (role) conditions.push(eq(tooleraAdminUsers.role, role as AdminRoleType));
    if (status) conditions.push(eq(tooleraAdminUsers.status, status as AdminStatusType));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [countRow]] = await Promise.all([
      db
        .select({
          adminId: tooleraAdminUsers.adminId,
          name: tooleraAdminUsers.name,
          email: tooleraAdminUsers.email,
          role: tooleraAdminUsers.role,
          status: tooleraAdminUsers.status,
          lastLoginAt: tooleraAdminUsers.lastLoginAt,
          createdAt: tooleraAdminUsers.createdAt,
        })
        .from(tooleraAdminUsers)
        .where(where)
        .orderBy(desc(tooleraAdminUsers.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(tooleraAdminUsers)
        .where(where),
    ]);

    return {
      data: rows,
      meta: {
        total: countRow.count,
        page,
        limit,
        totalPages: Math.ceil(countRow.count / limit),
      },
    };
  },

  async create(body: { name: string; email: string; password: string; role?: AdminRoleType }) {
    const existing = await db
      .select({ adminId: tooleraAdminUsers.adminId })
      .from(tooleraAdminUsers)
      .where(eq(tooleraAdminUsers.email, body.email.toLowerCase().trim()));

    if (existing.length > 0) throw new ApiError(409, "An employee with this email already exists");

    const passwordHash = await bcrypt.hash(body.password, 10);

    const [employee] = await db
      .insert(tooleraAdminUsers)
      .values({
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        passwordHash,
        role: body.role ?? "ADMIN",
      })
      .returning({
        adminId: tooleraAdminUsers.adminId,
        name: tooleraAdminUsers.name,
        email: tooleraAdminUsers.email,
        role: tooleraAdminUsers.role,
        status: tooleraAdminUsers.status,
        createdAt: tooleraAdminUsers.createdAt,
      });

    return employee;
  },

  async updateStatus(adminId: string, status: AdminStatusType) {
    const [updated] = await db
      .update(tooleraAdminUsers)
      .set({ status, updatedAt: new Date() })
      .where(eq(tooleraAdminUsers.adminId, adminId))
      .returning({
        adminId: tooleraAdminUsers.adminId,
        name: tooleraAdminUsers.name,
        email: tooleraAdminUsers.email,
        role: tooleraAdminUsers.role,
        status: tooleraAdminUsers.status,
      });

    if (!updated) throw new ApiError(404, "Employee not found");
    return updated;
  },

  async updateRole(adminId: string, role: AdminRoleType) {
    const [updated] = await db
      .update(tooleraAdminUsers)
      .set({ role, updatedAt: new Date() })
      .where(eq(tooleraAdminUsers.adminId, adminId))
      .returning({
        adminId: tooleraAdminUsers.adminId,
        name: tooleraAdminUsers.name,
        email: tooleraAdminUsers.email,
        role: tooleraAdminUsers.role,
        status: tooleraAdminUsers.status,
      });

    if (!updated) throw new ApiError(404, "Employee not found");
    return updated;
  },

  async remove(adminId: string) {
    const [deleted] = await db
      .delete(tooleraAdminUsers)
      .where(eq(tooleraAdminUsers.adminId, adminId))
      .returning({ adminId: tooleraAdminUsers.adminId });

    if (!deleted) throw new ApiError(404, "Employee not found");
    return deleted;
  },
};
