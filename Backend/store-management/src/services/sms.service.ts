import { eq } from 'drizzle-orm';
import { db, rdb } from '../db/index.js';
import { smsSettingsTable, smsLogsTable } from '../db/schema.js';

export interface SendSmsOptions {
  to: string;
  message: string;
  templateType?: 'ORDER_PLACED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'CUSTOM';
}

export class SmsService {
  static async getSettings() {
    let settings = await rdb()
      .select()
      .from(smsSettingsTable)
      .where(eq(smsSettingsTable.id, 'default_sms_settings'))
      .limit(1)
      .then(r => r[0] ?? null);

    if (!settings) {
      [settings] = await db.insert(smsSettingsTable).values({
        id: 'default_sms_settings',
        provider: 'GREENWEB',
        apiKey: '',
        senderId: '',
        enabled: true,
        orderPlacedEnabled: true,
        orderShippedEnabled: true,
        orderDeliveredEnabled: true,
      }).returning();
    }

    return settings;
  }

  static formatMessage(template: string, vars: Record<string, any>): string {
    let msg = template;
    for (const [key, val] of Object.entries(vars)) {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      msg = msg.replace(regex, String(val || ''));
    }
    return msg.trim();
  }

  static async sendSms(options: SendSmsOptions) {
    const settings = await this.getSettings();

    if (!settings.enabled) {
      return { success: false, message: 'SMS Gateway is globally disabled.' };
    }

    let cleanPhone = options.to.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('880')) cleanPhone = cleanPhone.slice(2);
    if (!cleanPhone.startsWith('01')) cleanPhone = `0${cleanPhone}`;

    const provider = settings.provider || 'GREENWEB';
    const apiKey = settings.apiKey?.trim();
    const senderId = settings.senderId?.trim();

    if (provider === 'GREENWEB' && apiKey) {
      try {
        const url = new URL('https://api.greenweb.com.bd/api.php');
        url.searchParams.append('token', apiKey);
        url.searchParams.append('to', `88${cleanPhone}`);
        url.searchParams.append('message', options.message);

        const res = await fetch(url.toString());
        const rawText = await res.text();
        const isSuccess = rawText.toLowerCase().includes('ok') || rawText.toLowerCase().includes('success');

        await db.insert(smsLogsTable).values({
          recipientPhone: cleanPhone,
          message: options.message,
          provider: 'GREENWEB',
          status: isSuccess ? 'SENT' : 'FAILED',
          responseRaw: rawText.slice(0, 255),
        });

        return {
          success: isSuccess,
          provider: 'GREENWEB',
          message: isSuccess ? 'SMS sent successfully via Greenweb BD!' : rawText,
        };
      } catch (err: any) {
        console.warn('Greenweb SMS send error:', err.message);
      }
    }

    if (provider === 'BULKSMSBD' && apiKey) {
      try {
        const url = new URL('http://bulksmsbd.net/api/smsapi');
        url.searchParams.append('api_key', apiKey);
        url.searchParams.append('type', 'text');
        url.searchParams.append('number', cleanPhone);
        if (senderId) url.searchParams.append('senderid', senderId);
        url.searchParams.append('message', options.message);

        const res = await fetch(url.toString());
        const data = (await res.json()) as any;
        const isSuccess = data?.response_code === 202 || String(data?.response_code).startsWith('2');

        await db.insert(smsLogsTable).values({
          recipientPhone: cleanPhone,
          message: options.message,
          provider: 'BULKSMSBD',
          status: isSuccess ? 'SENT' : 'FAILED',
          responseRaw: JSON.stringify(data).slice(0, 255),
        });

        return {
          success: isSuccess,
          provider: 'BULKSMSBD',
          message: isSuccess ? 'SMS sent successfully via BulkSMSBD!' : data?.error_message || 'Failed',
        };
      } catch (err: any) {
        console.warn('BulkSMSBD send error:', err.message);
      }
    }

    await db.insert(smsLogsTable).values({
      recipientPhone: cleanPhone,
      message: options.message,
      provider: `${provider}_SIMULATOR`,
      status: 'MOCK',
      responseRaw: 'Simulated Sandbox dispatch. SMS logged successfully.',
    });

    return {
      success: true,
      provider: `${provider} (Sandbox Simulator)`,
      message: `[Simulated SMS to ${cleanPhone}]: ${options.message}`,
    };
  }

  static async checkBalance() {
    const settings = await this.getSettings();
    const apiKey = settings.apiKey?.trim();

    if (!apiKey) {
      return { balance: 100, formatted: '100 SMS (Sandbox Simulator)', currency: 'SMS' };
    }

    if (settings.provider === 'GREENWEB') {
      try {
        const res = await fetch(`https://api.greenweb.com.bd/greb_sms_balance.php?token=${apiKey}`);
        const text = await res.text();
        const num = parseFloat(text);
        return {
          balance: isNaN(num) ? text : num,
          formatted: isNaN(num) ? text : `৳${num.toFixed(2)} (Greenweb)`,
          currency: 'BDT',
        };
      } catch {}
    }

    if (settings.provider === 'BULKSMSBD') {
      try {
        const res = await fetch(`http://bulksmsbd.net/api/getBalanceApi?api_key=${apiKey}`);
        const data = (await res.json()) as any;
        return {
          balance: data?.balance || 0,
          formatted: `${data?.balance || 0} SMS (BulkSMSBD)`,
          currency: 'SMS',
        };
      } catch {}
    }

    return { balance: 100, formatted: '100 SMS (Sandbox)', currency: 'SMS' };
  }

  static async onOrderPlaced(order: any) {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.orderPlacedEnabled) return;

    const formatted = this.formatMessage(settings.orderPlacedTemplate, {
      customer_name: order.customerName,
      order_number: order.orderNumber,
      total: order.total,
      store_name: "Raifa's Mart",
    });

    return this.sendSms({ to: order.customerPhone, message: formatted, templateType: 'ORDER_PLACED' });
  }

  static async onOrderShipped(order: any, trackingCode: string, providerName: string) {
    const settings = await this.getSettings();
    if (!settings.enabled || !settings.orderShippedEnabled) return;

    const formatted = this.formatMessage(settings.orderShippedTemplate, {
      customer_name: order.customerName,
      order_number: order.orderNumber,
      courier_name: providerName,
      tracking_code: trackingCode,
      store_name: "Raifa's Mart",
    });

    return this.sendSms({ to: order.customerPhone, message: formatted, templateType: 'ORDER_SHIPPED' });
  }
}
