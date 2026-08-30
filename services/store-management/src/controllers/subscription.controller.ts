import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { z } from 'zod';

const checkoutSchema = z.object({
  storeId: z.string(),
  planSlug: z.string(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  paymentMethod: z.enum(['BKASH', 'NAGAD', 'CARD', 'DEMO']).default('BKASH'),
  transactionId: z.string().optional(),
  customerPhone: z.string().optional(),
});

export const subscriptionController = {
  // Get all active plans
  async getPlans(req: Request, res: Response) {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { position: 'asc' },
      });
      return res.json({ success: true, data: plans });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Get current active store's subscription & usage details
  async getCurrentSubscription(req: Request, res: Response) {
    try {
      const storeIdParam = req.query.storeId as string;
      let store = null;

      if (storeIdParam) {
        store = await prisma.store.findFirst({
          where: { OR: [{ id: storeIdParam }, { slug: storeIdParam }], deletedAt: null },
          include: {
            subscription: {
              include: { plan: true },
            },
          },
        });
      }

      if (!store) {
        store = await prisma.store.findFirst({
          where: { deletedAt: null },
          include: {
            subscription: {
              include: { plan: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        });
      }

      if (!store || !store.subscription) {
        return res.status(404).json({ success: false, message: 'Subscription not found' });
      }

      // Count current usage metrics
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [productsCount, ordersThisMonthCount, staffCount] = await Promise.all([
        prisma.product.count({ where: { deletedAt: null } }),
        prisma.order.count({
          where: {
            createdAt: { gte: firstDayOfMonth },
            deletedAt: null,
          },
        }),
        prisma.storeMember.count({ where: { storeId: store.id, status: 'ACTIVE' } }),
      ]);

      const plan = store.subscription.plan;
      const usage = {
        products: {
          current: productsCount,
          max: plan.maxProducts,
          percent: plan.maxProducts > 0 ? Math.min(100, Math.round((productsCount / plan.maxProducts) * 100)) : 0,
        },
        ordersThisMonth: {
          current: ordersThisMonthCount,
          max: plan.maxOrdersPerMonth,
          percent: plan.maxOrdersPerMonth > 0 ? Math.min(100, Math.round((ordersThisMonthCount / plan.maxOrdersPerMonth) * 100)) : 0,
        },
        staffMembers: {
          current: staffCount,
          max: plan.maxStaffMembers,
          percent: plan.maxStaffMembers > 0 ? Math.min(100, Math.round((staffCount / plan.maxStaffMembers) * 100)) : 0,
        },
      };

      // Calculate days remaining
      const expiry = new Date(store.subscription.currentPeriodEnd);
      const daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

      return res.json({
        success: true,
        data: {
          store: {
            id: store.id,
            name: store.name,
            slug: store.slug,
            customDomain: store.customDomain,
          },
          subscription: store.subscription,
          plan,
          usage,
          daysRemaining,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Checkout / Upgrade / Renew subscription
  async checkout(req: Request, res: Response) {
    try {
      const data = checkoutSchema.parse(req.body);

      // Verify store
      const store = await prisma.store.findFirst({
        where: { OR: [{ id: data.storeId }, { slug: data.storeId }], deletedAt: null },
      });

      if (!store) {
        return res.status(404).json({ success: false, message: 'Store not found' });
      }

      // Verify target plan
      const plan = await prisma.subscriptionPlan.findUnique({
        where: { slug: data.planSlug },
      });

      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
      }

      const isYearly = data.billingCycle === 'YEARLY';
      const amount = isYearly ? plan.priceYearly : plan.priceMonthly;

      // Calculate next billing period
      const currentStart = new Date();
      const currentEnd = new Date();
      if (isYearly) {
        currentEnd.setFullYear(currentEnd.getFullYear() + 1);
      } else {
        currentEnd.setMonth(currentEnd.getMonth() + 1);
      }

      const generatedTrxId = data.transactionId || `TRX_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Update or create subscription
      const updatedSubscription = await prisma.subscription.upsert({
        where: { storeId: store.id },
        update: {
          planId: plan.id,
          planSlug: plan.slug,
          status: 'ACTIVE',
          billingCycle: data.billingCycle,
          currentPeriodStart: currentStart,
          currentPeriodEnd: currentEnd,
          cancelAtPeriodEnd: false,
          paymentMethod: data.paymentMethod,
          lastPaymentTrxId: generatedTrxId,
          lastPaymentAmount: amount,
          lastPaymentDate: new Date(),
        },
        create: {
          storeId: store.id,
          planId: plan.id,
          planSlug: plan.slug,
          status: 'ACTIVE',
          billingCycle: data.billingCycle,
          currentPeriodStart: currentStart,
          currentPeriodEnd: currentEnd,
          cancelAtPeriodEnd: false,
          paymentMethod: data.paymentMethod,
          lastPaymentTrxId: generatedTrxId,
          lastPaymentAmount: amount,
          lastPaymentDate: new Date(),
        },
        include: { plan: true },
      });

      // Generate invoice
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const invoice = await prisma.subscriptionInvoice.create({
        data: {
          subscriptionId: updatedSubscription.id,
          storeId: store.id,
          invoiceNumber,
          amount,
          currency: 'BDT',
          status: 'PAID',
          paymentMethod: data.paymentMethod,
          transactionId: generatedTrxId,
          periodStart: currentStart,
          periodEnd: currentEnd,
          notes: `${plan.name} (${data.billingCycle.toLowerCase()}) SaaS subscription upgrade`,
          paidAt: new Date(),
        },
      });

      return res.json({
        success: true,
        message: `Successfully upgraded to ${plan.name} plan!`,
        data: {
          subscription: updatedSubscription,
          invoice,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // Cancel subscription auto-renew
  async cancel(req: Request, res: Response) {
    try {
      const { storeId } = req.body;
      const store = await prisma.store.findFirst({
        where: { OR: [{ id: storeId }, { slug: storeId }], deletedAt: null },
      });

      if (!store) {
        return res.status(404).json({ success: false, message: 'Store not found' });
      }

      const updated = await prisma.subscription.update({
        where: { storeId: store.id },
        data: { cancelAtPeriodEnd: true },
      });

      return res.json({
        success: true,
        message: 'Subscription will not auto-renew at the end of the current billing cycle.',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  // List store invoices
  async getInvoices(req: Request, res: Response) {
    try {
      const storeId = req.query.storeId as string;
      const whereClause = storeId ? { storeId } : {};

      const invoices = await prisma.subscriptionInvoice.findMany({
        where: whereClause,
        include: {
          store: {
            select: { id: true, name: true, slug: true },
          },
          subscription: {
            include: { plan: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: invoices });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
