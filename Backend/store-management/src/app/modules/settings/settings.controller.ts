import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import {
  siteSettingsTable, shippingSettingsTable, paymentSettingsTable,
  courierSettingsTable, smsSettingsTable,
} from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';

async function upsert<T extends { id: string }>(
  table: any,
  data: any,
  defaultId?: string
): Promise<any> {
  const existing = await rdb().select({ id: table.id }).from(table).limit(1).then((r: any[]) => r[0] ?? null);
  if (existing) {
    return (await db.update(table).set(data).where(eq(table.id, existing.id)).returning())[0];
  }
  const insertData = defaultId ? { id: defaultId, ...data } : { ...data };
  return (await db.insert(table).values(insertData).returning())[0];
}

export async function getSettings(_req: Request, res: Response) {
  try {
    const [site, shipping, payment] = await Promise.all([
      rdb().select().from(siteSettingsTable).limit(1).then((r: any[]) => r[0] ?? null),
      rdb().select().from(shippingSettingsTable).limit(1).then((r: any[]) => r[0] ?? null),
      rdb().select().from(paymentSettingsTable).limit(1).then((r: any[]) => r[0] ?? null),
    ]);
    return res.json({ success: true, data: { site, shipping, payment } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Shipping ───────────────────────────────────────────────────────────────

export async function getShippingSettings(_req: Request, res: Response) {
  try {
    const data = await rdb().select().from(shippingSettingsTable).limit(1).then((r: any[]) => r[0] ?? null);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateShippingSettings(req: AuthRequest, res: Response) {
  try {
    const updated = await upsert(shippingSettingsTable, req.body);
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Payment ────────────────────────────────────────────────────────────────

export async function getPaymentSettings(_req: Request, res: Response) {
  try {
    const data = await rdb().select().from(paymentSettingsTable).limit(1).then((r: any[]) => r[0] ?? null);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updatePaymentSettings(req: AuthRequest, res: Response) {
  try {
    const updated = await upsert(paymentSettingsTable, req.body, 'default_payment_settings');
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// ── Courier ────────────────────────────────────────────────────────────────

export async function getCourierSettings(_req: Request, res: Response) {
  try {
    const data = await rdb().select().from(courierSettingsTable).limit(1).then((r: any[]) => r[0] ?? null);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateCourierSettings(req: AuthRequest, res: Response) {
  try {
    const updated = await upsert(courierSettingsTable, req.body, 'default_courier_settings');
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCourierBalance(_req: Request, res: Response) {
  return res.json({ success: true, data: { balance: 0, currency: 'BDT', provider: 'steadfast' } });
}

export async function testPathaoConnection(_req: Request, res: Response) {
  return res.json({ success: false, message: 'Pathao credentials not configured' });
}

// ── SMS ────────────────────────────────────────────────────────────────────

export async function getSmsSettings(_req: Request, res: Response) {
  try {
    const data = await rdb().select().from(smsSettingsTable).limit(1).then((r: any[]) => r[0] ?? null);
    return res.json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateSmsSettings(req: AuthRequest, res: Response) {
  try {
    const updated = await upsert(smsSettingsTable, req.body, 'default_sms_settings');
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getSmsBalance(_req: Request, res: Response) {
  return res.json({ success: true, data: { balance: 0, provider: 'greenweb' } });
}

export async function sendTestSms(_req: Request, res: Response) {
  return res.json({ success: false, message: 'SMS gateway not configured' });
}

// ── Invoice ────────────────────────────────────────────────────────────────

export async function getInvoiceSettings(_req: Request, res: Response) {
  return res.json({ success: true, data: { footerNote: '', showLogo: true } });
}

export async function updateInvoiceSettings(_req: AuthRequest, res: Response) {
  return res.json({ success: true, data: {} });
}

// ── Backup ─────────────────────────────────────────────────────────────────

export async function exportBackup(_req: Request, res: Response) {
  return res.json({ success: true, data: { message: 'Backup export not yet implemented' } });
}

export async function restoreBackup(_req: AuthRequest, res: Response) {
  return res.json({ success: false, message: 'Backup restore not yet implemented' });
}
