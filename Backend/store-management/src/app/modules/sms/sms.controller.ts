import { Request, Response } from 'express';
import { desc } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { smsSettingsTable, smsLogsTable } from '../../db/schema.js';
import { SmsService } from './sms.service.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

export class SmsController {
  static async getSettings(req: AuthRequest, res: Response) {
    try {
      const settings = await SmsService.getSettings();
      return res.json({ success: true, data: settings });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateSettings(req: AuthRequest, res: Response) {
    try {
      const data = req.body;
      const [updated] = await db
        .insert(smsSettingsTable)
        .values({ id: 'default_sms_settings', ...data })
        .onConflictDoUpdate({ target: smsSettingsTable.id, set: data })
        .returning();

      return res.json({
        success: true,
        message: 'SMS Notification Gateway settings saved successfully!',
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getBalance(req: AuthRequest, res: Response) {
    try {
      const balance = await SmsService.checkBalance();
      return res.json({ success: true, data: balance });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

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

  static async getLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await rdb()
        .select()
        .from(smsLogsTable)
        .orderBy(desc(smsLogsTable.createdAt))
        .limit(30);

      return res.json({ success: true, data: logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
