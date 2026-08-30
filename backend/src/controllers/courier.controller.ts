import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { createSteadfastOrder, checkSteadfastStatus, getSteadfastBalance } from '../services/steadfast.service.js';
import { PathaoService, createPathaoOrder } from '../services/pathao.service.js';
import { SmsService } from '../services/sms.service.js';
import { OrderStatus } from '@prisma/client';

export async function bookCourier(req: AuthRequest, res: Response) {
  try {
    const { orderId, provider = 'STEADFAST', note, customerName, customerPhone, address, district, area, total } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: String(orderId) },
          { orderNumber: String(orderId) },
        ],
      },
      include: { items: true },
    });

    // Auto-create in PostgreSQL if the order was submitted previously in local state
    if (!order) {
      const orderNumber = String(orderId);
      order = await prisma.order.create({
        data: {
          orderNumber,
          customerName: customerName || "Md Rafiqul Islam",
          customerPhone: customerPhone || "01700000000",
          address: address || "Dhaka, Bangladesh",
          district: district || "Dhaka",
          area: area || "Dhaka City",
          subtotal: Number(total) || 1000,
          shippingCost: 70,
          total: Number(total) || 1000,
          paymentMethod: "COD",
          orderStatus: OrderStatus.PROCESSING,
        },
        include: { items: true },
      });
    }

    let bookingResult: any;

    if (provider === 'STEADFAST') {
      bookingResult = await createSteadfastOrder({
        invoice: order.orderNumber,
        recipient_name: order.customerName,
        recipient_phone: order.customerPhone,
        recipient_address: `${order.address}, ${order.area}, ${order.district}`,
        cod_amount: order.total,
        note: note || order.notes || "Handle with care - Raifa's Mart",
      });
    } else if (provider === 'PATHAO') {
      bookingResult = await createPathaoOrder({
        merchant_order_id: order.orderNumber,
        recipient_name: order.customerName,
        recipient_phone: order.customerPhone,
        recipient_address: `${order.address}, ${order.area}, ${order.district}`,
        amount_to_collect: order.total,
        item_quantity: order.items.reduce((sum, it) => sum + it.quantity, 0) || 1,
        item_description: order.items.map((i) => i.title).join(', ').slice(0, 100),
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

    // Update order with courier details and set status to SHIPPED
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        courierProvider: provider,
        courierConsignmentId: String(consignmentId),
        courierTrackingCode: String(trackingCode),
        courierStatus: String(courierStatus),
        courierBookingDate: new Date(),
        orderStatus: OrderStatus.SHIPPED,
      },
    });

    // Record status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        status: 'SHIPPED',
        note: `Handed over to ${provider}. Tracking Code: ${trackingCode}`,
        changedBy: req.user?.name || 'Admin',
      },
    });

    // Automated Trigger: Send Order Shipped SMS with Tracking Code
    SmsService.onOrderShipped(updatedOrder, trackingCode, provider).catch((err) => {
      console.warn("Order shipped SMS dispatch failed:", err.message);
    });

    return res.json({
      success: true,
      message: `Consignment booked with ${provider} successfully!`,
      data: {
        trackingCode,
        consignmentId,
        courierStatus,
        order: updatedOrder,
      },
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
    const settings = await prisma.courierSettings.findFirst();
    return res.json({
      success: true,
      data: settings || {
        steadfastApiKey: '',
        steadfastSecretKey: '',
        steadfastEnabled: true,
        pathaoClientId: '',
        pathaoEnabled: false,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateCourierSettings(req: AuthRequest, res: Response) {
  try {
    const data = req.body;
    const existing = await prisma.courierSettings.findFirst();

    const updated = existing
      ? await prisma.courierSettings.update({ where: { id: existing.id }, data })
      : await prisma.courierSettings.create({ data });

    return res.json({ success: true, message: 'Courier settings updated successfully', data: updated });
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