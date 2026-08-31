import { Request, Response } from 'express';
import { eq, or } from 'drizzle-orm';
import { db, rdb } from '../db/index.js';
import { paymentSettingsTable, ordersTable, paymentTransactionsTable } from '../db/schema.js';
import { BkashService } from '../services/bkash.service.js';
import { NagadService } from '../services/nagad.service.js';

export class PaymentController {
  static async getSettings(req: Request, res: Response) {
    try {
      let settings = await rdb()
        .select()
        .from(paymentSettingsTable)
        .where(eq(paymentSettingsTable.id, 'default_payment_settings'))
        .limit(1)
        .then(r => r[0] ?? null);

      if (!settings) {
        [settings] = await db.insert(paymentSettingsTable).values({
          id: 'default_payment_settings',
          codEnabled: true,
          bkashEnabled: true,
          bkashType: 'MANUAL_NUMBER',
          bkashMerchantNumber: '01712345678',
          nagadEnabled: true,
          nagadType: 'MANUAL_NUMBER',
          nagadMerchantNumber: '01712345678',
        }).returning();
      }

      return res.json({ success: true, data: settings });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateSettings(req: Request, res: Response) {
    try {
      const data = req.body;
      const [updated] = await db.insert(paymentSettingsTable)
        .values({ id: 'default_payment_settings', ...data })
        .onConflictDoUpdate({ target: paymentSettingsTable.id, set: data })
        .returning();

      return res.json({ success: true, message: 'Payment settings updated successfully!', data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async initBkash(req: Request, res: Response) {
    try {
      const { amount, orderId, orderNumber, customerPhone } = req.body;
      const result = await BkashService.createPayment({ amount: Number(amount), orderId, orderNumber, customerPhone });
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async initNagad(req: Request, res: Response) {
    try {
      const { amount, orderId, orderNumber, customerPhone } = req.body;
      const result = await NagadService.createPayment({ amount: Number(amount), orderId, orderNumber, customerPhone });
      return res.json({ success: true, data: result });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  static async verifyManual(req: Request, res: Response) {
    try {
      const { orderId, paymentMethod, transactionId, senderPhone } = req.body;

      if (!transactionId || !transactionId.trim()) {
        return res.status(400).json({ success: false, message: 'Transaction ID (TrxID) is required.' });
      }

      const existing = await rdb()
        .select()
        .from(ordersTable)
        .where(or(eq(ordersTable.id, orderId), eq(ordersTable.orderNumber, orderId)))
        .limit(1)
        .then(r => r[0] ?? null);

      if (existing) {
        const [updated] = await db.update(ordersTable).set({
          paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : 'BKASH',
          paymentStatus: 'PAID',
          transactionId: transactionId.trim(),
          senderPhone: senderPhone ? senderPhone.trim() : null,
        }).where(eq(ordersTable.id, existing.id)).returning();

        await db.insert(paymentTransactionsTable).values({
          orderId: existing.id,
          provider: paymentMethod === 'NAGAD' ? 'NAGAD' : 'BKASH',
          transactionId: transactionId.trim(),
          amount: existing.total,
          status: 'PAID',
          metadata: { senderPhone },
        });

        return res.json({ success: true, message: 'Payment TrxID attached and recorded successfully!', data: updated });
      }

      return res.json({ success: true, message: 'Payment TrxID verified in sandbox mode.', data: { transactionId, status: 'PAID' } });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
