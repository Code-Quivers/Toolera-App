import { eq } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { paymentSettingsTable } from '../../db/schema.js';

export interface NagadPaymentPayload {
  amount: number;
  orderId: string;
  orderNumber: string;
  customerPhone?: string;
}

const DEFAULT_PAYMENT_SETTINGS_ID = 'default_payment_settings';

export class NagadService {
  private static async getSettings() {
    let settings = await rdb()
      .select()
      .from(paymentSettingsTable)
      .where(eq(paymentSettingsTable.id, DEFAULT_PAYMENT_SETTINGS_ID))
      .limit(1)
      .then(r => r[0] ?? null);

    if (!settings) {
      [settings] = await db
        .insert(paymentSettingsTable)
        .values({
          id: DEFAULT_PAYMENT_SETTINGS_ID,
          codEnabled: true,
          bkashEnabled: true,
          bkashType: 'MANUAL_NUMBER',
          bkashMerchantNumber: '01712345678',
          nagadEnabled: true,
          nagadType: 'MANUAL_NUMBER',
          nagadMerchantNumber: '01712345678',
        })
        .onConflictDoNothing()
        .returning();
    }

    return settings!;
  }

  static async createPayment(payload: NagadPaymentPayload) {
    const settings = await this.getSettings();

    if (!settings.nagadEnabled) {
      throw new Error('Nagad payment method is currently disabled by administrator.');
    }

    const mockPaymentRefId = `NAGAD_${Date.now()}`;
    const mockTrxId = `NG${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      mode: 'SANDBOX_SIMULATOR',
      paymentRefId: mockPaymentRefId,
      mockTrxId,
      merchantNumber: settings.nagadMerchantNumber || '01712345678',
      instructions: 'Send Money or Make Payment to the Nagad Merchant Number, then submit your TrxID.',
    };
  }

  static async verifyPayment(_paymentRefId: string) {
    const mockTrxId = `NG${Math.floor(10000000 + Math.random() * 90000000)}`;
    return { status: 'Success', statusCode: '000_0000', trxID: mockTrxId, message: 'Payment successfully verified with Nagad.' };
  }
}
