// Canonical event shapes shared across both services.
// Kafka and RabbitMQ both carry these payloads as JSON.

export type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export type PaymentMethod = 'COD' | 'BKASH' | 'NAGAD' | 'CARD';

// ── Kafka topics ──────────────────────────────────────────────────────────────
export const TOPICS = {
  ORDER_EVENTS: 'order-events',
  INVENTORY_EVENTS: 'inventory-events',
  AUDIT_EVENTS: 'audit-events',
} as const;

// ── RabbitMQ queues ───────────────────────────────────────────────────────────
export const QUEUES = {
  SMS_NOTIFICATIONS: 'sms.notifications',
  EMAIL_NOTIFICATIONS: 'email.notifications',
  SUBSCRIPTION_ACTIVATE: 'subscription.activate',
} as const;

// ── Event payloads ────────────────────────────────────────────────────────────

export interface OrderCreatedEvent {
  type: 'order.created';
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  total: number;
  paymentMethod: string;
  itemCount: number;
  createdAt: string;
}

export interface OrderStatusChangedEvent {
  type: 'order.status_changed';
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  previousStatus: OrderStatus;
  newStatus: OrderStatus;
  changedAt: string;
}

export interface StockChangedEvent {
  type: 'inventory.stock_changed';
  productId: string;
  productTitle: string;
  sku: string | null;
  previousStock: number;
  newStock: number;
  isLow: boolean;       // true when newStock <= lowStockThreshold
  changedAt: string;
}

export interface PaymentConfirmedEvent {
  type: 'payment.confirmed';
  orderId: string;
  orderNumber: string;
  amount: number;
  provider: string;
  transactionId: string;
  customerPhone: string;
  confirmedAt: string;
}

export interface SmsJob {
  to: string;
  message: string;
  orderId?: string;
  orderNumber?: string;
}

export interface SubscriptionActivateJob {
  storeId?: string;
  orderId: string;
  amount: number;
  transactionId: string;
  provider: string;
}

export interface AuditEvent {
  type: string;
  service: string;
  entityType: string;
  entityId: string;
  actorId?: string;
  actorEmail?: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}
