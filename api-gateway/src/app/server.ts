import { config } from './config/index.js';
import { RedisClient } from './shared/redis.js';
import { infoLogger, errorLogger } from './utils/logger.js';
import app from './app.js';

const start = async () => {
  // Connect to Redis before accepting requests
  await RedisClient.connect();

  const server = app.listen(config.port, () => {
    infoLogger.info(`[API Gateway] running on port ${config.port}`);
    infoLogger.info(`[Health] http://localhost:${config.port}/health`);
    infoLogger.info(`[→ Store Management] ${config.services.storeManagement}`);
    infoLogger.info(`[→ Business Service] ${config.services.business}`);
  });

  const shutdown = async (signal: string) => {
    infoLogger.info(`${signal} received — shutting down`);
    server.close(async () => {
      await RedisClient.disconnect();
      process.exit(0);
    });
  };

  process.on('unhandledRejection', (err: any) => {
    errorLogger.error('[API Gateway] Unhandled rejection:', err?.message ?? err);
    server.close(async () => {
      await RedisClient.disconnect();
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

start();
