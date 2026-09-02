import { Request, Response } from 'express';
import { eq, and, or, isNull, count, gte, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db, rdb } from '../../db/index.js';
import {
  storesTable, subscriptionPlansTable, subscriptionsTable,
  subscriptionInvoicesTable, productsTable, ordersTable, storeMembersTable,
} from '../../db/schema.js';

const checkoutSchema = z.object({
  storeId: z.string(),
  planSlug: z.string(),
  billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
  paymentMethod: z.enum(['BKASH', 'NAGAD', 'CARD', 'DEMO']).default('BKASH'),
  transactionId: z.string().optional(),
  customerPhone: z.string().optional(),
});

export const subscriptionController = {
  async getPlans(req: Request, res: Response) {
    try {
      let plans = await rdb()
        .select()
        .from(subscriptionPlansTable)
        .where(eq(subscriptionPlansTable.isActive, true))
        .orderBy(subscriptionPlansTable.position);

      if (!plans || plans.length === 0) {
        const defaultPlans = [
          {
            name: '30-Day Free Trial',
            slug: 'free-trial',
            description: '30-day free trial — full access to all features and routes',
            priceMonthly: 0,
            priceYearly: 0,
            badge: '30 DAYS FREE',
            features: [
              'All routes & features included',
              'Website CMS & Themes',
              'Unlimited products & variants',
              'Orders & Anti-fraud protection',
              'Courier Logistics & Auto-Dispatch',
              'SMS Gateway Notifications',
              'Analytics & Profit/Loss reports',
              'Custom domain support',
              'Priority 24/7 support',
            ],
            maxProducts: 1000,
            maxOrdersPerMonth: 5000,
            maxStaffMembers: 10,
            maxStorageMb: 5000,
            allowCustomDomain: true,
            allowCourierIntegration: true,
            allowSmsGateway: true,
            allowAnalytics: true,
            prioritySupport: true,
            trialDays: 30,
            isActive: true,
            position: 0,
          },
          {
            name: 'Growth Pro',
            slug: 'pro',
            description: 'Power plan for scaling e-commerce merchants',
            priceMonthly: 999,
            priceYearly: 9990,
            badge: 'MOST POPULAR',
            features: [
              'All routes & features included',
              'Unlimited products & orders',
              'PayStation payment gateway',
              'Custom domain with free SSL',
              'Courier & SMS auto-dispatch',
              'Priority 24/7 support',
            ],
            maxProducts: 10000,
            maxOrdersPerMonth: 99999,
            maxStaffMembers: 25,
            maxStorageMb: 20000,
            allowCustomDomain: true,
            allowCourierIntegration: true,
            allowSmsGateway: true,
            allowAnalytics: true,
            prioritySupport: true,
            trialDays: 0,
            isActive: true,
            position: 1,
          },
        ];

        try {
          for (const p of defaultPlans) {
            await db.insert(subscriptionPlansTable).values(p as any).onConflictDoUpdate({
              target: subscriptionPlansTable.slug,
              set: p,
            });
          }
          plans = await rdb()
            .select()
            .from(subscriptionPlansTable)
            .where(eq(subscriptionPlansTable.isActive, true))
            .orderBy(subscriptionPlansTable.position);
        } catch {
          return res.json({ success: true, data: defaultPlans });
        }
      }

      return res.json({ success: true, data: plans });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getCurrentSubscription(req: Request, res: Response) {
    try {
      const storeIdParam = req.query.storeId as string;
      let store: any = null;

      if (storeIdParam) {
        store = await rdb().query.storesTable.findFirst({
          where: and(or(eq(storesTable.id, storeIdParam), eq(storesTable.slug, storeIdParam)), isNull(storesTable.deletedAt)),
          with: { subscription: { with: { plan: true } } },
        });
      }

      if (!store) {
        store = await rdb().query.storesTable.findFirst({
          where: isNull(storesTable.deletedAt),
          with: { subscription: { with: { plan: true } } },
          orderBy: storesTable.createdAt,
        });
      }

      if (!store || !store.subscription) {
        return res.status(404).json({ success: false, message: 'Subscription not found' });
      }

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const [productsCountResult, ordersCountResult, staffCountResult] = await Promise.all([
        rdb().select({ count: count() }).from(productsTable).where(isNull(productsTable.deletedAt)),
        rdb().select({ count: count() }).from(ordersTable).where(
          and(gte(ordersTable.createdAt, firstDayOfMonth), isNull(ordersTable.deletedAt))
        ),
        rdb().select({ count: count() }).from(storeMembersTable).where(
          and(eq(storeMembersTable.storeId, store.id), eq(storeMembersTable.status, 'ACTIVE'))
        ),
      ]);

      const productsCount = Number(productsCountResult[0].count);
      const ordersThisMonthCount = Number(ordersCountResult[0].count);
      const staffCount = Number(staffCountResult[0].count);

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

      const expiry = new Date(store.subscription.currentPeriodEnd);
      const daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

      return res.json({
        success: true,
        data: {
          store: { id: store.id, name: store.name, slug: store.slug, customDomain: store.customDomain },
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

  async checkout(req: Request, res: Response) {
    try {
      const data = checkoutSchema.parse(req.body);

      const store = await rdb().select().from(storesTable).where(
        and(or(eq(storesTable.id, data.storeId), eq(storesTable.slug, data.storeId)), isNull(storesTable.deletedAt))
      ).limit(1).then(r => r[0] ?? null);

      if (!store) {
        return res.status(404).json({ success: false, message: 'Store not found' });
      }

      const plan = await rdb().select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.slug, data.planSlug)).limit(1).then(r => r[0] ?? null);
      if (!plan) {
        return res.status(404).json({ success: false, message: 'Plan not found' });
      }

      const isYearly = data.billingCycle === 'YEARLY';
      const amount = isYearly ? plan.priceYearly : plan.priceMonthly;

      const currentStart = new Date();
      const currentEnd = new Date();
      if (isYearly) {
        currentEnd.setFullYear(currentEnd.getFullYear() + 1);
      } else {
        currentEnd.setMonth(currentEnd.getMonth() + 1);
      }

      const generatedTrxId = data.transactionId || `TRX_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      const [updatedSubscription] = await db
        .insert(subscriptionsTable)
        .values({
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
        })
        .onConflictDoUpdate({
          target: subscriptionsTable.storeId,
          set: {
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
        })
        .returning();

      const subWithPlan = await rdb().query.subscriptionsTable.findFirst({
        where: eq(subscriptionsTable.id, updatedSubscription.id),
        with: { plan: true },
      });

      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const [invoice] = await db.insert(subscriptionInvoicesTable).values({
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
      }).returning();

      return res.json({
        success: true,
        message: `Successfully upgraded to ${plan.name} plan!`,
        data: { subscription: subWithPlan, invoice },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, message: error.errors[0]?.message || 'Validation error' });
      }
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async cancel(req: Request, res: Response) {
    try {
      const { storeId } = req.body;
      const store = await rdb().select().from(storesTable).where(
        and(or(eq(storesTable.id, storeId), eq(storesTable.slug, storeId)), isNull(storesTable.deletedAt))
      ).limit(1).then(r => r[0] ?? null);

      if (!store) {
        return res.status(404).json({ success: false, message: 'Store not found' });
      }

      const [updated] = await db
        .update(subscriptionsTable)
        .set({ cancelAtPeriodEnd: true })
        .where(eq(subscriptionsTable.storeId, store.id))
        .returning();

      return res.json({
        success: true,
        message: 'Subscription will not auto-renew at the end of the current billing cycle.',
        data: updated,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  async getInvoices(req: Request, res: Response) {
    try {
      const storeId = req.query.storeId as string;

      const invoices = await rdb().query.subscriptionInvoicesTable.findMany({
        where: storeId ? eq(subscriptionInvoicesTable.storeId, storeId) : undefined,
        with: {
          store: { columns: { id: true, name: true, slug: true } },
          subscription: { with: { plan: true } },
        },
        orderBy: desc(subscriptionInvoicesTable.createdAt),
      });

      return res.json({ success: true, data: invoices });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  },
};
