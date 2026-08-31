import amqplib, { Channel, Connection } from 'amqplib';
import { infoLogger, errorLogger } from '../utils/logger.js';
import { QUEUES } from './events.js';

let connection: Connection | null = null;
let channel: Channel | null = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';

const ALL_QUEUES = Object.values(QUEUES);

export const RabbitMQ = {
  async connect(): Promise<void> {
    try {
      connection = await amqplib.connect(RABBITMQ_URL);
      channel = await (connection as any).createChannel();

      for (const q of ALL_QUEUES) {
        await channel!.assertQueue(q, { durable: true });
      }

      (connection as any).on('error', (err: Error) => {
        errorLogger.error('[RabbitMQ] Connection error:', err.message);
      });
      (connection as any).on('close', () => {
        errorLogger.error('[RabbitMQ] Connection closed — reconnecting in 5s');
        setTimeout(() => RabbitMQ.connect(), 5000);
      });

      infoLogger.info('[RabbitMQ] Connected and queues asserted');
    } catch (err: any) {
      errorLogger.error('[RabbitMQ] Failed to connect:', err.message);
      setTimeout(() => RabbitMQ.connect(), 5000);
    }
  },

  publish(queue: string, payload: object): void {
    if (!channel) {
      errorLogger.error('[RabbitMQ] Cannot publish — channel not ready');
      return;
    }
    try {
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
    } catch (err: any) {
      errorLogger.error(`[RabbitMQ] Publish failed on ${queue}:`, err.message);
    }
  },

  async consume(queue: string, handler: (payload: any) => Promise<void>): Promise<void> {
    if (!channel) {
      errorLogger.error('[RabbitMQ] Cannot consume — channel not ready');
      return;
    }
    await channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const payload = JSON.parse(msg.content.toString());
        await handler(payload);
        channel!.ack(msg);
      } catch (err: any) {
        errorLogger.error(`[RabbitMQ] Handler error on ${queue}:`, err.message);
        channel!.nack(msg, false, false); // dead-letter, don't requeue infinitely
      }
    });
    infoLogger.info(`[RabbitMQ] Consuming queue: ${queue}`);
  },

  async disconnect(): Promise<void> {
    try {
      await channel?.close();
      await (connection as any)?.close();
    } catch {}
  },
};
