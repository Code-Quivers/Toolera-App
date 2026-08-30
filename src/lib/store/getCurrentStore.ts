import { prisma } from "@/lib/db/prisma";

export async function getCurrentStore(userId?: string) {
  try {
    if (userId) {
      // 1 User = 1 Store directly via ownerId
      const ownedStore = await prisma.store.findUnique({
        where: { ownerId: userId },
        include: {
          subscription: {
            include: { plan: true },
          },
          domains: true,
        },
      });
      if (ownedStore) return ownedStore;

      // Or via membership
      const memberStore = await prisma.storeMember.findFirst({
        where: { userId, status: "ACTIVE" },
        include: {
          store: {
            include: {
              subscription: {
                include: { plan: true },
              },
              domains: true,
            },
          },
        },
      });
      if (memberStore?.store) return memberStore.store;
    }

    // Default primary store fallback
    const primaryStore = await prisma.store.findFirst({
      where: { status: { in: ["ACTIVE", "SETUP"] } },
      include: {
        subscription: {
          include: { plan: true },
        },
        domains: true,
      },
    });

    return primaryStore;
  } catch (error) {
    console.error("[getCurrentStore] Error:", error);
    return null;
  }
}
