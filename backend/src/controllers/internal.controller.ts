import { Request, Response } from 'express';
import { prisma } from '../prisma.js';

export const internalController = {
  async getUser(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (userId) {
        const user = await prisma.user.findUnique({
          where: { id: userId as string },
          select: { id: true, email: true, name: true, avatar: true, role: true },
        });
        return res.json({ success: true, data: user });
      }

      const user = await prisma.user.findFirst({
        where: { role: { in: ['OWNER', 'ADMIN'] } },
        select: { id: true, email: true, name: true, avatar: true, role: true },
      });
      return res.json({ success: true, data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getStore(req: Request, res: Response) {
    try {
      const { userId } = req.query;

      if (userId) {
        const ownedStore = await prisma.store.findUnique({
          where: { ownerId: userId as string },
          include: { subscription: { include: { plan: true } }, domains: true },
        });
        if (ownedStore) return res.json({ success: true, data: ownedStore });

        const member = await prisma.storeMember.findFirst({
          where: { userId: userId as string, status: 'ACTIVE' },
          include: {
            store: { include: { subscription: { include: { plan: true } }, domains: true } },
          },
        });
        if (member?.store) return res.json({ success: true, data: member.store });
      }

      const store = await prisma.store.findFirst({
        where: { status: { in: ['ACTIVE', 'SETUP'] }, deletedAt: null },
        include: { subscription: { include: { plan: true } }, domains: true },
      });
      return res.json({ success: true, data: store });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getStoreUsage(req: Request, res: Response) {
    try {
      const { storeId } = req.params;

      const store = await prisma.store.findUnique({
        where: { id: storeId },
        include: { subscription: { include: { plan: true } }, members: true },
      });

      const plan = store?.subscription?.plan;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [productsCount, ordersThisMonth, staffCount] = await Promise.all([
        prisma.product.count({ where: { storeId } }),
        prisma.order.count({ where: { storeId, createdAt: { gte: startOfMonth } } }),
        prisma.storeMember.count({ where: { storeId, status: 'ACTIVE' } }),
      ]);

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
