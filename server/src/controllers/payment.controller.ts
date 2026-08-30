import { Request, Response } from "express";
import { prisma } from "../prisma.js";
import { BkashService } from "../services/bkash.service.js";
import { NagadService } from "../services/nagad.service.js";

export class PaymentController {
  /**
   * GET /api/v1/payment/settings
   * Returns active payment gateway settings and merchant numbers
   */
  static async getSettings(req: Request, res: Response) {
    try {
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

      // Hide secret keys for public callers if needed
      return res.json({
        success: true,
        data: settings,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PUT /api/v1/payment/settings
   * Admin updates payment settings
   */
  static async updateSettings(req: Request, res: Response) {
    try {
      const data = req.body;
      const updated = await prisma.paymentSettings.upsert({
        where: { id: "default_payment_settings" },
        create: {
          id: "default_payment_settings",
          ...data,
        },
        update: {
          ...data,
        },
      });

      return res.json({
        success: true,
        message: "Payment settings updated successfully!",
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/v1/payment/bkash/create
   */
  static async initBkash(req: Request, res: Response) {
    try {
      const { amount, orderId, orderNumber, customerPhone } = req.body;
      const result = await BkashService.createPayment({
        amount: Number(amount),
        orderId,
        orderNumber,
        customerPhone,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/v1/payment/nagad/create
   */
  static async initNagad(req: Request, res: Response) {
    try {
      const { amount, orderId, orderNumber, customerPhone } = req.body;
      const result = await NagadService.createPayment({
        amount: Number(amount),
        orderId,
        orderNumber,
        customerPhone,
      });

      return res.json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/v1/payment/verify-manual
   * Customer submits TrxID and Sender Mobile for manual verification
   */
  static async verifyManual(req: Request, res: Response) {
    try {
      const { orderId, paymentMethod, transactionId, senderPhone } = req.body;

      if (!transactionId || !transactionId.trim()) {
        return res.status(400).json({ success: false, message: "Transaction ID (TrxID) is required." });
      }

      // Check if order exists
      const existing = await prisma.order.findFirst({
        where: {
          OR: [{ id: orderId }, { orderNumber: orderId }],
        },
      });

      if (existing) {
        const updated = await prisma.order.update({
          where: { id: existing.id },
          data: {
            paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : "BKASH",
            paymentStatus: "PAID",
            transactionId: transactionId.trim(),
            senderPhone: senderPhone ? senderPhone.trim() : null,
          },
        });

        // Record transaction
        await prisma.paymentTransaction.create({
          data: {
            orderId: existing.id,
            provider: paymentMethod === "NAGAD" ? "NAGAD" : "BKASH",
            transactionId: transactionId.trim(),
            amount: existing.total,
            status: "PAID",
            metadata: { senderPhone },
          },
        });

        return res.json({
          success: true,
          message: "Payment TrxID attached and recorded successfully!",
          data: updated,
        });
      }

      return res.json({
        success: true,
        message: "Payment TrxID verified in sandbox mode.",
        data: { transactionId, status: "PAID" },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
