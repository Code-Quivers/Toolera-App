import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { SmsService } from '../services/sms.service.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export class SmsController {
  /**
   * GET /api/v1/sms/settings
   */
  static async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await SmsService.getSettings();
      return res.json({ success: true, data: settings });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * PUT /api/v1/sms/settings
   */
  static async updateSettings(req: AuthRequest, res: Response) {
    try {
      const data = req.body;
      const updated = await prisma.smsSettings.upsert({
        where: { id: 'default_sms_settings' },
        create: {
          id: 'default_sms_settings',
          ...data,
        },
        update: {
          ...data,
        },
      });

      return res.json({
        success: true,
        message: 'SMS Notification Gateway settings saved successfully!',
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/v1/sms/balance
   */
  static async getBalance(req: AuthRequest, res: Response) {
    try {
      const balance = await SmsService.checkBalance();
      return res.json({ success: true, data: balance });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * POST /api/v1/sms/test
   * Send instant test SMS to an admin or customer mobile
   */
  static async sendTestSms(req: AuthRequest, res: Response) {
    try {
      const { phone, message } = req.body;

      if (!phone) {
        return res.status(400).json({ success: false, message: 'Recipient phone number is required.' });
      }

      const result = await SmsService.sendSms({
        to: phone,
        message: message || "Hello from Raifa's Mart! Your SMS Gateway is connected and working perfectly.",
        templateType: 'CUSTOM',
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * GET /api/v1/sms/logs
   */
  static async getLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await prisma.smsLog.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
      });

      return res.json({ success: true, data: logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
