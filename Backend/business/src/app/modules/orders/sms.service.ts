import { RabbitMQ } from '../../shared/rabbitmq.js';
import { QUEUES, SmsJob } from '../../shared/events.js';
import { infoLogger } from '../../utils/logger.js';

// Formats an SMS message and pushes it to the SMS queue via RabbitMQ.
// The actual SMS API call is handled by the store-management SMS consumer.
export const SmsService = {
  async onOrderPlaced(order: any): Promise<void> {
    if (!order?.customerPhone) return;

    const job: SmsJob = {
      to: order.customerPhone,
      message: `Dear ${order.customerName}, your order #${order.orderNumber} (Total: ৳${order.total}) has been placed successfully. We will confirm shortly. Thank you!`,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };

    RabbitMQ.publish(QUEUES.SMS_NOTIFICATIONS, job);
    infoLogger.info(`[SmsService] Order placed SMS queued for ${order.customerPhone}`);
  },

  async onStatusChanged(order: any, newStatus: string): Promise<void> {
    if (!order?.customerPhone) return;

    const messages: Record<string, string> = {
      CONFIRMED: `Your order #${order.orderNumber} has been confirmed and is being prepared.`,
      PROCESSING: `Your order #${order.orderNumber} is now being processed.`,
      SHIPPED: `Great news! Your order #${order.orderNumber} has been shipped and is on its way.`,
      DELIVERED: `Your order #${order.orderNumber} has been delivered. Thank you for shopping with us!`,
      CANCELLED: `Your order #${order.orderNumber} has been cancelled. Contact us for support.`,
    };

    const text = messages[newStatus];
    if (!text) return;

    const job: SmsJob = {
      to: order.customerPhone,
      message: `Dear ${order.customerName}, ${text}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };

    RabbitMQ.publish(QUEUES.SMS_NOTIFICATIONS, job);
    infoLogger.info(`[SmsService] Status change SMS queued for ${order.customerPhone} (${newStatus})`);
  },
};
