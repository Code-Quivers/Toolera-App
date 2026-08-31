// Background consumers — started once at server boot.
// RabbitMQ: subscription.activate, sms.notifications
// Kafka: order-events (analytics / revenue tracking)

import { RabbitMQ } from '../shared/rabbitmq.js';
import { KafkaClient } from '../shared/kafka.js';
import { QUEUES, TOPICS, SubscriptionActivateJob, SmsJob, OrderCreatedEvent, OrderStatusChangedEvent } from '../shared/events.js';
import { infoLogger, errorLogger } from '../utils/logger.js';
import { db, rdb } from '../db/index.js';
import { subscriptionsTable, storesTable } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// ── RabbitMQ: subscription activation ─────────────────────────────────────────
async function handleSubscriptionActivate(job: SubscriptionActivateJob): Promise<void> {
  infoLogger.info(`[Consumer] subscription.activate received — orderId: ${job.orderId}, amount: ${job.amount}`);

  // If storeId is missing, we cannot activate — log and skip.
  // (business service can enrich this later with a store lookup via internal API)
  if (!job.storeId) {
    infoLogger.info('[Consumer] subscription.activate: no storeId — skipping auto-activation');
    return;
  }

  const store = await rdb().select().from(storesTable).where(eq(storesTable.id, job.storeId)).limit(1).then(r => r[0] ?? null);
  if (!store) {
    errorLogger.error(`[Consumer] subscription.activate: store ${job.storeId} not found`);
    return;
  }

  // Mark subscription as ACTIVE (or extend it)
  await db.update(subscriptionsTable)
    .set({
      status: 'ACTIVE',
      lastPaymentTrxId: job.transactionId,
      lastPaymentAmount: job.amount,
      lastPaymentDate: new Date(),
    })
    .where(eq(subscriptionsTable.storeId, job.storeId));

  infoLogger.info(`[Consumer] subscription.activate: store ${job.storeId} subscription activated`);
}

// ── RabbitMQ: SMS notifications ───────────────────────────────────────────────
async function handleSmsNotification(job: SmsJob): Promise<void> {
  infoLogger.info(`[Consumer] sms.notifications — to: ${job.to}, msg: ${job.message.slice(0, 60)}...`);

  const apiKey = process.env.SMS_API_KEY || '';
  const senderId = process.env.SMS_SENDER_ID || '';

  if (!apiKey) {
    infoLogger.info('[Consumer] sms.notifications: SMS_API_KEY not set — SMS skipped');
    return;
  }

  try {
    // Green Web BD / BulkSMS BD API — replace with your provider
    const params = new URLSearchParams({
      api_key: apiKey,
      senderid: senderId,
      type: 'text',
      contacts: job.to.replace(/[^0-9]/g, ''),
      msg: job.message,
    });

    const res = await fetch(`https://api.greenweb.com.bd/api.php?${params}`);
    const body = await res.text();
    infoLogger.info(`[Consumer] SMS sent to ${job.to}: ${body}`);
  } catch (err: any) {
    errorLogger.error(`[Consumer] SMS delivery failed for ${job.to}:`, err.message);
    throw err; // RabbitMQ will nack and dead-letter
  }
}

// ── Kafka: order events ────────────────────────────────────────────────────────
async function handleOrderEvent(event: OrderCreatedEvent | OrderStatusChangedEvent): Promise<void> {
  if (event.type === 'order.created') {
    infoLogger.info(`[Consumer] order.created — #${event.orderNumber}, total: ৳${event.total}`);
    // Future: update revenue dashboards, trigger fulfillment workflows
  } else if (event.type === 'order.status_changed') {
    infoLogger.info(`[Consumer] order.status_changed — #${event.orderNumber}: ${(event as any).newStatus}`);
    // Future: update shipment tracking, push to admin real-time feed
  }
}

// ── Bootstrap all consumers ───────────────────────────────────────────────────
export async function startConsumers(): Promise<void> {
  // RabbitMQ consumers
  await RabbitMQ.consume(QUEUES.SUBSCRIPTION_ACTIVATE, handleSubscriptionActivate);
  await RabbitMQ.consume(QUEUES.SMS_NOTIFICATIONS, handleSmsNotification);

  // Kafka consumers
  await KafkaClient.subscribeAndRun(
    'store-management-order-group',
    TOPICS.ORDER_EVENTS,
    handleOrderEvent
  );

  infoLogger.info('[Consumers] All message consumers started');
}
