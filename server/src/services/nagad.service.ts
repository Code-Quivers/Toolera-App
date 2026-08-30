import { prisma } from "../prisma.js";

export interface NagadPaymentPayload {
  amount: number;
  orderId: string;
  orderNumber: string;
  customerPhone?: string;
}

export class NagadService {
  private static async getSettings() {
    let settings = await prisma.paymentSettings.findUnique({
      where: { id: "default_payment_settings" },
    });

    if (!settings) {
      settings = await prisma.paymentSettings.create({
        data: {
          id: "default_payment_settings",
          codEnabled: true,
          bkashEnabled: true,
          bkashType: "MANUAL_NUMBER",
          bkashMerchantNumber: "01712345678",
          nagadEnabled: true,
          nagadType: "MANUAL_NUMBER",
          nagadMerchantNumber: "01712345678",
        },
      });
    }

    return settings;
  }

  /**
   * Initializes a Nagad payment session.
   */
  static async createPayment(payload: NagadPaymentPayload) {
    const settings = await this.getSettings();

    if (!settings.nagadEnabled) {
      throw new Error("Nagad payment method is currently disabled by administrator.");
    }

    // Default Sandbox / Simulator Flow
    const mockPaymentRefId = `NAGAD_${Date.now()}`;
    const mockTrxId = `NG${Math.floor(10000000 + Math.random() * 90000000)}`;

    return {
      mode: "SANDBOX_SIMULATOR",
      paymentRefId: mockPaymentRefId,
      mockTrxId,
      merchantNumber: settings.nagadMerchantNumber || "01712345678",
      instructions: "Send Money or Make Payment to the Nagad Merchant Number, then submit your TrxID.",
    };
  }

  /**
   * Verifies Nagad payment
   */
  static async verifyPayment(paymentRefId: string) {
    const mockTrxId = `NG${Math.floor(10000000 + Math.random() * 90000000)}`;
    return {
      status: "Success",
      statusCode: "000_0000",
      trxID: mockTrxId,
      message: "Payment successfully verified with Nagad.",
    };
  }
}
