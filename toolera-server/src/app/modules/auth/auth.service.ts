import { eq } from "drizzle-orm";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../../../db";
import { tooleraAdminUsers } from "../../../db/schema";
import ApiError from "../../../errors/ApiError";
import config from "../../../config";

const login = async (email: string, password: string) => {
  const [admin] = await db.select().from(tooleraAdminUsers).where(eq(tooleraAdminUsers.email, email));
  if (!admin) throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");

  if (admin.status !== "ACTIVE") throw new ApiError(httpStatus.FORBIDDEN, "Account is not active");

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid credentials");

  await db
    .update(tooleraAdminUsers)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(tooleraAdminUsers.adminId, admin.adminId));

  const accessToken = jwt.sign(
    { adminId: admin.adminId, email: admin.email, role: admin.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  const refreshToken = jwt.sign(
    { adminId: admin.adminId, email: admin.email },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

  const { passwordHash, ...adminWithoutPassword } = admin;

  return {
    admin: adminWithoutPassword,
    accessToken,
    refreshToken,
  };
};

const getProfile = async (adminId: string) => {
  const [admin] = await db.select().from(tooleraAdminUsers).where(eq(tooleraAdminUsers.adminId, adminId));
  if (!admin) throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");

  const { passwordHash, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
};

const changePassword = async (adminId: string, currentPassword: string, newPassword: string) => {
  const [admin] = await db.select().from(tooleraAdminUsers).where(eq(tooleraAdminUsers.adminId, adminId));
  if (!admin) throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");

  const isPasswordValid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!isPasswordValid) throw new ApiError(httpStatus.UNAUTHORIZED, "Current password is incorrect");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db
    .update(tooleraAdminUsers)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(tooleraAdminUsers.adminId, adminId));

  return { message: "Password changed successfully" };
};

const createAdmin = async (email: string, password: string, name: string, role?: string) => {
  const existing = await db.select().from(tooleraAdminUsers).where(eq(tooleraAdminUsers.email, email));
  if (existing.length > 0) throw new ApiError(httpStatus.CONFLICT, "Admin with this email already exists");

  const passwordHash = await bcrypt.hash(password, 12);

  const [admin] = await db
    .insert(tooleraAdminUsers)
    .values({ email, passwordHash, name, role: role as any })
    .returning();

  const { passwordHash: _, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
};

export const AuthService = {
  login,
  getProfile,
  changePassword,
  createAdmin,
};
