import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { z } from 'zod';

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
  // List all stores owned by or accessible to user
  async listStores(req: Request, res: Response) {
    try {
      const stores = await prisma.store.findMany({
        where: { deletedAt: null },
        include: {
          subscription: {
            include: {
              plan: true,
            },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate quick summary metrics per store
      const storesWithMetrics = await Promise.all(
        stores.map(async (store) => {
          const [productsCount, ordersCount, totalRevenueResult] = await Promise.all([
            prisma.product.count({ where: { deletedAt: null } }),
            prisma.order.count({ where: { deletedAt: null } }),
            prisma.order.aggregate({
              _sum: { total: true },
              where: { paymentStatus: 'PAID', deletedAt: null },
            }),
          ]);

          return {
            ...store,
            metrics: {
              productsCount,
              ordersCount,
              revenue: totalRevenueResult._sum.total || 0,
            },
          };
        })
      );

      return res.json({ success: true, data: storesWithMetrics });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get single store details
  async getStore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const store = await prisma.store.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
          deletedAt: null,
        },
        include: {
          subscription: {
            include: { plan: true },
          },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, avatar: true, role: true },
              },
            },
          },
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });

      if (!store) {
        return res.status(404).json({ success: false, message: 'Store not found' });
      }

      const [productsCount, ordersCount, totalRevenueResult] = await Promise.all([
        prisma.product.count({ where: { deletedAt: null } }),
        prisma.order.count({ where: { deletedAt: null } }),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { paymentStatus: 'PAID', deletedAt: null },
        }),
      ]);

      return res.json({
        success: true,
        data: {
          ...store,
          metrics: {
            productsCount,
            ordersCount,
            revenue: totalRevenueResult._sum.total || 0,
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Create new store with initial subscription
  async createStore(req: Request, res: Response) {
    try {
      const data = createStoreSchema.parse(req.body);

      // Check slug uniqueness
      const existing = await prisma.store.findUnique({
        where: { slug: data.slug.toLowerCase() },
      });

      if (existing) {
        return res.status(400).json({ success: false, message: 'Store slug / subdomain is already taken. Please choose another.' });
      }

      // Check custom domain if provided
      if (data.customDomain) {
        const existingDomain = await prisma.store.findUnique({
          where: { customDomain: data.customDomain.toLowerCase() },
        });
        if (existingDomain) {
          return res.status(400).json({ success: false, message: 'Custom domain is already linked to another store.' });
        }
      }

      // Find initial plan
      const selectedPlan = await prisma.subscriptionPlan.findUnique({
        where: { slug: data.planSlug },
      }) || await prisma.subscriptionPlan.findFirst({
        where: { slug: 'free' },
      }) || await prisma.subscriptionPlan.findFirst();

      if (!selectedPlan) {
        return res.status(400).json({ success: false, message: 'Invalid subscription plan.' });
      }

      // Find or assign owner
      let ownerId = (req as any).user?.id;
      if (!ownerId) {
        const defaultAdmin = await prisma.user.findFirst();
        if (defaultAdmin) ownerId = defaultAdmin.id;
      }

      if (!ownerId) {
        return res.status(400).json({ success: false, message: 'User authentication required.' });
      }

      const trialPeriodDays = 14;
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialPeriodDays);

      const newStore = await prisma.store.create({
        data: {
          name: data.name,
          slug: data.slug.toLowerCase(),
          customDomain: data.customDomain ? data.customDomain.toLowerCase() : null,
          description: data.description || null,
          currency: data.currency || 'BDT',
          currencySymbol: data.currencySymbol || '৳',
          status: 'ACTIVE',
          ownerId,
          members: {
            create: {
              userId: ownerId,
              role: 'OWNER',
              status: 'ACTIVE',
            },
          },
          subscription: {
            create: {
              planId: selectedPlan.id,
              planSlug: selectedPlan.slug,
              status: selectedPlan.priceMonthly === 0 ? 'ACTIVE' : 'TRIALING',
              billingCycle: 'MONTHLY',
              currentPeriodStart: new Date(),
              currentPeriodEnd: trialEndsAt,
              trialEndsAt: trialEndsAt,
              paymentMethod: 'DEMO',
            },
          },
        },
        include: {
          subscription: {
            include: { plan: true },
          },
          members: true,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Store created successfully!',
        data: newStore,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Update store details
  async updateStore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = updateStoreSchema.parse(req.body);

      // Validate slug uniqueness if changed
      if (data.slug) {
        const existing = await prisma.store.findFirst({
          where: {
            slug: data.slug.toLowerCase(),
            NOT: { id },
          },
        });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Slug is already used by another store.' });
        }
      }

      // Validate custom domain if changed
      if (data.customDomain) {
        const existing = await prisma.store.findFirst({
          where: {
            customDomain: data.customDomain.toLowerCase(),
            NOT: { id },
          },
        });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Domain is already connected to another store.' });
        }
      }

      const updated = await prisma.store.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.slug && { slug: data.slug.toLowerCase() }),
          ...(data.customDomain !== undefined && { customDomain: data.customDomain ? data.customDomain.toLowerCase() : null }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.logoUrl !== undefined && { logoUrl: data.logoUrl }),
          ...(data.faviconUrl !== undefined && { faviconUrl: data.faviconUrl }),
          ...(data.currency && { currency: data.currency }),
          ...(data.currencySymbol && { currencySymbol: data.currencySymbol }),
          ...(data.status && { status: data.status }),
        },
        include: {
          subscription: { include: { plan: true } },
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
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

  // Soft delete store
  async deleteStore(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.store.update({
        where: { id },
        data: { deletedAt: new Date(), status: 'INACTIVE' },
      });
      return res.json({ success: true, message: 'Store deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Add staff / team member
  async addStoreMember(req: Request, res: Response) {
    try {
      const { id: storeId } = req.params;
      const { email, role = 'STAFF' } = req.body;

      if (!email) {
        return res.status(400).json({ success: false, message: 'User email is required' });
      }

      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: email.split('@')[0],
            passwordHash: 'temporary123',
            role: 'EDITOR',
          },
        });
      }

      const membership = await prisma.storeMember.upsert({
        where: {
          storeId_userId: {
            storeId,
            userId: user.id,
          },
        },
        update: { role: role as any, status: 'ACTIVE' },
        create: {
          storeId,
          userId: user.id,
          role: role as any,
          status: 'ACTIVE',
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      return res.status(201).json({ success: true, message: 'Team member added successfully', data: membership });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Remove staff member
  async removeStoreMember(req: Request, res: Response) {
    try {
      const { id: storeId, memberId } = req.params;
      await prisma.storeMember.deleteMany({
        where: {
          storeId,
          id: memberId,
        },
      });
      return res.json({ success: true, message: 'Team member removed successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
