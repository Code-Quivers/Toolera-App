import { Request, Response } from 'express';
import { eq, isNull, desc, or, ilike, and, gte, count } from 'drizzle-orm';
import { db, rdb } from '../../db/index.js';
import { ordersTable, orderItemsTable, orderStatusHistoriesTable, abandonedLeadsTable } from '../../db/schema.js';
import { AuthRequest } from '../../middlewares/auth.middleware.js';
import { SmsService } from './sms.service.js';
import { KafkaClient } from '../../shared/kafka.js';
import { TOPICS, OrderCreatedEvent, OrderStatusChangedEvent } from '../../shared/events.js';

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

    const newOrder = await db.transaction(async (tx) => {
      const [order] = await tx.insert(ordersTable).values({
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
        paymentStatus: 'PENDING',
        orderStatus: 'PENDING',
        notes: notes || null,
      }).returning();

      await tx.insert(orderItemsTable).values(
        items.map((item: any) => ({
          orderId: order.id,
          productId: item.productId || null,
          title: item.title,
          price: Number(item.price),
          quantity: Number(item.quantity || item.qty || 1),
          image: item.image || '',
        }))
      );

      return order;
    });

    const orderWithItems = await rdb().query.ordersTable.findFirst({
      where: eq(ordersTable.id, newOrder.id),
      with: { items: true },
    });

    // Kafka — order event stream (analytics, audit, future consumers)
    const kafkaEvent: OrderCreatedEvent = {
      type: 'order.created',
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      total: Number(newOrder.total),
      paymentMethod: newOrder.paymentMethod,
      itemCount: items.length,
      createdAt: new Date().toISOString(),
    };
    KafkaClient.publish(TOPICS.ORDER_EVENTS, kafkaEvent).catch(() => {});

    // RabbitMQ — SMS notification job
    SmsService.onOrderPlaced(orderWithItems).catch((err: any) => {
      console.warn('Order placed SMS dispatch failed:', err.message);
    });

    return res.status(201).json({ success: true, message: 'Order placed successfully', data: orderWithItems });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getOrders(req: AuthRequest, res: Response) {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const buildWhere = () => {
      const conditions: any[] = [isNull(ordersTable.deletedAt)];
      if (status && status !== 'ALL') conditions.push(eq(ordersTable.orderStatus, status as any));
      if (search) {
        const q = `%${String(search).trim()}%`;
        conditions.push(or(
          ilike(ordersTable.orderNumber, q),
          ilike(ordersTable.customerName, q),
          ilike(ordersTable.customerPhone, q),
        ));
      }
      return and(...conditions);
    };

    const [orders, totalResult] = await Promise.all([
      rdb().query.ordersTable.findMany({
        where: buildWhere(),
        with: { items: true },
        orderBy: desc(ordersTable.createdAt),
        limit: take,
        offset: skip,
      }),
      rdb().select({ count: count() }).from(ordersTable).where(buildWhere()),
    ]);

    const total = Number(totalResult[0].count);
    return res.json({
      success: true,
      data: orders,
      pagination: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function updateOrderStatus(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);
    const { orderStatus, note } = req.body;

    const [updated] = await db.update(ordersTable)
      .set({ orderStatus: orderStatus as any })
      .where(eq(ordersTable.id, id))
      .returning();

    if (note) {
      await db.insert(orderStatusHistoriesTable).values({
        orderId: id,
        status: String(orderStatus),
        note,
        changedBy: (req as any).user?.name || 'Admin',
      });
    }

    // Kafka — status change event
    const kafkaEvent: OrderStatusChangedEvent = {
      type: 'order.status_changed',
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      customerName: updated.customerName,
      customerPhone: updated.customerPhone,
      previousStatus: (updated as any)._prevStatus || orderStatus,
      newStatus: orderStatus,
      changedAt: new Date().toISOString(),
    };
    KafkaClient.publish(TOPICS.ORDER_EVENTS, kafkaEvent).catch(() => {});

    // RabbitMQ — SMS notification job
    SmsService.onStatusChanged(updated, orderStatus).catch(() => {});

    return res.json({ success: true, message: 'Order status updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function publicTrackOrder(req: Request, res: Response) {
  try {
    const query = String(req.query.query || '').trim();
    if (!query) {
      return res.status(400).json({ success: false, message: 'Please provide an Order Number or Phone Number.' });
    }

    const cleanPhone = query.replace(/[^0-9]/g, '');

    const conditions: any[] = [
      isNull(ordersTable.deletedAt),
      or(
        eq(ordersTable.orderNumber, query),
        eq(ordersTable.id, query),
        ...(ordersTable.courierTrackingCode ? [eq(ordersTable.courierTrackingCode, query)] : []),
        ...(cleanPhone.length >= 8 ? [ilike(ordersTable.customerPhone, `%${cleanPhone.slice(-8)}%`)] : []),
      ),
    ];

    const orders = await rdb().query.ordersTable.findMany({
      where: and(...conditions),
      with: {
        items: true,
        statusHistory: { orderBy: ordersTable.createdAt },
      },
      orderBy: desc(ordersTable.createdAt),
      limit: 5,
    });

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found matching this Order Number or Phone Number.' });
    }

    return res.json({ success: true, data: orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function recordAbandonedLead(req: Request, res: Response) {
  try {
    const { customerName, customerPhone, address, district, cartItems, total } = req.body;
    if (!customerPhone || customerPhone.replace(/[^0-9]/g, '').length < 8) {
      return res.status(400).json({ success: false, message: 'Valid phone number is required.' });
    }

    const clean = customerPhone.replace(/[^0-9]/g, '').slice(-8);

    const existing = await rdb()
      .select()
      .from(abandonedLeadsTable)
      .where(and(
        ilike(abandonedLeadsTable.customerPhone, `%${clean}%`),
        eq(abandonedLeadsTable.isRecovered, false),
        gte(abandonedLeadsTable.createdAt, new Date(Date.now() - 2 * 60 * 60 * 1000)),
      ))
      .limit(1)
      .then(r => r[0] ?? null);

    let lead;
    if (existing) {
      [lead] = await db.update(abandonedLeadsTable).set({
        customerName: customerName || existing.customerName,
        address: address || existing.address,
        district: district || existing.district,
        cartItems: cartItems ? (cartItems as any) : existing.cartItems,
        total: total !== undefined ? Number(total) : existing.total,
      }).where(eq(abandonedLeadsTable.id, existing.id)).returning();
    } else {
      [lead] = await db.insert(abandonedLeadsTable).values({
        customerName: customerName || 'Guest Shopper',
        customerPhone,
        address: address || '',
        district: district || 'Dhaka',
        cartItems: cartItems ? (cartItems as any) : null,
        total: total !== undefined ? Number(total) : 0,
      }).returning();
    }

    return res.json({ success: true, data: lead });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getAbandonedLeads(req: Request, res: Response) {
  try {
    const leads = await rdb()
      .select()
      .from(abandonedLeadsTable)
      .orderBy(desc(abandonedLeadsTable.createdAt))
      .limit(100);
    return res.json({ success: true, data: leads });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function markLeadRecovered(req: Request, res: Response) {
  try {
    const id = String(req.params.id);
    const [updated] = await db.update(abandonedLeadsTable)
      .set({ isRecovered: true })
      .where(eq(abandonedLeadsTable.id, id))
      .returning();
    return res.json({ success: true, data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
