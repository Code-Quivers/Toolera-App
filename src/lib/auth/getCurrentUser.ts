import { prisma } from "@/lib/db/prisma";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  role: "OWNER" | "ADMIN" | "EDITOR" | "MANAGER" | "STAFF";
}

export async function getCurrentUser(userId?: string): Promise<AuthenticatedUser | null> {
  try {
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true, avatar: true, role: true },
      });
      return user as AuthenticatedUser | null;
    }

    const defaultUser = await prisma.user.findFirst({
      where: { role: { in: ["OWNER", "ADMIN"] } },
      select: { id: true, email: true, name: true, avatar: true, role: true },
    });

    return defaultUser as AuthenticatedUser | null;
  } catch (error) {
    console.error("[getCurrentUser] Error:", error);
    return null;
  }
}
