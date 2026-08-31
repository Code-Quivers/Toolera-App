import { Request, Response } from 'express';
import { eq, and, inArray, isNull, count } from 'drizzle-orm';
import { rdb } from '../../db/index.js';
import { usersTable, storesTable, storeMembersTable, productsTable, ordersTable } from '../../db/schema.js';

export const internalController = {
  async getUser(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (userId) {
        const user = await rdb()
          .select({ id: usersTable.id, email: usersTable.email, name: usersTable.name, avatar: usersTable.avatar, role: usersTable.role })
          .from(usersTable)
          .where(eq(usersTable.id, userId as string))
          .limit(1)
          .then(r => r[0] ?? null);
        return res.json({ success: true, data: user });
      }

      const user = await rdb()
        .select({ id: usersTable.id, email: usersTable.email, name: usersTable.name, avatar: usersTable.avatar, role: usersTable.role })
        .from(usersTable)
        .where(inArray(usersTable.role, ['OWNER', 'ADMIN']))
        .limit(1)
        .then(r => r[0] ?? null);
      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getStore(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (userId) {
        const ownedStore = await rdb().query.storesTable.findFirst({
          where: eq(storesTable.ownerId, userId as string),
          with: { subscription: { with: { plan: true } }, domains: true },
        });
        if (ownedStore) return res.json({ success: true, data: ownedStore });

        const member = await rdb().query.storeMembersTable.findFirst({
          where: and(eq(storeMembersTable.userId, userId as string), eq(storeMembersTable.status, 'ACTIVE')),
          with: { store: { with: { subscription: { with: { plan: true } }, domains: true } } },
        });
        if (member?.store) return res.json({ success: true, data: member.store });
      }

      const store = await rdb().query.storesTable.findFirst({
        where: and(inArray(storesTable.status, ['ACTIVE', 'SETUP']), isNull(storesTable.deletedAt)),
        with: { subscription: { with: { plan: true } }, domains: true },
      });
      return res.json({ success: true, data: store });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getStoreUsage(req: Request, res: Response) {
    try {
      const { storeId } = req.params;

      const store = await rdb().query.storesTable.findFirst({
        where: eq(storesTable.id, storeId),
        with: { subscription: { with: { plan: true } }, members: true },
      });

      const plan = (store as any)?.subscription?.plan;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [productsCountResult, ordersThisMonthResult, staffCountResult] = await Promise.all([
        rdb().select({ count: count() }).from(productsTable).where(eq(productsTable.storeId, storeId)),
        rdb().select({ count: count() }).from(ordersTable).where(
          and(eq(ordersTable.storeId, storeId), and(
            (ordersTable.createdAt as any) >= startOfMonth
          ))
        ),
        rdb().select({ count: count() }).from(storeMembersTable).where(
          and(eq(storeMembersTable.storeId, storeId), eq(storeMembersTable.status, 'ACTIVE'))
        ),
      ]);

      const productsCount = Number(productsCountResult[0].count);
      const ordersThisMonth = Number(ordersThisMonthResult[0].count);
      const staffCount = Number(staffCountResult[0].count);

      return res.json({
        success: true,
        data: {
          productsCount,
          productsLimit: plan?.maxProducts ?? 100,
          ordersThisMonth,
          ordersLimit: plan?.maxOrdersPerMonth ?? 200,
          staffCount: staffCount + 1,
          staffLimit: plan?.maxStaffMembers ?? 2,
          storageMb: 120,
          storageLimitMb: 5000,
          planName: plan?.name || 'Growth',
          planSlug: plan?.slug || 'growth',
          canCustomDomain: plan?.allowCustomDomain ?? true,
          canAdvancedSeo: plan?.slug === 'growth' || plan?.slug === 'pro',
          canCoupons: true,
          canAnalytics: plan?.allowAnalytics ?? true,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
