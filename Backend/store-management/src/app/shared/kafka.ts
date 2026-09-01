import { Kafka, Producer, Consumer, logLevel } from 'kafkajs';
import { infoLogger, errorLogger } from '../utils/logger.js';
import { TOPICS } from './events.js';

const BROKERS = (process.env.KAFKA_BROKERS || 'localhost:9092').split(',');
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || 'store-management-service';

const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: BROKERS,
  logLevel: logLevel.ERROR,
  retry: { initialRetryTime: 300, retries: 2 },
});

let producer: Producer | null = null;

export const KafkaClient = {
  async connectProducer(): Promise<void> {
    try {
      producer = kafka.producer();
      await producer.connect();
      infoLogger.info('[Kafka] Producer connected');
    } catch (err: any) {
      errorLogger.error('[Kafka] Producer connect failed:', err.message);
    }
  },

  async publish(topic: string, event: object): Promise<void> {
    if (!producer) {
      errorLogger.error('[Kafka] Producer not ready');
      return;
    }
    try {
      await producer.send({
        topic,
        messages: [{ value: JSON.stringify(event), timestamp: Date.now().toString() }],
      });
    } catch (err: any) {
      errorLogger.error(`[Kafka] Publish failed on ${topic}:`, err.message);
    }
  },

  async subscribeAndRun(
    groupId: string,
    topic: string,
    handler: (event: any) => Promise<void>
  ): Promise<Consumer> {
    const consumer = kafka.consumer({ groupId });
    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });
    await consumer.run({
      eachMessage: async ({ message }) => {
        if (!message.value) return;
        try {
          await handler(JSON.parse(message.value.toString()));
        } catch (err: any) {
          errorLogger.error(`[Kafka] Handler error on ${topic}:`, err.message);
        }
      },
    });
    infoLogger.info(`[Kafka] Subscribed to topic: ${topic} (group: ${groupId})`);
    return consumer;
  },

  async disconnectProducer(): Promise<void> {
    try {
      await producer?.disconnect();
    } catch {}
  },
};
