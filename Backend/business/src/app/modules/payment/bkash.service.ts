import { eq } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { paymentSettingsTable } from '../../db/schema.js';

export interface BkashPaymentPayload {
  amount: number;
  orderId: string;
  orderNumber: string;
  customerPhone?: string;
}

const DEFAULT_PAYMENT_SETTINGS_ID = 'default_payment_settings';

export class BkashService {
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

  static async createPayment(payload: BkashPaymentPayload) {
    const settings = await this.getSettings();

    if (!settings.bkashEnabled) {
      throw new Error('bKash payment method is currently disabled by administrator.');
    }

    if (
      settings.bkashType === 'PGW' &&
      settings.bkashAppKey &&
      settings.bkashAppSecret &&
      settings.bkashUsername &&
      settings.bkashPassword
    ) {
      try {
        const tokenRes = await fetch('https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/token/grant', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            username: settings.bkashUsername,
            password: settings.bkashPassword,
          },
          body: JSON.stringify({ app_key: settings.bkashAppKey, app_secret: settings.bkashAppSecret }),
        });

        const tokenData = (await tokenRes.json()) as any;
        const idToken = tokenData?.id_token;
        if (!idToken) throw new Error(tokenData?.statusMessage || 'Failed to authenticate with bKash API');

        const backendBase = process.env.BACKEND_URL || 'http://localhost:5000';
        const createRes = await fetch('https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: idToken,
            'X-APP-Key': settings.bkashAppKey,
          },
          body: JSON.stringify({
            mode: '0011',
            payerReference: payload.customerPhone || '01700000000',
            callbackURL: `${backendBase}/api/v1/payment/bkash/callback?orderId=${payload.orderId}`,
            amount: String(payload.amount),
            currency: 'BDT',
            intent: 'sale',
            merchantInvoiceNumber: payload.orderNumber,
          }),
        });

        const paymentData = (await createRes.json()) as any;
        if (paymentData?.paymentID && paymentData?.bkashURL) {
          return { mode: 'PGW', paymentId: paymentData.paymentID, bkashURL: paymentData.bkashURL };
        }
      } catch (err: any) {
        console.warn('bKash PGW error, falling back to sandbox flow:', err.message);
      }
    }

    const mockPaymentId = `BKASH_MOCK_${Date.now()}`;
    const mockTrxId = `TRX${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      mode: 'SANDBOX_SIMULATOR',
      paymentId: mockPaymentId,
      mockTrxId,
      merchantNumber: settings.bkashMerchantNumber || '01712345678',
      instructions: 'Send Money or Make Payment to the bKash Merchant Number, then submit your TrxID.',
    };
  }

  static async executePayment(_paymentId: string) {
    const mockTrxId = `TRX${Math.floor(10000000 + Math.random() * 90000000)}`;
    return { success: true, transactionStatus: 'Completed', trxID: mockTrxId, amount: '100', currency: 'BDT' };
  }
}
