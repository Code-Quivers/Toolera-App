import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { subscriptionPlansTable, subscriptionsTable } from '../../db/schema.js';

export async function activateSubscription(req: Request, res: Response) {
  try {
    const { storeId, planSlug, billingCycle = 'MONTHLY', paymentMethod = 'BKASH', amount = 0, trxId } = req.body;

    if (!storeId || !planSlug) {
      return res.status(400).json({ success: false, message: 'storeId and planSlug are required.' });
    }

    const [plan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.slug, planSlug)).limit(1);
    if (!plan) return res.status(404).json({ success: false, message: `Plan "${planSlug}" not found.` });

    const now = new Date();
    const isFreeTrial = plan.priceMonthly === 0;
    const trialEndsAt = isFreeTrial ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
    const periodEnd = isFreeTrial
      ? trialEndsAt!
      : billingCycle === 'YEARLY'
        ? new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
        : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());

    const [existing] = await db.select({ id: subscriptionsTable.id }).from(subscriptionsTable).where(eq(subscriptionsTable.storeId, storeId)).limit(1);

    let sub;
    if (existing) {
      [sub] = await db.update(subscriptionsTable).set({
        planId: plan.id,
        planSlug: plan.slug,
        status: isFreeTrial ? 'TRIALING' : 'ACTIVE',
        billingCycle: billingCycle as 'MONTHLY' | 'YEARLY',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEndsAt,
        paymentMethod,
        lastPaymentTrxId: trxId ?? null,
        lastPaymentAmount: amount,
        lastPaymentDate: amount > 0 ? now : null,
        cancelAtPeriodEnd: false,
      }).where(eq(subscriptionsTable.storeId, storeId)).returning();
    } else {
      [sub] = await db.insert(subscriptionsTable).values({
        storeId,
        planId: plan.id,
        planSlug: plan.slug,
        status: isFreeTrial ? 'TRIALING' : 'ACTIVE',
        billingCycle: billingCycle as 'MONTHLY' | 'YEARLY',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        trialEndsAt,
        paymentMethod,
        lastPaymentTrxId: trxId ?? null,
        lastPaymentAmount: amount,
        lastPaymentDate: amount > 0 ? now : null,
      }).returning();
    }

    return res.json({ success: true, message: 'Subscription activated.', data: { subscription: sub, plan } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getPlans(_req: Request, res: Response) {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.isActive, true))
      .orderBy(subscriptionPlansTable.position);

    return res.json({ success: true, data: plans });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getMySubscription(req: Request, res: Response) {
  try {
    const storeId = (req as any).user?.storeId;
    if (!storeId) return res.status(400).json({ success: false, message: 'storeId required.' });

    const [sub] = await db
      .select()
      .from(subscriptionsTable)
      .where(eq(subscriptionsTable.storeId, storeId))
      .limit(1);

    return res.json({ success: true, data: sub ?? null });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
