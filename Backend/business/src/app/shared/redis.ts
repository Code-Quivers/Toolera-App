import { SetOptions, createClient } from 'redis';
import { config } from '../config/index.js';
import { errorLogger, infoLogger } from '../utils/logger.js';

const redisClient = createClient({ url: config.redis.url });
const redisPubClient = createClient({ url: config.redis.url });
const redisSubClient = createClient({ url: config.redis.url });

type RedisEventEmitter = { on(event: string, listener: (...args: any[]) => void): void };

const handleError = (clientName: string, error: unknown) => {
  errorLogger.error(`${clientName} error:`, error);
};

(redisClient as RedisEventEmitter).on('error', (error) => handleError('Redis Client', error));
(redisPubClient as RedisEventEmitter).on('error', (error) => handleError('Redis Pub Client', error));
(redisSubClient as RedisEventEmitter).on('error', (error) => handleError('Redis Sub Client', error));

(redisClient as RedisEventEmitter).on('connect', () => {
  infoLogger.info(`Redis client connected to ${config.redis.url}`);
});

// ── Utility functions ─────────────────────────────────────────────────────────

const set = async (key: string, value: string, options?: SetOptions): Promise<void> => {
  try {
    await redisClient.set(key, value, options);
    infoLogger.info(`Key set: ${key}`);
  } catch (error) {
    errorLogger.error(`Failed to set key: ${key}`, error);
  }
};

const get = async (key: string): Promise<string | null> => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    errorLogger.error(`Failed to get key: ${key}`, error);
    return null;
  }
};

const del = async (key: string): Promise<void> => {
  try {
    await redisClient.del(key);
    infoLogger.info(`Key deleted: ${key}`);
  } catch (error) {
    errorLogger.error(`Failed to delete key: ${key}`, error);
  }
};

// ── Access token helpers ──────────────────────────────────────────────────────

const setAccessToken = async (userId: string, token: string): Promise<void> => {
  await set(`access-token:${userId}`, token, { EX: Number(config.redis.expiresIn) });
};

const getAccessToken = async (userId: string): Promise<string | null> => {
  return await get(`access-token:${userId}`);
};

const delAccessToken = async (userId: string): Promise<void> => {
  await del(`access-token:${userId}`);
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────

const connect = async (): Promise<void> => {
  try {
    await Promise.all([
      redisClient.connect(),
      redisPubClient.connect(),
      redisSubClient.connect(),
    ]);
    infoLogger.info('All Redis clients connected successfully.');
  } catch (error) {
    errorLogger.error('Failed to connect Redis clients.', error);
    process.exit(1);
  }
};

const disconnect = async (): Promise<void> => {
  try {
    await Promise.all([redisClient.quit(), redisPubClient.quit(), redisSubClient.quit()]);
    infoLogger.info('All Redis clients disconnected successfully.');
  } catch (error) {
    errorLogger.error('Failed to disconnect Redis clients.', error);
  }
};

export const RedisClient = {
  connect,
  disconnect,
  set,
  get,
  del,
  setAccessToken,
  getAccessToken,
  delAccessToken,
  publish: redisPubClient.publish.bind(redisPubClient),
  subscribe: redisSubClient.subscribe.bind(redisSubClient),
};
