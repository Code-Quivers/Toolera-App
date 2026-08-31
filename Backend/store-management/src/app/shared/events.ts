// Canonical event shapes — kept identical across both services.

export type OrderStatus =
  | 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';

export const TOPICS = {
  ORDER_EVENTS: 'order-events',
  INVENTORY_EVENTS: 'inventory-events',
  AUDIT_EVENTS: 'audit-events',
} as const;

export const QUEUES = {
  SMS_NOTIFICATIONS: 'sms.notifications',
  EMAIL_NOTIFICATIONS: 'email.notifications',
  SUBSCRIPTION_ACTIVATE: 'subscription.activate',
} as const;

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
  previousStatus: string;
  newStatus: string;
  changedAt: string;
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
