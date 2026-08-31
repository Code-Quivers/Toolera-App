import { RedisClient } from './shared/redis.js';
import { RabbitMQ } from './shared/rabbitmq.js';
import { KafkaClient } from './shared/kafka.js';
import { infoLogger, errorLogger } from './utils/logger.js';
import app from './app.js';

const PORT = process.env.PORT || 5002;

const start = async () => {
  await RedisClient.connect();
  await RabbitMQ.connect();
  await KafkaClient.connectProducer();

  const server = app.listen(PORT, () => {
    infoLogger.info(`[Business Service] running on port ${PORT}`);
    infoLogger.info(`[Health] http://localhost:${PORT}/health`);
  });

  const shutdown = async (signal: string) => {
    infoLogger.info(`${signal} received — shutting down`);
    server.close(async () => {
      await Promise.all([
        RedisClient.disconnect(),
        RabbitMQ.disconnect(),
        KafkaClient.disconnectProducer(),
      ]);
      process.exit(0);
    });
  };

  process.on('unhandledRejection', (err: any) => {
    errorLogger.error('Unhandled rejection:', err?.message ?? err);
    server.close(async () => {
      await Promise.all([
        RedisClient.disconnect(),
        RabbitMQ.disconnect(),
        KafkaClient.disconnectProducer(),
      ]);
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();
