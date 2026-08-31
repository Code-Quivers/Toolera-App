import { Request, Response } from 'express';
import { eq, and, or, ne, isNull, sum, desc, count } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { db, rdb } from '../../db/index.js';
import {
  storesTable, storeMembersTable, subscriptionsTable, subscriptionPlansTable,
  usersTable, productsTable, ordersTable,
} from '../../db/schema.js';

const createStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  customDomain: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  currency: z.string().default('BDT'),
  currencySymbol: z.string().default('৳'),
  planSlug: z.string().default('starter'),
});

const updateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  customDomain: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  faviconUrl: z.string().optional().nullable(),
  currency: z.string().optional(),
  currencySymbol: z.string().optional(),
  status: z.enum(['ACTIVE', 'TRIAL', 'SUSPENDED', 'INACTIVE']).optional(),
});

export const storeController = {
  async getMyStore(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const membership = await rdb().select({ storeId: storeMembersTable.storeId })
        .from(storeMembersTable)
        .where(and(eq(storeMembersTable.userId, userId), eq(storeMembersTable.status, 'ACTIVE')))
        .orderBy(storeMembersTable.storeId)
        .limit(1)
        .then(r => r[0] ?? null);

      if (!membership) return res.status(404).json({ success: false, message: 'No store found for this user.' });

      const store = await rdb().query.storesTable.findFirst({
        where: and(eq(storesTable.id, membership.storeId), isNull(storesTable.deletedAt)),
        with: {
          subscription: { with: { plan: true } },
          members: { with: { user: { columns: { id: true, name: true, email: true, role: true } } } },
        },
      });

      if (!store) return res.status(404).json({ success: false, message: 'Store not found.' });
      return res.json({ success: true, data: store });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async listStores(req: Request, res: Response) {
    try {
      const stores = await rdb().query.storesTable.findMany({
        where: isNull(storesTable.deletedAt),
        with: {
          subscription: { with: { plan: true } },
          members: {
            with: {
              user: { columns: { id: true, name: true, email: true, role: true } },
            },
          },
        },
        orderBy: desc(storesTable.createdAt),
      });

      const [productsCountResult, ordersCountResult, revenueResult] = await Promise.all([
        rdb().select({ count: count() }).from(productsTable).where(isNull(productsTable.deletedAt)),
        rdb().select({ count: count() }).from(ordersTable).where(isNull(ordersTable.deletedAt)),
        rdb().select({ total: sum(ordersTable.total) }).from(ordersTable).where(
          and(eq(ordersTable.paymentStatus, 'PAID'), isNull(ordersTable.deletedAt))
        ),
      ]);

      const metrics = {
        productsCount: Number(productsCountResult[0].count),
        ordersCount: Number(ordersCountResult[0].count),
        revenue: Number(revenueResult[0].total) || 0,
      };

      const storesWithMetrics = stores.map(store => ({ ...store, metrics }));
      return res.json({ success: true, data: storesWithMetrics });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getStore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const store = await rdb().query.storesTable.findFirst({
        where: and(or(eq(storesTable.id, id), eq(storesTable.slug, id)), isNull(storesTable.deletedAt)),
        with: {
          subscription: { with: { plan: true } },
          members: {
            with: {
              user: { columns: { id: true, name: true, email: true, avatar: true, role: true } },
            },
          },
          invoices: { orderBy: desc((t: any) => t.createdAt), limit: 10 },
        },
      });

      if (!store) {
        return res.status(404).json({ success: false, message: 'Store not found' });
      }

      const [productsCountResult, ordersCountResult, revenueResult] = await Promise.all([
        rdb().select({ count: count() }).from(productsTable).where(isNull(productsTable.deletedAt)),
        rdb().select({ count: count() }).from(ordersTable).where(isNull(ordersTable.deletedAt)),
        rdb().select({ total: sum(ordersTable.total) }).from(ordersTable).where(
          and(eq(ordersTable.paymentStatus, 'PAID'), isNull(ordersTable.deletedAt))
        ),
      ]);

      return res.json({
        success: true,
        data: {
          ...store,
          metrics: {
            productsCount: Number(productsCountResult[0].count),
            ordersCount: Number(ordersCountResult[0].count),
            revenue: Number(revenueResult[0].total) || 0,
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async createStore(req: Request, res: Response) {
    try {
      const data = createStoreSchema.parse(req.body);

      const existingSlug = await rdb().select({ id: storesTable.id }).from(storesTable).where(eq(storesTable.slug, data.slug.toLowerCase())).limit(1).then(r => r[0] ?? null);
      if (existingSlug) {
        return res.status(400).json({ success: false, message: 'Store slug / subdomain is already taken. Please choose another.' });
      }

      if (data.customDomain) {
        const existingDomain = await rdb().select({ id: storesTable.id }).from(storesTable).where(eq(storesTable.customDomain, data.customDomain.toLowerCase())).limit(1).then(r => r[0] ?? null);
        if (existingDomain) {
          return res.status(400).json({ success: false, message: 'Custom domain is already linked to another store.' });
        }
      }

      const selectedPlan = await rdb().select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.slug, data.planSlug)).limit(1).then(r => r[0])
        ?? await rdb().select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.slug, 'free')).limit(1).then(r => r[0])
        ?? await rdb().select().from(subscriptionPlansTable).limit(1).then(r => r[0]);

      if (!selectedPlan) {
        return res.status(400).json({ success: false, message: 'Invalid subscription plan.' });
      }

      let ownerId = (req as any).user?.id;
      if (!ownerId) {
        const defaultAdmin = await rdb().select({ id: usersTable.id }).from(usersTable).limit(1).then(r => r[0] ?? null);
        if (defaultAdmin) ownerId = defaultAdmin.id;
      }

      if (!ownerId) {
        return res.status(400).json({ success: false, message: 'User authentication required.' });
      }

      const trialPeriodDays = 14;
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialPeriodDays);

      const newStore = await db.transaction(async (tx) => {
        const [store] = await tx.insert(storesTable).values({
          name: data.name,
          slug: data.slug.toLowerCase(),
          customDomain: data.customDomain ? data.customDomain.toLowerCase() : null,
          description: data.description || null,
          currency: data.currency || 'BDT',
          currencySymbol: data.currencySymbol || '৳',
          status: 'ACTIVE',
          ownerId,
        }).returning();

        await tx.insert(storeMembersTable).values({
          storeId: store.id,
          userId: ownerId,
          role: 'OWNER',
          status: 'ACTIVE',
        });

        await tx.insert(subscriptionsTable).values({
          storeId: store.id,
          planId: selectedPlan.id,
          planSlug: selectedPlan.slug,
          status: selectedPlan.priceMonthly === 0 ? 'ACTIVE' : 'TRIALING',
          billingCycle: 'MONTHLY',
          currentPeriodStart: new Date(),
          currentPeriodEnd: trialEndsAt,
          trialEndsAt,
          paymentMethod: 'DEMO',
        });

        return store;
      });

      const fullStore = await rdb().query.storesTable.findFirst({
        where: eq(storesTable.id, newStore.id),
        with: { subscription: { with: { plan: true } }, members: true },
      });

      return res.status(201).json({ success: true, message: 'Store created successfully!', data: fullStore });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async checkSlug(req: Request, res: Response) {
    try {
      const slug = req.params.slug?.toLowerCase().trim();
      if (!slug || slug.length < 2) {
        return res.status(400).json({ success: false, message: 'Slug must be at least 2 characters.' });
      }
      if (!/^[a-z0-9-]+$/.test(slug)) {
        return res.json({ available: false, message: 'Slug may only contain lowercase letters, numbers, and hyphens.' });
      }
      const existing = await rdb().select({ id: storesTable.id }).from(storesTable).where(eq(storesTable.slug, slug)).limit(1).then(r => r[0] ?? null);
      return res.json({ available: !existing, slug });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateStore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateStoreSchema.parse(req.body);

      if (data.slug) {
        const existing = await rdb().select({ id: storesTable.id }).from(storesTable).where(
          and(eq(storesTable.slug, data.slug.toLowerCase()), ne(storesTable.id, id))
        ).limit(1).then(r => r[0] ?? null);
        if (existing) {
          return res.status(400).json({ success: false, message: 'Slug is already used by another store.' });
        }
      }

      if (data.customDomain) {
        const existing = await rdb().select({ id: storesTable.id }).from(storesTable).where(
          and(eq(storesTable.customDomain, data.customDomain.toLowerCase()), ne(storesTable.id, id))
        ).limit(1).then(r => r[0] ?? null);
        if (existing) {
          return res.status(400).json({ success: false, message: 'Domain is already connected to another store.' });
        }
      }

      const setData: any = {};
      if (data.name) setData.name = data.name;
      if (data.slug) setData.slug = data.slug.toLowerCase();
      if (data.customDomain !== undefined) setData.customDomain = data.customDomain ? data.customDomain.toLowerCase() : null;
      if (data.description !== undefined) setData.description = data.description;
      if (data.logoUrl !== undefined) setData.logoUrl = data.logoUrl;
      if (data.faviconUrl !== undefined) setData.faviconUrl = data.faviconUrl;
      if (data.currency) setData.currency = data.currency;
      if (data.currencySymbol) setData.currencySymbol = data.currencySymbol;
      if (data.status) setData.status = data.status;

      await db.update(storesTable).set(setData).where(eq(storesTable.id, id));

      const updated = await rdb().query.storesTable.findFirst({
        where: eq(storesTable.id, id),
        with: {
          subscription: { with: { plan: true } },
          members: {
            with: { user: { columns: { id: true, name: true, email: true, role: true } } },
          },
        },
      });

      return res.json({ success: true, message: 'Store updated successfully', data: updated });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async deleteStore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await db.update(storesTable).set({ deletedAt: new Date(), status: 'INACTIVE' }).where(eq(storesTable.id, id));
      return res.json({ success: true, message: 'Store deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async addStoreMember(req: Request, res: Response) {
    try {
      const { id: storeId } = req.params;
      const { email, role = 'STAFF' } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'User email is required' });
      }

      let user = await rdb().select().from(usersTable).where(eq(usersTable.email, email)).limit(1).then(r => r[0] ?? null);
      if (!user) {
        [user] = await db.insert(usersTable).values({
          email,
          name: email.split('@')[0],
          passwordHash: 'temporary123',
          role: 'EDITOR',
        }).returning();
      }

      const [membership] = await db.insert(storeMembersTable).values({
        storeId,
        userId: user.id,
        role: role as any,
        status: 'ACTIVE',
      }).onConflictDoUpdate({
        target: [storeMembersTable.storeId, storeMembersTable.userId],
        set: { role: role as any, status: 'ACTIVE' },
      }).returning();

      const memberWithUser = await rdb().query.storeMembersTable.findFirst({
        where: eq(storeMembersTable.id, membership.id),
        with: { user: { columns: { id: true, name: true, email: true, role: true } } },
      });

      return res.status(201).json({ success: true, message: 'Team member added successfully', data: memberWithUser });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async removeStoreMember(req: Request, res: Response) {
    try {
      const { id: storeId, memberId } = req.params;
      await db.delete(storeMembersTable).where(
        and(eq(storeMembersTable.storeId, storeId), eq(storeMembersTable.id, memberId))
      );
      return res.json({ success: true, message: 'Team member removed successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
