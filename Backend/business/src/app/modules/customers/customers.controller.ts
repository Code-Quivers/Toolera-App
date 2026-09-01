import { Request, Response } from 'express';
import { isNull, desc, count, ilike, or } from 'drizzle-orm';
import { rdb } from '../../db/index.js';
import { ordersTable } from '../../db/schema.js';

export async function getCustomers(req: Request, res: Response) {
  try {
    const { search, limit = 50, page = 1 } = req.query;
    const take = Math.min(Number(limit), 200);
    const skip = (Number(page) - 1) * take;

    // Derive unique customers from orders table
    const allOrders = await rdb()
      .select({
        customerName: ordersTable.customerName,
        customerPhone: ordersTable.customerPhone,
        address: ordersTable.address,
        district: ordersTable.district,
        total: ordersTable.total,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .where(isNull(ordersTable.deletedAt))
      .orderBy(desc(ordersTable.createdAt));

    // Aggregate by phone
    const customerMap = new Map<string, any>();
    for (const o of allOrders) {
      const phone = o.customerPhone;
      if (!customerMap.has(phone)) {
        customerMap.set(phone, {
          id: phone,
          name: o.customerName,
          phone,
          address: o.address,
          district: o.district,
          totalSpent: 0,
          ordersCount: 0,
          lastOrderAt: o.createdAt,
        });
      }
      const c = customerMap.get(phone)!;
      c.totalSpent += Number(o.total) || 0;
      c.ordersCount += 1;
    }

    let customers = Array.from(customerMap.values());

    if (search) {
      const q = String(search).toLowerCase();
      customers = customers.filter(
        c => c.name.toLowerCase().includes(q) || c.phone.includes(q)
      );
    }

    const total = customers.length;
    const paginated = customers.slice(skip, skip + take);

    return res.json({
      success: true,
      data: paginated,
      pagination: { total, page: Number(page), limit: take, totalPages: Math.ceil(total / take) },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function getCustomerCount(req: Request, res: Response) {
  try {
    const rows = await rdb()
      .select({ phone: ordersTable.customerPhone })
      .from(ordersTable)
      .where(isNull(ordersTable.deletedAt));
    const unique = new Set(rows.map(r => r.customerPhone)).size;
    return res.json({ success: true, data: { count: unique } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
