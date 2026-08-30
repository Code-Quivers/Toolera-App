import { Request, Response } from 'express';
import { prisma } from '../prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { SmsService } from '../services/sms.service.js';

export async function createOrder(req: Request, res: Response) {
  try {
    const {
      customerName,
      customerPhone,
      address,
      district = 'Dhaka',
      area = 'Dhaka',
      items = [],
      subtotal,
      shippingCost = 70,
      discount = 0,
      total,
      paymentMethod = 'COD',
      notes,
    } = req.body;

    if (!customerName || !customerPhone || !address || !items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Customer details and order items are required' });
    }

    const orderNumber = `RM-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        address: address.trim(),
        district: district.trim(),
        area: area.trim(),
        subtotal: Number(subtotal) || Number(total) || 0,
        shippingCost: Number(shippingCost) || 70,
        discount: Number(discount) || 0,
        total: Number(total),
        paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        orderStatus: OrderStatus.PENDING,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || null,
            title: item.title,
            price: Number(item.price),
            quantity: Number(item.quantity || item.qty || 1),
            image: item.image || '',
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Automated Trigger: Send Order Confirmation SMS
    SmsService.onOrderPlaced(newOrder).catch((err) => {
      console.warn("Order placed SMS dispatch failed:", err.message);
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: newOrder,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getOrders(req: AuthRequest, res: Response) {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    const where: any = { deletedAt: null };

    if (status && status !== 'ALL') {
      where.orderStatus = status as OrderStatus;
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { orderNumber: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { customerPhone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.order.count({ where }),
    ]);

    return res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { orderStatus, note } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: { orderStatus: orderStatus as OrderStatus },
    });

    if (note) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: id,
          status: String(orderStatus),
          note,
          changedBy: req.user?.name || 'Admin',
        },
      });
    }

    return res.json({ success: true, message: 'Order status updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Public Customer Order Tracking
 * GET /api/v1/orders/public-track?query=...
 */
export async function publicTrackOrder(req: Request, res: Response) {
  try {
    const query = String(req.query.query || '').trim();
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide an Order Number or Phone Number.' });
    }

    const cleanPhone = query.replace(/[^0-9]/g, '');

    const orders = await prisma.order.findMany({
      where: {
        deletedAt: null,
        OR: [
          { orderNumber: { equals: query, mode: 'insensitive' } },
          { id: query },
          { courierTrackingCode: query },
          ...(cleanPhone.length >= 8 ? [{ customerPhone: { contains: cleanPhone.slice(-8) } }] : []),
        ],
      },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found matching this Order Number or Phone Number.' });
    }

    return res.json({ success: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Record / Upsert Abandoned Checkout Lead
 * POST /api/v1/orders/abandoned-lead
 */
export async function recordAbandonedLead(req: Request, res: Response) {
  try {
    const { customerName, customerPhone, address, district, cartItems, total } = req.body;
    if (!customerPhone || customerPhone.replace(/[^0-9]/g, '').length < 8) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required.' });
    }

    const clean = customerPhone.replace(/[^0-9]/g, '').slice(-8);

    // Upsert recent lead within the last 2 hours
    const existing = await prisma.abandonedLead.findFirst({
      where: {
        customerPhone: { contains: clean },
        isRecovered: false,
        createdAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      },
    });

    let lead;
    if (existing) {
      lead = await prisma.abandonedLead.update({
        where: { id: existing.id },
        data: {
          customerName: customerName || existing.customerName,
          address: address || existing.address,
          district: district || existing.district,
          cartItems: cartItems ? (cartItems as any) : existing.cartItems,
          total: total !== undefined ? Number(total) : existing.total,
        },
      });
    } else {
      lead = await prisma.abandonedLead.create({
        data: {
          customerName: customerName || 'Guest Shopper',
          customerPhone,
          address: address || '',
          district: district || 'Dhaka',
          cartItems: cartItems ? (cartItems as any) : undefined,
          total: total !== undefined ? Number(total) : 0,
        },
      });
    }

    return res.json({ success: true, data: lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Get All Abandoned Leads (Admin Only)
 * GET /api/v1/orders/abandoned-leads
 */
export async function getAbandonedLeads(req: Request, res: Response) {
  try {
    const leads = await prisma.abandonedLead.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.json({ success: true, data: leads });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Mark Abandoned Lead as Recovered
 * PATCH /api/v1/orders/abandoned-leads/:id/recover
 */
export async function markLeadRecovered(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const updated = await prisma.abandonedLead.update({
      where: { id },
      data: { isRecovered: true },
    });
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}