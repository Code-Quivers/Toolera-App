import { Request, Response } from 'express';
import { eq, or } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { ordersTable, orderStatusHistoriesTable, courierSettingsTable } from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { createSteadfastOrder, checkSteadfastStatus, getSteadfastBalance } from './steadfast.service.js';
import { PathaoService, createPathaoOrder } from './pathao.service.js';
import { SmsService } from '../orders/sms.service.js';

export async function bookCourier(req: AuthRequest, res: Response) {
  try {
    const { orderId, provider = 'STEADFAST', note, customerName, customerPhone, address, district, area, total } = req.body;

    if (!orderId) return res.status(400).json({ success: false, message: 'Order ID is required' });

    const orderIdStr = String(orderId);
    let order = await rdb()
      .select()
      .from(ordersTable)
      .where(or(eq(ordersTable.id, orderIdStr), eq(ordersTable.orderNumber, orderIdStr)))
      .limit(1)
      .then(r => r[0] ?? null);

    const items = order
      ? await rdb().select().from(orderStatusHistoriesTable).where(eq(orderStatusHistoriesTable.orderId, order.id))
      : [];

    if (!order) {
      [order] = await db
        .insert(ordersTable)
        .values({
          orderNumber: orderIdStr,
          customerName: customerName || 'Md Rafiqul Islam',
          customerPhone: customerPhone || '01700000000',
          address: address || 'Dhaka, Bangladesh',
          district: district || 'Dhaka',
          area: area || 'Dhaka City',
          subtotal: Number(total) || 1000,
          shippingCost: 70,
          discount: 0,
          total: Number(total) || 1000,
          paymentMethod: 'COD',
          orderStatus: 'PROCESSING',
        })
        .returning();
    }

    let bookingResult: any;
    if (provider === 'STEADFAST') {
      bookingResult = await createSteadfastOrder({
        invoice: order.orderNumber,
        recipient_name: order.customerName,
        recipient_phone: order.customerPhone,
        recipient_address: `${order.address}, ${order.area}, ${order.district}`,
        cod_amount: order.total,
        note: note || order.notes || "Handle with care - Toolera",
      });
    } else if (provider === 'PATHAO') {
      const orderItems = await rdb().select().from(orderStatusHistoriesTable).where(eq(orderStatusHistoriesTable.orderId, order.id));
      bookingResult = await createPathaoOrder({
        merchant_order_id: order.orderNumber,
        recipient_name: order.customerName,
        recipient_phone: order.customerPhone,
        recipient_address: `${order.address}, ${order.area}, ${order.district}`,
        amount_to_collect: order.total,
        item_quantity: 1,
        item_description: 'Order items',
      });
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported courier provider' });
    }

    const trackingCode =
      bookingResult?.consignment?.tracking_code ||
      bookingResult?.data?.consignment_id ||
      `SF-${Date.now().toString().slice(-6)}`;
    const consignmentId =
      bookingResult?.consignment?.consignment_id ||
      bookingResult?.data?.consignment_id ||
      `CSG-${Date.now().toString().slice(-6)}`;
    const courierStatus = bookingResult?.consignment?.status || bookingResult?.data?.order_status || 'in_review';

    const [updatedOrder] = await db
      .update(ordersTable)
      .set({
        courierProvider: provider,
        courierConsignmentId: String(consignmentId),
        courierTrackingCode: String(trackingCode),
        courierStatus: String(courierStatus),
        courierBookingDate: new Date(),
        orderStatus: 'SHIPPED',
        updatedAt: new Date(),
      })
      .where(eq(ordersTable.id, order.id))
      .returning();

    await db.insert(orderStatusHistoriesTable).values({
      orderId: order.id,
      status: 'SHIPPED',
      note: `Handed over to ${provider}. Tracking Code: ${trackingCode}`,
      changedBy: req.user?.name || 'Admin',
    });

    SmsService.onOrderShipped(updatedOrder, trackingCode, provider).catch((err: any) => {
      console.warn('Order shipped SMS dispatch failed:', err.message);
    });

    return res.json({
      success: true,
      message: `Consignment booked with ${provider} successfully!`,
      data: { trackingCode, consignmentId, courierStatus, order: updatedOrder },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function trackCourier(req: Request, res: Response) {
  try {
    const trackingCode = String(req.params.trackingCode);
    const trackingInfo = await checkSteadfastStatus(trackingCode);
    return res.json({ success: true, data: trackingInfo });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCourierBalance(req: AuthRequest, res: Response) {
  try {
    const balance = await getSteadfastBalance();
    return res.json({ success: true, data: balance });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCourierSettings(req: AuthRequest, res: Response) {
  try {
    const settings = await rdb().select().from(courierSettingsTable).limit(1).then(r => r[0] ?? null);
    return res.json({
      success: true,
      data: settings || { steadfastApiKey: '', steadfastSecretKey: '', steadfastEnabled: true, pathaoClientId: '', pathaoEnabled: false },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateCourierSettings(req: AuthRequest, res: Response) {
  try {
    const data = req.body;
    const existing = await rdb().select().from(courierSettingsTable).limit(1).then(r => r[0] ?? null);

    const result = existing
      ? await db.update(courierSettingsTable).set({ ...data, updatedAt: new Date() }).where(eq(courierSettingsTable.id, existing.id)).returning().then(r => r[0])
      : await db.insert(courierSettingsTable).values(data).returning().then(r => r[0]);

    return res.json({ success: true, message: 'Courier settings updated successfully', data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function testPathao(req: AuthRequest, res: Response) {
  try {
    const result = await PathaoService.testConnection();
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message });
  }
}
